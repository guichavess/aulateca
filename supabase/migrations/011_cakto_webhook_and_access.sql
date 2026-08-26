-- ════════════════════════════════════════════════════════════════════════════
-- 011 — Integração Cakto: recebimento de webhooks e liberação de acesso
--
-- A Cakto é a plataforma que vende o Aulateca. Quando uma venda é aprovada ela
-- dispara um POST para o nosso endpoint (Edge Function `cakto-webhook`), e é
-- esse POST — e só ele — que libera o acesso do comprador.
--
-- Três restrições do contrato da Cakto moldam este schema:
--
--   1. NÃO HÁ RETENTATIVA. A documentação diz que "a Cakto interpreta qualquer
--      resposta do seu sistema como entregue com sucesso". Um evento perdido é
--      uma venda perdida, sem segunda chance. Por isso o payload cru é gravado
--      em `cakto_events` ANTES de qualquer regra de negócio: se o processamento
--      falhar, a linha fica com `process_error` preenchido e dá para reprocessar
--      depois sem depender da Cakto reenviar.
--
--   2. A AUTENTICAÇÃO É UM CAMPO DO CORPO (`secret`), não uma assinatura HMAC.
--      Não dá para provar que o corpo não foi adulterado — só que quem chamou
--      conhece o segredo. Consequência: o segredo é tratado como credencial e
--      nunca chega ao navegador. Só a service_role escreve nestas tabelas; não
--      existe policy de INSERT/UPDATE/DELETE para usuário nenhum.
--
--   3. O COMPRADOR PAGA ANTES DE TER CONTA. O e-mail da Cakto é a única chave
--      disponível no momento da venda, então o acesso nasce vinculado ao
--      E-MAIL e é amarrado ao `user_id` depois — pelo trigger de cadastro
--      (compra antes da conta) ou pelo trigger da própria tabela (conta antes
--      da compra). Os dois caminhos existem e ambos acontecem na prática.
--
-- Idempotente: pode rodar múltiplas vezes.
-- ════════════════════════════════════════════════════════════════════════════

-- ── 1. Log cru de tudo que a Cakto envia ───────────────────────────────────
-- Fonte da verdade para auditoria, conciliação financeira e reprocessamento.
-- Guardamos o payload inteiro em jsonb porque a Cakto adiciona campos por
-- método de pagamento (pix, boleto, card) e por tipo de produto (subscription),
-- e não queremos perder nada que não previmos em coluna.
create table if not exists public.cakto_events (
  id uuid primary key default gen_random_uuid(),
  event text not null,
  order_id text,
  ref_id text,
  subscription_id text,
  customer_email text,
  customer_name text,
  product_id text,
  offer_id text,
  status text,
  amount numeric(12, 2),
  payment_method text,
  -- Chave de deduplicação. Null = evento que PODE repetir legitimamente
  -- (`checkout_abandonment` dispara "em todas as ocasiões", conforme a doc).
  dedupe_key text,
  payload jsonb not null,
  received_at timestamptz not null default now(),
  processed_at timestamptz,
  process_error text
);

-- Índice parcial: o unique só vale para quem tem dedupe_key, deixando os
-- eventos repetíveis passarem livres.
create unique index if not exists idx_cakto_events_dedupe
  on public.cakto_events (dedupe_key)
  where dedupe_key is not null;

create index if not exists idx_cakto_events_email
  on public.cakto_events (lower(customer_email), received_at desc);

create index if not exists idx_cakto_events_recent
  on public.cakto_events (received_at desc);

-- Fila de reprocessamento: o que entrou e não foi processado.
create index if not exists idx_cakto_events_pending
  on public.cakto_events (received_at)
  where processed_at is null;

-- ── 2. Acesso liberado (entitlement) ───────────────────────────────────────
-- Uma linha por compra que concede acesso. `source_key` identifica a origem de
-- forma estável: a assinatura (que sobrevive às renovações, cada uma com seu
-- pedido novo) ou o pedido único.
create table if not exists public.cakto_entitlements (
  id uuid primary key default gen_random_uuid(),

  -- Chave de negócio. Normalizada para minúsculas pelo trigger abaixo — a
  -- Cakto envia o e-mail como o cliente digitou no checkout.
  email text not null,
  user_id uuid references auth.users(id) on delete set null,

  -- `unique` = pagamento único (acesso vitalício, expires_at null).
  -- `subscription` = recorrente (expires_at acompanha next_payment_date).
  kind text not null default 'unique' check (kind in ('unique', 'subscription')),

  -- active   → acesso liberado
  -- canceled → assinatura cancelada, acesso mantido até expires_at (o cliente
  --            já pagou o período corrente; cortar antes seria calote nosso)
  -- revoked  → reembolso ou chargeback: acesso cai na hora
  -- expired  → reservado para uma rotina futura de limpeza; hoje a expiração é
  --            avaliada por expires_at, não por este campo
  status text not null default 'active'
    check (status in ('active', 'canceled', 'revoked', 'expired')),

  product_id text,
  product_name text,
  offer_id text,
  order_id text,
  ref_id text,
  subscription_id text,

  -- `sub:<id>` para recorrente, `order:<id>` para pagamento único.
  source_key text not null,

  granted_at timestamptz not null default now(),
  expires_at timestamptz,          -- null = não expira (pagamento único)
  revoked_at timestamptz,
  revoke_reason text,

  last_event text,
  last_event_at timestamptz,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists idx_cakto_entitlements_source
  on public.cakto_entitlements (source_key);

create index if not exists idx_cakto_entitlements_email
  on public.cakto_entitlements (email);

create index if not exists idx_cakto_entitlements_user
  on public.cakto_entitlements (user_id);

-- ── 3. Normalização de e-mail + vínculo automático com a conta ─────────────
-- Faz dois trabalhos que precisam valer para TODA escrita, inclusive as feitas
-- à mão no SQL editor: baixa o e-mail para minúsculas e, se já existir conta
-- com esse e-mail, preenche o user_id na hora.
create or replace function public.cakto_normalize_entitlement()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  new.email := lower(trim(new.email));

  if new.user_id is null then
    select id into new.user_id
    from auth.users
    where lower(email) = new.email
    limit 1;
  end if;

  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists trg_cakto_entitlements_normalize on public.cakto_entitlements;
create trigger trg_cakto_entitlements_normalize
  before insert or update on public.cakto_entitlements
  for each row execute function public.cakto_normalize_entitlement();

-- ── 4. O caminho inverso: cadastro depois da compra ────────────────────────
-- Mantém tudo que a 006 já fazia (nome, role filtrada, avatar) e acrescenta o
-- vínculo dos acessos que estavam esperando por este e-mail. É o caso comum:
-- a pessoa compra na Cakto e só então cria a conta.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, name, role, avatar_url)
  values (
    new.id,
    coalesce(
      nullif(new.raw_user_meta_data->>'name', ''),
      nullif(new.raw_user_meta_data->>'full_name', ''),
      split_part(new.email, '@', 1)
    ),
    public.self_assignable_role(new.raw_user_meta_data->>'role'),
    coalesce(
      nullif(new.raw_user_meta_data->>'avatar_url', ''),
      nullif(new.raw_user_meta_data->>'picture', '')
    )
  );

  -- Acessos comprados antes da conta existir ficam órfãos até aqui.
  update public.cakto_entitlements
     set user_id = new.id
   where user_id is null
     and email = lower(new.email);

  return new;
end;
$$;

-- ── 5. Leitura do acesso pelo app ──────────────────────────────────────────
-- Regra única de "tem acesso", em SQL, para poder ser usada dentro de policies
-- de tabelas pagas no futuro (`using (public.has_active_access())`).
--
-- `canceled` continua valendo enquanto expires_at estiver no futuro; e um
-- `canceled` sem expires_at NÃO dá acesso (a Edge Function preenche
-- expires_at = agora quando cancela sem período pago em aberto).
--
-- ADMIN entra sem compra: é quem opera a plataforma e precisa enxergar o
-- produto pago para suportar o cliente. Só vale para o próprio usuário logado
-- (is_admin() lê auth.uid()), então consultar o acesso de terceiro por p_user
-- continua respondendo a verdade daquele terceiro.
create or replace function public.has_active_access(p_user uuid default auth.uid())
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  -- coalesce: sem sessão, p_user e auth.uid() são null e a comparação também
  -- seria null — a função tem que devolver false, não desconhecido.
  select coalesce(p_user = auth.uid() and public.is_admin(), false) or exists (
    select 1
    from public.cakto_entitlements e
    where (
        e.user_id = p_user
        or e.email = lower((select u.email from auth.users u where u.id = p_user))
      )
      and (
        (e.status = 'active' and (e.expires_at is null or e.expires_at > now()))
        or (e.status = 'canceled' and e.expires_at is not null and e.expires_at > now())
      )
  );
$$;

grant execute on function public.has_active_access(uuid) to authenticated;

-- Autoatendimento para o caso raro de o vínculo não ter acontecido pelos
-- triggers (troca de e-mail da conta depois da compra, por exemplo).
-- Devolve quantos acessos foram vinculados.
create or replace function public.claim_cakto_entitlements()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_email text;
  v_count integer;
begin
  if auth.uid() is null then
    return 0;
  end if;

  select lower(email) into v_email from auth.users where id = auth.uid();
  if v_email is null then
    return 0;
  end if;

  update public.cakto_entitlements
     set user_id = auth.uid()
   where user_id is null
     and email = v_email;

  get diagnostics v_count = row_count;
  return v_count;
end;
$$;

grant execute on function public.claim_cakto_entitlements() to authenticated;

-- ── 6. RLS ─────────────────────────────────────────────────────────────────
alter table public.cakto_events enable row level security;
alter table public.cakto_entitlements enable row level security;

-- Eventos crus contêm dados pessoais do comprador (nome, telefone, documento,
-- valor pago) e o próprio `secret` está no payload. Só admin lê.
drop policy if exists "admin lê eventos da cakto" on public.cakto_events;
create policy "admin lê eventos da cakto"
  on public.cakto_events for select
  using (public.is_admin());

-- O usuário enxerga o próprio acesso. O casamento por e-mail usa o JWT em vez
-- de consultar auth.users: policy que lê outra tabela roda a cada linha e não
-- pode depender de permissão que o usuário não tem.
drop policy if exists "usuário vê o próprio acesso" on public.cakto_entitlements;
create policy "usuário vê o próprio acesso"
  on public.cakto_entitlements for select to authenticated
  using (
    user_id = auth.uid()
    or email = lower(auth.jwt() ->> 'email')
  );

drop policy if exists "admin vê todos os acessos" on public.cakto_entitlements;
create policy "admin vê todos os acessos"
  on public.cakto_entitlements for select
  using (public.is_admin());

-- Escrita: nenhuma policy de INSERT/UPDATE/DELETE, de propósito. Quem grava é
-- a Edge Function com a service_role, que passa por cima da RLS. Um acesso
-- concedido sem venda correspondente é fraude, e o único jeito de criar um é
-- com a chave secreta do projeto.

-- ── 7. Visão consolidada para o painel admin ───────────────────────────────
-- Junta acesso + conta para a tela de vendas não precisar de dois roundtrips.
-- security_invoker: a view respeita a RLS de quem consulta (só admin vê tudo).
create or replace view public.cakto_access_overview
with (security_invoker = true)
as
select
  e.id,
  e.email,
  e.user_id,
  p.name as user_name,
  e.kind,
  e.status,
  e.product_name,
  e.order_id,
  e.ref_id,
  e.granted_at,
  e.expires_at,
  e.revoked_at,
  e.revoke_reason,
  e.last_event,
  e.last_event_at,
  (
    (e.status = 'active' and (e.expires_at is null or e.expires_at > now()))
    or (e.status = 'canceled' and e.expires_at is not null and e.expires_at > now())
  ) as is_active
from public.cakto_entitlements e
left join public.profiles p on p.id = e.user_id;

-- ════════════════════════════════════════════════════════════════════════════
-- APÓS APLICAR
--
-- 1. Criar o segredo do webhook (qualquer string longa e aleatória) e guardá-lo
--    nos secrets da Edge Function:
--
--      supabase secrets set CAKTO_WEBHOOK_SECRET='<segredo>'
--
-- 2. Publicar a função SEM verificação de JWT (a Cakto não manda token):
--
--      supabase functions deploy cakto-webhook --no-verify-jwt
--
-- 3. Cadastrar a URL no painel da Cakto, com o MESMO segredo:
--
--      https://<project-ref>.supabase.co/functions/v1/cakto-webhook
--
-- Detalhes e teste de ponta a ponta em docs/integracao-cakto.md.
-- ════════════════════════════════════════════════════════════════════════════
