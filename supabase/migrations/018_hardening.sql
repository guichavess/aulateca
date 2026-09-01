-- ════════════════════════════════════════════════════════════════════════════
-- 018 — Fecha a superfície SQL que sobrou e para de acumular access_attempts.
--
-- Dois achados da varredura de 30/08/2026, ambos pequenos e ambos reais:
--
-- 1. `increment_downloads` (001:83) é a ÚNICA função `security definer` do
--    projeto sem `search_path` fixo — a 006 e a 011 fixaram em todas as outras.
--    Sem ele, quem consegue criar um schema no `search_path` da sessão pode
--    fazer a função enxergar outra tabela `resources`. É o achado clássico do
--    linter do Supabase, e o conserto é uma linha.
--
--    De quebra: a função é `security definer`, então ignora a RLS da 015 —
--    qualquer autenticado, com ou sem compra, podia inflar o contador de
--    download de qualquer ficha. Passa a exigir acesso pago, que é a mesma
--    condição para o download existir.
--
-- 2. `access_attempts` (015) só cresce. A própria 015 já sugeria a limpeza no
--    rodapé, mas sugestão em comentário não roda. Vira job diário do pg_cron.
--
-- Idempotente: pode rodar de novo sem efeito colateral.
-- ════════════════════════════════════════════════════════════════════════════

-- ── 1. increment_downloads: search_path fixo + acesso pago ─────────────────
create or replace function public.increment_downloads(resource_id uuid)
returns void
language sql
security definer
set search_path = public
as $$
  update public.resources
     set downloads = downloads + 1
   where id = resource_id
     and public.has_active_access();
$$;

-- `create or replace` NÃO redefine as permissões, e o default do Postgres é
-- `execute` para `public` — ou seja, também para o anon. Só quem está logado
-- baixa; só quem está logado conta download.
revoke all on function public.increment_downloads(uuid) from public;
revoke all on function public.increment_downloads(uuid) from anon;
grant execute on function public.increment_downloads(uuid) to authenticated;

-- ── 2. Limpeza diária de access_attempts ───────────────────────────────────
-- A tabela é o registro de tentativas de acesso indevido: serve para detectar
-- abuso na janela recente, não como histórico. 7 dias é o que a 015 sugeriu.
--
-- O `do` existe porque `pg_cron` é extensão opcional: sem ela, `cron.schedule`
-- não existe e a migration quebraria em qualquer ambiente que não a habilitou
-- (o CLI local, por exemplo). Onde não houver, a limpeza fica manual — está
-- registrado no bloco "APÓS APLICAR".
do $$
begin
  if exists (select 1 from pg_extension where extname = 'pg_cron') then
    perform cron.schedule(
      'limpar-access-attempts',
      '17 4 * * *',
      $cron$delete from public.access_attempts where created_at < now() - interval '7 days'$cron$
    );
  else
    raise notice 'pg_cron ausente: limpeza de access_attempts NAO foi agendada.';
  end if;
end;
$$;

-- Independente do agendamento, limpa o que já está acumulado.
delete from public.access_attempts where created_at < now() - interval '7 days';

-- ════════════════════════════════════════════════════════════════════════════
-- APÓS APLICAR
--
-- 1. Conferir que o search_path realmente entrou (migration escrita já divergiu
--    de migration aplicada neste projeto mais de uma vez):
--
--      select proname, prosecdef, proconfig
--        from pg_proc
--       where proname = 'increment_downloads';
--
--    Esperado: prosecdef = true e proconfig = {search_path=public}.
--
-- 2. Conferir que o anon perdeu o execute:
--
--      select has_function_privilege('anon', 'public.increment_downloads(uuid)', 'execute');
--
--    Esperado: false.
--
-- 3. Conferir o job (só existe se pg_cron estiver habilitado):
--
--      select jobname, schedule from cron.job where jobname = 'limpar-access-attempts';
--
--    Se vier vazio, habilitar pg_cron em Database → Extensions e rodar esta
--    migration de novo. Sem ela, rodar o delete acima na mão de tempos em
--    tempos — a tabela é pequena, mas cresce para sempre.
-- ════════════════════════════════════════════════════════════════════════════
