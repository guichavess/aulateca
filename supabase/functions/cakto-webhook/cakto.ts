/**
 * Regras puras do webhook da Cakto — sem I/O, sem Deno, sem Supabase.
 *
 * Está separado do index.ts justamente para poder ser testado com o vitest do
 * projeto (`src/**` + `supabase/functions/**`), já que o resto da função só
 * roda no runtime Deno.
 *
 * Contrato da Cakto (docs em https://cakto-dece4a15.mintlify.app/webhooks):
 * todo POST chega como `{ secret, event, data }`.
 */

/** Eventos documentados pela Cakto. Um evento fora desta lista é logado, não quebra. */
export const CAKTO_EVENTS = [
  'purchase_approved',
  'purchase_refused',
  'pix_gerado',
  'boleto_gerado',
  'picpay_gerado',
  'refund',
  'chargeback',
  'subscription_canceled',
  'subscription_renewed',
  'checkout_abandonment',
] as const;

export type CaktoEventName = (typeof CAKTO_EVENTS)[number];

/**
 * Status que desmentem a aprovação. `purchase_approved` é, por si só, o sinal
 * de venda aprovada — conferimos o status apenas para não liberar acesso num
 * payload que se contradiz. A lista é de negativos (e não de positivos) para
 * que um status novo inventado pela Cakto libere o comprador em vez de trancá-lo
 * do lado de fora: o prejuízo de um acesso indevido é reversível por reembolso,
 * o de um cliente pagante sem acesso não é.
 */
export const DENIED_STATUSES = [
  'refused',
  'refunded',
  'chargeback',
  'in_protest',
  'waiting_payment',
] as const;

/** Dias de tolerância depois da data da próxima cobrança de uma assinatura. */
export const RENEWAL_GRACE_DAYS = 3;

export interface NormalizedEvent {
  event: string;
  orderId: string | null;
  refId: string | null;
  subscriptionId: string | null;
  customerEmail: string | null;
  customerName: string | null;
  productId: string | null;
  productName: string | null;
  productType: string | null;
  offerId: string | null;
  status: string | null;
  amount: number | null;
  paymentMethod: string | null;
  nextPaymentDate: string | null;
  /** Null quando o evento pode repetir legitimamente (abandono de checkout). */
  dedupeKey: string | null;
}

export interface EntitlementInput {
  email: string;
  kind: 'unique' | 'subscription';
  sourceKey: string;
  productId: string | null;
  productName: string | null;
  offerId: string | null;
  orderId: string | null;
  refId: string | null;
  subscriptionId: string | null;
  /** null = não expira (pagamento único). */
  expiresAt: string | null;
}

export type Decision =
  /** Concede ou renova o acesso. */
  | { action: 'grant'; entitlement: EntitlementInput }
  /** Assinatura cancelada: mantém o acesso até o fim do período já pago. */
  | { action: 'cancel'; sourceKey: string; reason: string }
  /** Reembolso/chargeback: derruba o acesso imediatamente. */
  | { action: 'revoke'; sourceKey: string; reason: string }
  /** Nada a fazer no acesso — o evento fica registrado em cakto_events. */
  | { action: 'log'; reason: string };

// ── helpers ────────────────────────────────────────────────────────────────

const str = (v: unknown): string | null => {
  if (typeof v === 'string') {
    const trimmed = v.trim();
    return trimmed === '' ? null : trimmed;
  }
  if (typeof v === 'number') return String(v);
  return null;
};

const num = (v: unknown): number | null => {
  if (typeof v === 'number' && Number.isFinite(v)) return v;
  if (typeof v === 'string' && v.trim() !== '') {
    const parsed = Number(v);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
};

const obj = (v: unknown): Record<string, unknown> =>
  v && typeof v === 'object' && !Array.isArray(v) ? (v as Record<string, unknown>) : {};

/**
 * Comparação em tempo constante. O segredo da Cakto viaja no corpo, então é a
 * única credencial que temos; `===` vaza o tamanho do prefixo correto por
 * tempo de resposta, e um webhook é um oráculo que qualquer um pode chamar.
 */
export function secretMatches(received: unknown, accepted: string[]): boolean {
  if (typeof received !== 'string' || received.length === 0) return false;
  let ok = false;
  for (const candidate of accepted) {
    if (candidate.length === 0) continue;
    // Sem short-circuit: percorre todos os candidatos e todos os caracteres.
    let diff = received.length ^ candidate.length;
    const len = Math.max(received.length, candidate.length);
    for (let i = 0; i < len; i++) {
      diff |= received.charCodeAt(i % received.length) ^ candidate.charCodeAt(i % candidate.length);
    }
    ok = ok || diff === 0;
  }
  return ok;
}

/** Lê a lista de segredos aceitos (vírgula separa, para permitir rotação). */
export function parseSecrets(raw: string | undefined | null): string[] {
  if (!raw) return [];
  return raw.split(',').map((s) => s.trim()).filter((s) => s.length > 0);
}

export function addDays(iso: string, days: number): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) throw new Error(`data inválida: ${iso}`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString();
}

// ── normalização ───────────────────────────────────────────────────────────

/**
 * Achata o payload nas colunas de `cakto_events`. Nunca lança: um payload
 * estranho vira uma linha com campos nulos, que é melhor do que evento perdido.
 */
export function normalize(body: unknown): NormalizedEvent {
  const root = obj(body);
  const data = obj(root.data);
  const customer = obj(data.customer);
  const product = obj(data.product);
  const offer = obj(data.offer);
  const subscription = obj(data.subscription);

  const event = str(root.event) ?? 'unknown';
  const orderId = str(data.id);
  const refId = str(data.refId);
  const status = str(data.status);

  return {
    event,
    orderId,
    refId,
    subscriptionId: str(subscription.id),
    customerEmail: str(customer.email)?.toLowerCase() ?? str(data.customerEmail)?.toLowerCase() ?? null,
    customerName: str(customer.name) ?? str(data.customerName),
    productId: str(product.id),
    productName: str(product.name),
    productType: str(product.type),
    offerId: str(offer.id),
    status,
    amount: num(data.amount) ?? num(offer.price),
    paymentMethod: str(data.paymentMethod),
    nextPaymentDate: str(subscription.next_payment_date),
    dedupeKey: dedupeKeyFor(event, orderId ?? refId, status),
  };
}

/**
 * `checkout_abandonment` é disparado toda vez que o cliente reentra no
 * checkout — a doc avisa explicitamente. Deduplicar apagaria leads legítimos,
 * então esse evento fica sem chave. Nos demais, evento + pedido + status
 * identifica a transição: a mesma assinatura renovada mês a mês gera pedidos
 * diferentes e passa, um reenvio do mesmo POST é barrado.
 */
export function dedupeKeyFor(
  event: string,
  orderRef: string | null,
  status: string | null,
): string | null {
  if (event === 'checkout_abandonment') return null;
  if (!orderRef) return null;
  return `${event}|${status ?? '-'}|${orderRef}`;
}

// ── decisão ────────────────────────────────────────────────────────────────

/**
 * Traduz o evento normalizado em efeito sobre o acesso.
 *
 * `allowedProducts` (opcional) restringe a liberação aos IDs dos nossos
 * produtos. Serve para o caso de o mesmo segredo ser reaproveitado em outro
 * produto da conta Cakto — sem isso, uma venda alheia liberaria o Aulateca.
 */
export function decide(evt: NormalizedEvent, allowedProducts: string[] = []): Decision {
  const isGrantEvent = evt.event === 'purchase_approved' || evt.event === 'subscription_renewed';
  const isRevokeEvent = evt.event === 'refund' || evt.event === 'chargeback';
  const isCancelEvent = evt.event === 'subscription_canceled';

  if (!isGrantEvent && !isRevokeEvent && !isCancelEvent) {
    return { action: 'log', reason: `evento sem efeito no acesso: ${evt.event}` };
  }

  const sourceKey = sourceKeyFor(evt);
  if (!sourceKey) {
    return { action: 'log', reason: 'payload sem id de pedido nem de assinatura' };
  }

  if (isRevokeEvent) {
    return { action: 'revoke', sourceKey, reason: evt.event };
  }

  if (isCancelEvent) {
    return { action: 'cancel', sourceKey, reason: evt.event };
  }

  // Daqui para baixo: concessão de acesso.
  if (!evt.customerEmail) {
    return { action: 'log', reason: 'venda aprovada sem e-mail do cliente' };
  }

  if (evt.status && (DENIED_STATUSES as readonly string[]).includes(evt.status)) {
    return { action: 'log', reason: `status não libera acesso: ${evt.status}` };
  }

  if (allowedProducts.length > 0 && (!evt.productId || !allowedProducts.includes(evt.productId))) {
    return { action: 'log', reason: `produto fora da lista liberada: ${evt.productId ?? 'sem id'}` };
  }

  const kind: 'unique' | 'subscription' =
    evt.productType === 'subscription' || evt.subscriptionId ? 'subscription' : 'unique';

  return {
    action: 'grant',
    entitlement: {
      email: evt.customerEmail,
      kind,
      sourceKey,
      productId: evt.productId,
      productName: evt.productName,
      offerId: evt.offerId,
      orderId: evt.orderId,
      refId: evt.refId,
      subscriptionId: evt.subscriptionId,
      expiresAt: expiresAtFor(kind, evt.nextPaymentDate),
    },
  };
}

/**
 * Identidade estável do acesso. A assinatura vem primeiro porque ela sobrevive
 * às renovações — cada renovação traz um `data.id` novo, e chavear pelo pedido
 * criaria uma linha nova por mês em vez de estender a existente.
 */
export function sourceKeyFor(evt: NormalizedEvent): string | null {
  if (evt.subscriptionId) return `sub:${evt.subscriptionId}`;
  if (evt.orderId) return `order:${evt.orderId}`;
  if (evt.refId) return `order:${evt.refId}`;
  return null;
}

/**
 * Pagamento único não expira. Assinatura vale até a próxima cobrança mais a
 * tolerância — sem ela, uma renovação processada com minutos de atraso tiraria
 * o acesso de quem está em dia.
 *
 * Assinatura sem `next_payment_date` fica sem expiração em vez de expirar
 * agora: o cancelamento e o reembolso já derrubam o acesso por evento próprio,
 * e trancar um assinante adimplente por causa de um campo ausente é o erro mais
 * caro dos dois.
 */
export function expiresAtFor(
  kind: 'unique' | 'subscription',
  nextPaymentDate: string | null,
): string | null {
  if (kind === 'unique' || !nextPaymentDate) return null;
  try {
    return addDays(nextPaymentDate, RENEWAL_GRACE_DAYS);
  } catch {
    return null;
  }
}
