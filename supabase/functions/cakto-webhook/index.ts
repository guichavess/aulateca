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
 *   5. DEPOIS de responder, avisa o comprador por e-mail (ver `email.ts`)
 *
 * O passo 5 fica fora da resposta de propósito, via `EdgeRuntime.waitUntil`:
 * um erro do provedor de e-mail não pode transformar uma venda já aplicada em
 * webhook com falha. O acesso está no banco; o e-mail é recuperável pelo admin.
 *
 * Deploy:
 *   supabase secrets set CAKTO_WEBHOOK_SECRET='<segredo>'
 *   supabase secrets set RESEND_API_KEY='re_...' APP_URL='https://aulateca.com.br'
 *   supabase secrets set ACCESS_LINK_SECRET='<segredo longo>' SUPPORT_EMAIL='...'
 *   supabase functions deploy cakto-webhook --no-verify-jwt
 */
import { createClient, type SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2.49.4';
import { decide, normalize, parseSecrets, secretMatches, type Decision } from './cakto.ts';
import { buildAccessLink, decideEmail, renderAccessEmail, type EntitlementEmailState } from './email.ts';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const ACCEPTED_SECRETS = parseSecrets(Deno.env.get('CAKTO_WEBHOOK_SECRET'));
const ALLOWED_PRODUCTS = parseSecrets(Deno.env.get('CAKTO_PRODUCT_IDS'));

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY') ?? '';
const APP_URL = Deno.env.get('APP_URL') ?? 'https://aulateca.com.br';
const ACCESS_LINK_SECRET = Deno.env.get('ACCESS_LINK_SECRET') ?? '';
const SUPPORT_EMAIL = Deno.env.get('SUPPORT_EMAIL') ?? '';
const EMAIL_FROM = Deno.env.get('ACCESS_EMAIL_FROM') ?? 'Aulateca <nao-responda@aulateca.com.br>';

// `EdgeRuntime` é global do runtime do Supabase e não existe nos tipos do Deno.
declare const EdgeRuntime: { waitUntil(promise: Promise<unknown>): void } | undefined;

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

    // Depois da resposta, nunca antes: a Cakto não faz retentativa e não pode
    // receber erro por causa de um e-mail.
    agendar(notificarComprador(supabase, decision, result.entitlement ?? null, evt.customerName));

    // A linha do acesso fica de fora do corpo: a resposta vai para a Cakto e não
    // há motivo para devolver a ela dados da nossa base.
    const { entitlement: _row, ...resumo } = result;
    return json(200, { ok: true, event: evt.event, action: decision.action, ...resumo });
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

/** Linha do acesso depois da gravação — é o que decide o e-mail. */
type ApplyResult = Record<string, unknown> & {
  entitlement?: (EntitlementEmailState & { id: string; email: string; product_name: string | null }) | null;
};

/** Executa a decisão. Lança em erro de banco — quem chama registra em process_error. */
async function apply(supabase: SupabaseClient, decision: Decision): Promise<ApplyResult> {
  if (decision.action === 'log') {
    return { reason: decision.reason };
  }

  if (decision.action === 'grant') {
    const e = decision.entitlement;
    // `granted_at` fica de fora de propósito: no INSERT vem do default e no
    // UPDATE (renovação) não é tocado — a data da primeira compra é o que
    // interessa no histórico do cliente.
    const { data: row, error } = await supabase.from('cakto_entitlements').upsert(
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
    )
      // O SELECT vem do upsert para não haver roundtrip extra nem janela entre
      // gravar e ler. `user_id` já vem preenchido pelo trigger da 011 quando a
      // conta existe — é ele que escolhe qual dos dois e-mails sai. E
      // `access_email_sent_at` é preservado no conflito (não está no update),
      // que é o que impede a renovação mensal de reenviar o convite.
      .select('id, email, user_id, product_name, access_email_sent_at')
      .single();

    if (error) throw new Error(`upsert do acesso falhou: ${error.message}`);
    return { email: e.email, kind: e.kind, entitlement: row };
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

// ── aviso ao comprador ─────────────────────────────────────────────────────

/**
 * Roda a tarefa depois da resposta. Fora do runtime do Supabase (teste local
 * com `deno run`, por exemplo) `EdgeRuntime` não existe: neste caso a promessa
 * fica solta com o erro tratado, o que é aceitável porque o e-mail é sempre
 * recuperável pela linha em `cakto_entitlements`.
 */
function agendar(task: Promise<unknown>): void {
  const safe = task.catch((err) => console.error('tarefa pós-resposta falhou', err));
  if (typeof EdgeRuntime !== 'undefined' && EdgeRuntime) EdgeRuntime.waitUntil(safe);
}

/**
 * Manda o e-mail de acesso e registra o resultado na própria linha do acesso.
 *
 * Nunca lança: chamada depois da resposta, uma exceção aqui não teria quem a
 * lesse. O que importa é o rastro — `access_email_error` preenchido faz a linha
 * aparecer na fila de reenvio do admin, que é como o suporte responde ao
 * "paguei e não recebi".
 */
async function notificarComprador(
  supabase: SupabaseClient,
  decision: Decision,
  entitlement: ApplyResult['entitlement'],
  customerName: string | null,
): Promise<void> {
  const escolha = decideEmail(entitlement ?? null, decision.action);
  if (!escolha.send) {
    console.log(`e-mail não enviado: ${escolha.reason}`);
    return;
  }

  const row = entitlement!;

  if (!RESEND_API_KEY) {
    // Falha explícita e visível: sem chave, o comprador não é avisado, e isso
    // precisa aparecer no admin em vez de sumir num log.
    console.error('RESEND_API_KEY não configurado — comprador não avisado');
    await registrarEnvio(supabase, row.id, 'RESEND_API_KEY não configurado');
    return;
  }

  try {
    const link = await buildAccessLink(APP_URL, row.email, ACCESS_LINK_SECRET);
    const conteudo = renderAccessEmail({
      template: escolha.template,
      link,
      loginUrl: `${APP_URL.replace(/\/+$/, '')}/login`,
      customerName,
      productName: row.product_name,
      supportEmail: SUPPORT_EMAIL,
    });

    const resposta = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        authorization: `Bearer ${RESEND_API_KEY}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        from: EMAIL_FROM,
        to: [row.email],
        subject: conteudo.subject,
        html: conteudo.html,
        text: conteudo.text,
        // O comprador vai responder este e-mail quando algo der errado; sem
        // reply-to a resposta morre numa caixa que ninguém lê.
        ...(SUPPORT_EMAIL ? { reply_to: SUPPORT_EMAIL } : {}),
      }),
    });

    if (!resposta.ok) {
      const detalhe = await resposta.text().catch(() => '');
      throw new Error(`Resend respondeu ${resposta.status}: ${detalhe.slice(0, 500)}`);
    }

    await registrarEnvio(supabase, row.id, null);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('envio do e-mail de acesso falhou', message);
    await registrarEnvio(supabase, row.id, message);
  }
}

/** `erro = null` marca enviado; erro preenchido deixa a linha na fila do admin. */
async function registrarEnvio(
  supabase: SupabaseClient,
  entitlementId: string,
  erro: string | null,
): Promise<void> {
  const { error } = await supabase
    .from('cakto_entitlements')
    .update(
      erro
        ? { access_email_error: erro }
        : { access_email_sent_at: new Date().toISOString(), access_email_error: null },
    )
    .eq('id', entitlementId);

  if (error) console.error('não consegui registrar o envio do e-mail', error);
}
