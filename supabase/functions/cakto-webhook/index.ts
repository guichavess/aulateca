/**
 * Endpoint que recebe os webhooks da Cakto e libera/derruba o acesso ao Aulateca.
 *
 * Por que Edge Function e não o backend FastAPI: o serviço de IA roda no plano
 * gratuito do Render, que hiberna e leva ~50s para acordar. A Cakto não tem
 * retentativa — "qualquer resposta é interpretada como entregue com sucesso" —
 * então um cold start no momento errado é uma venda que nunca libera acesso.
 * A Edge Function fica ligada e ao lado do banco.
 *
 * Ordem das operações (importa):
 *   1. valida o segredo  → sem ele, nada é gravado (o endpoint é público)
 *   2. grava o payload cru → antes de qualquer regra: evento gravado é evento
 *      recuperável, mesmo se o passo 3 explodir
 *   3. aplica o efeito no acesso
 *   4. carimba processed_at / process_error na linha do passo 2
 *
 * Deploy:
 *   supabase secrets set CAKTO_WEBHOOK_SECRET='<segredo>'
 *   supabase functions deploy cakto-webhook --no-verify-jwt
 */
import { createClient, type SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2.49.4';
import { decide, normalize, parseSecrets, secretMatches, type Decision } from './cakto.ts';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const ACCEPTED_SECRETS = parseSecrets(Deno.env.get('CAKTO_WEBHOOK_SECRET'));
const ALLOWED_PRODUCTS = parseSecrets(Deno.env.get('CAKTO_PRODUCT_IDS'));

const json = (status: number, body: Record<string, unknown>) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });

Deno.serve(async (req: Request) => {
  if (req.method !== 'POST') {
    return json(405, { ok: false, error: 'use POST' });
  }

  // Sem segredo configurado o endpoint aceitaria qualquer coisa. Falhar fechado
  // é a única opção: um acesso concedido por engano vira produto de graça.
  if (ACCEPTED_SECRETS.length === 0) {
    console.error('CAKTO_WEBHOOK_SECRET não configurado — recusando o webhook');
    return json(500, { ok: false, error: 'webhook não configurado' });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return json(400, { ok: false, error: 'corpo não é JSON' });
  }

  const secret = (body as { secret?: unknown } | null)?.secret;
  if (!secretMatches(secret, ACCEPTED_SECRETS)) {
    // Sem detalhe no corpo da resposta: quem chamou não precisa saber se errou
    // o segredo ou o formato.
    console.warn('webhook recusado: segredo inválido');
    return json(401, { ok: false, error: 'não autorizado' });
  }

  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const evt = normalize(body);

  // O payload inteiro é guardado, MENOS o segredo: ele é credencial e a tabela
  // é lida pelo painel admin.
  const { secret: _omit, ...payloadSemSegredo } = body as Record<string, unknown>;

  const { data: inserted, error: insertError } = await supabase
    .from('cakto_events')
    .insert({
      event: evt.event,
      order_id: evt.orderId,
      ref_id: evt.refId,
      subscription_id: evt.subscriptionId,
      customer_email: evt.customerEmail,
      customer_name: evt.customerName,
      product_id: evt.productId,
      offer_id: evt.offerId,
      status: evt.status,
      amount: evt.amount,
      payment_method: evt.paymentMethod,
      dedupe_key: evt.dedupeKey,
      payload: payloadSemSegredo,
    })
    .select('id')
    .single();

  if (insertError) {
    // 23505 = unique violation no dedupe_key: a Cakto reenviou o mesmo evento.
    // Já foi processado, então 200 e ponto.
    if (insertError.code === '23505') {
      return json(200, { ok: true, duplicate: true, event: evt.event });
    }
    console.error('falha ao gravar cakto_events', insertError);
    return json(500, { ok: false, error: 'falha ao registrar o evento' });
  }

  const eventId = inserted.id as string;
  const decision = decide(evt, ALLOWED_PRODUCTS);

  try {
    const result = await apply(supabase, decision);
    await supabase
      .from('cakto_events')
      .update({ processed_at: new Date().toISOString(), process_error: null })
      .eq('id', eventId);

    return json(200, { ok: true, event: evt.event, action: decision.action, ...result });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('falha ao aplicar o efeito no acesso', message);

    // O evento está gravado: dá para reprocessar consultando
    // `select * from cakto_events where processed_at is null`.
    await supabase
      .from('cakto_events')
      .update({ process_error: message })
      .eq('id', eventId);

    return json(202, { ok: false, event: evt.event, error: 'evento registrado, acesso não aplicado' });
  }
});

/** Executa a decisão. Lança em erro de banco — quem chama registra em process_error. */
async function apply(
  supabase: SupabaseClient,
  decision: Decision,
): Promise<Record<string, unknown>> {
  if (decision.action === 'log') {
    return { reason: decision.reason };
  }

  if (decision.action === 'grant') {
    const e = decision.entitlement;
    // `granted_at` fica de fora de propósito: no INSERT vem do default e no
    // UPDATE (renovação) não é tocado — a data da primeira compra é o que
    // interessa no histórico do cliente.
    const { error } = await supabase.from('cakto_entitlements').upsert(
      {
        email: e.email,
        kind: e.kind,
        status: 'active',
        source_key: e.sourceKey,
        product_id: e.productId,
        product_name: e.productName,
        offer_id: e.offerId,
        order_id: e.orderId,
        ref_id: e.refId,
        subscription_id: e.subscriptionId,
        expires_at: e.expiresAt,
        // Recompra ou renovação depois de um chargeback limpa a marca antiga.
        revoked_at: null,
        revoke_reason: null,
        last_event: 'grant',
        last_event_at: new Date().toISOString(),
      },
      { onConflict: 'source_key' },
    );
    if (error) throw new Error(`upsert do acesso falhou: ${error.message}`);
    return { email: e.email, kind: e.kind };
  }

  // cancel e revoke agem sobre uma linha que já deveria existir.
  const { data: row, error: findError } = await supabase
    .from('cakto_entitlements')
    .select('id, expires_at')
    .eq('source_key', decision.sourceKey)
    .maybeSingle();

  if (findError) throw new Error(`busca do acesso falhou: ${findError.message}`);

  if (!row) {
    // Acontece se o evento de compra nunca chegou (webhook cadastrado depois da
    // venda, por exemplo). Não é erro fatal: fica registrado para conciliação.
    return { warning: `nenhum acesso para ${decision.sourceKey}` };
  }

  const now = new Date().toISOString();

  if (decision.action === 'revoke') {
    // Reembolso e chargeback derrubam na hora — o dinheiro voltou.
    const { error } = await supabase
      .from('cakto_entitlements')
      .update({
        status: 'revoked',
        revoked_at: now,
        revoke_reason: decision.reason,
        last_event: decision.reason,
        last_event_at: now,
      })
      .eq('id', row.id);
    if (error) throw new Error(`revogação falhou: ${error.message}`);
    return { revoked: decision.sourceKey };
  }

  // cancel: a assinatura não renova mais, mas o período pago continua valendo.
  // O payload de cancelamento traz next_payment_date null, então a data de fim
  // é a que já estava na linha (gravada na última cobrança aprovada). Se não
  // houver nenhuma, o corte é agora — has_active_access() não dá acesso a
  // `canceled` sem expires_at.
  const { error } = await supabase
    .from('cakto_entitlements')
    .update({
      status: 'canceled',
      expires_at: row.expires_at ?? now,
      last_event: decision.reason,
      last_event_at: now,
    })
    .eq('id', row.id);
  if (error) throw new Error(`cancelamento falhou: ${error.message}`);
  return { canceled: decision.sourceKey, accessUntil: row.expires_at ?? now };
}
