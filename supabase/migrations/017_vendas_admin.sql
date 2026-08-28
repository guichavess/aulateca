-- ════════════════════════════════════════════════════════════════════════════
-- 017 — A visão de vendas passa a mostrar o estado do e-mail de acesso.
--
-- A view `cakto_access_overview` nasceu na 011, antes de existir envio de
-- e-mail. A 015 acrescentou `access_email_sent_at` e `access_email_error` em
-- `cakto_entitlements`, mas a view continuou sem elas — ou seja: a única tela
-- que o suporte tem para responder "paguei e não recebi nada" não enxergava
-- justamente a coluna que responde isso.
--
-- Também entram `subscription_id` e `created_at`: o primeiro é o que se procura
-- no painel da Cakto quando o cliente reclama de cobrança, o segundo separa
-- "quando a linha nasceu" de `granted_at`, que a renovação empurra para frente.
--
-- `create or replace view` só aceita ACRESCENTAR colunas no fim, e é o que
-- fazemos — a ordem das colunas antigas fica intacta.
--
-- security_invoker segue valendo: quem consulta é quem manda. Sem a policy
-- "admin vê todos os acessos" (011), esta view não devolve linha de terceiro
-- nem para quem souber o nome dela.
--
-- Idempotente: pode rodar múltiplas vezes.
-- ════════════════════════════════════════════════════════════════════════════

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
  ) as is_active,
  -- Colunas novas (015): a fila de "comprou e não recebeu o link".
  e.access_email_sent_at,
  e.access_email_error,
  e.subscription_id,
  e.created_at
from public.cakto_entitlements e
left join public.profiles p on p.id = e.user_id;

-- ════════════════════════════════════════════════════════════════════════════
-- APÓS APLICAR
--
-- Regenerar os tipos do frontend, senão o TypeScript continua achando que a
-- view tem as colunas antigas:
--
--   npm run db:types
--
-- Conferência rápida (rodando como admin):
--
--   select email, is_active, access_email_sent_at, access_email_error
--   from public.cakto_access_overview
--   order by granted_at desc
--   limit 20;
--
-- A fila que o suporte precisa ver — comprou, acesso vale, e-mail não saiu:
--
--   select email, granted_at, access_email_error
--   from public.cakto_access_overview
--   where is_active and access_email_sent_at is null
--   order by granted_at;
-- ════════════════════════════════════════════════════════════════════════════
