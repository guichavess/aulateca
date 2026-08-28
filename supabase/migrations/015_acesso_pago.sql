-- ════════════════════════════════════════════════════════════════════════════
-- 015 — O acesso pago passa a valer de verdade
--
-- A 011 montou o encanamento (webhook → cakto_events → cakto_entitlements) e
-- criou `has_active_access()`, mas a função nunca foi chamada por policy
-- nenhuma: até aqui, qualquer conta grátis via o produto inteiro. Pior, os PDFs
-- moram em `public/atividades/` e são baixáveis por URL direta, sem sessão.
--
-- Esta migration fecha os dois buracos e prepara o envio do e-mail de acesso:
--
--   1. Colunas de controle do e-mail de acesso, para o envio ser idempotente —
--      renovação mensal não pode reenviar "crie seu acesso" todo mês.
--   2. `access_attempts`, o rate limit server-side da Edge Function
--      `criar-acesso`. Ele é obrigatório: a função responde `sem_compra` para
--      e-mail que não comprou, o que permitiria enumeração sem freio.
--   3. Policies pagas nas tabelas que SÃO o produto.
--   4. Bucket privado `atividades` — é este item que faz o paywall existir.
--
-- Nota de desempenho: toda chamada aparece como `(select public.has_active_access())`.
-- Envolvida em subquery, o Postgres avalia a função UMA vez por query em vez de
-- uma vez por linha. Em catálogo com centenas de linhas a diferença é o produto
-- abrir ou travar.
--
-- Idempotente: pode rodar múltiplas vezes.
-- ════════════════════════════════════════════════════════════════════════════

-- ── 1. Controle de envio do e-mail de acesso ───────────────────────────────
-- Preenchido pela Edge Function `cakto-webhook` depois de responder à Cakto.
-- `access_email_sent_at` não nulo = já avisamos este comprador, não reenviar.
-- `access_email_error` guarda a falha para a linha aparecer no admin de vendas
-- e o suporte reenviar à mão — e-mail que não sai é venda que não entra.
alter table public.cakto_entitlements
  add column if not exists access_email_sent_at timestamptz,
  add column if not exists access_email_error   text;

-- Fila de reenvio manual: quem comprou e ainda não recebeu o link.
create index if not exists idx_cakto_entitlements_email_pendente
  on public.cakto_entitlements (granted_at)
  where access_email_sent_at is null;

-- ── 2. Rate limit server-side ──────────────────────────────────────────────
-- Uma linha por tentativa de criar acesso ou recuperar senha. A Edge Function
-- conta as tentativas recentes por e-mail e por IP antes de responder.
--
-- O IP é gravado como hash, não em claro: é dado pessoal (LGPD, art. 5º, I) e,
-- para contar tentativas, o hash serve igual. `email` é normalizado em
-- minúsculas pela função, como no resto da integração.
create table if not exists public.access_attempts (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('criar_acesso', 'recuperar_senha')),
  email text,
  ip_hash text,
  created_at timestamptz not null default now()
);

-- A consulta é sempre "tentativas desta chave na última hora".
create index if not exists idx_access_attempts_email
  on public.access_attempts (email, created_at desc);

create index if not exists idx_access_attempts_ip
  on public.access_attempts (ip_hash, created_at desc);

-- Serve à limpeza periódica (a tabela é puro descartável).
create index if not exists idx_access_attempts_created
  on public.access_attempts (created_at);

alter table public.access_attempts enable row level security;

-- Nenhuma policy, de propósito: só a service_role (Edge Function) escreve e lê.
-- Expor a contagem ao cliente entregaria o mapa do próprio rate limit, e a
-- tabela lista e-mails de compradores.

-- ── 3. Policies pagas ──────────────────────────────────────────────────────
-- `resources` era `using (true)` desde a 001 (001:97): o acervo inteiro visível
-- para qualquer conta. É o produto — passa a exigir acesso.
drop policy if exists "recursos visíveis para todos" on public.resources;
drop policy if exists "recursos visíveis para quem tem acesso" on public.resources;
create policy "recursos visíveis para quem tem acesso"
  on public.resources for select to authenticated
  using ((select public.has_active_access()));

-- A comunidade é benefício pago: ler e escrever exigem acesso. Sem isto,
-- alguém sem compra continuaria dentro da parte social do produto.
drop policy if exists "posts visíveis para todos" on public.community_posts;
drop policy if exists "posts visíveis para quem tem acesso" on public.community_posts;
create policy "posts visíveis para quem tem acesso"
  on public.community_posts for select to authenticated
  using ((select public.has_active_access()));

drop policy if exists "usuário cria post" on public.community_posts;
create policy "usuário cria post"
  on public.community_posts for insert to authenticated
  with check (auth.uid() = author_id and (select public.has_active_access()));

drop policy if exists "comentários visíveis para todos" on public.post_comments;
drop policy if exists "comentários visíveis para quem tem acesso" on public.post_comments;
create policy "comentários visíveis para quem tem acesso"
  on public.post_comments for select to authenticated
  using ((select public.has_active_access()));

drop policy if exists "usuário comenta" on public.post_comments;
create policy "usuário comenta"
  on public.post_comments for insert to authenticated
  with check (auth.uid() = author_id and (select public.has_active_access()));

drop policy if exists "likes visíveis para todos" on public.post_likes;
drop policy if exists "likes visíveis para quem tem acesso" on public.post_likes;
create policy "likes visíveis para quem tem acesso"
  on public.post_likes for select to authenticated
  using ((select public.has_active_access()));

-- `for all` cobre insert/update/delete; o `with check` separado é o que impede
-- curtir sem acesso (o `using` sozinho só governaria a leitura da linha).
drop policy if exists "usuário gerencia like" on public.post_likes;
create policy "usuário gerencia like"
  on public.post_likes for all to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id and (select public.has_active_access()));

-- Deliberadamente INTOCADOS:
--   favorites          → favoritar não é o produto, e a lista é do usuário.
--   public_activities  → é marketing, precisa continuar aberto.
--   profiles           → quem perdeu o acesso ainda tem que ler o próprio
--                        perfil para a tela de "acesso encerrado" carregar.
--   cakto_entitlements → é por ele que a pessoa descobre POR QUE perdeu acesso.
--
-- ADMIN não regride: has_active_access() já devolve true para admin (011:210).

-- ── 4. Bucket privado das atividades ───────────────────────────────────────
-- Sem esta parte, todo o resto é enfeite: os PDFs são o produto e hoje saem
-- pela Vercel em URL pública. Bucket privado + policy = o download passa a ser
-- decidido pelo servidor, via URL assinada.
--
-- As capas (`capa.webp`) NÃO vêm para cá: continuam em `public/`, são vitrine.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'atividades',
  'atividades',
  false,
  20971520, -- 20 MB; a maior ficha do acervo hoje tem menos de 2 MB
  array['application/pdf']
)
on conflict (id) do update
  set public             = excluded.public,
      file_size_limit    = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- Leitura só para quem tem acesso pago. Bucket privado exige URL assinada, e o
-- Storage só assina o que esta policy permitir — então a recusa acontece no
-- servidor, antes de existir link algum.
drop policy if exists "atividades para quem tem acesso" on storage.objects;
create policy "atividades para quem tem acesso"
  on storage.objects for select to authenticated
  using (bucket_id = 'atividades' and (select public.has_active_access()));

-- Escrita: nenhuma policy. Os PDFs sobem pelo script de deploy com a
-- service_role (scripts/upload-atividades.mjs, Fase 5), nunca pelo navegador.

-- ════════════════════════════════════════════════════════════════════════════
-- APÓS APLICAR
--
-- 1. Conferir que o acervo sumiu para quem não tem acesso e continua visível
--    para quem tem:
--
--      select count(*) from resources;   -- logado sem compra → 0
--
-- 2. Enquanto os PDFs não forem migrados (Fase 5), o bucket fica vazio e o
--    paywall do download ainda não vale: os arquivos seguem baixáveis por
--    `public/atividades/`. A migração dos arquivos é o que fecha o buraco.
--
-- 3. Limpeza de `access_attempts` (opcional, a tabela é pequena):
--
--      delete from public.access_attempts where created_at < now() - interval '7 days';
-- ════════════════════════════════════════════════════════════════════════════
