// ════════════════════════════════════════════════════════════════════════════
// `Purchase` para a API de Conversões da Meta.
//
// Por que aqui e não no navegador: o clique no CTA da landing dispara
// `InitiateCheckout` (`src/lib/rastreio.ts`) — o visitante ainda pode desistir
// com o cartão na mão. Quem sabe que o dinheiro entrou é este webhook, e é o
// único lugar do sistema que pode afirmar que houve compra. Um `Purchase`
// disparado no clique contaria toda desistência como venda e faria a Meta
// otimizar para quem clica em vez de quem paga.
//
// A ida à Meta acontece DEPOIS da resposta ao webhook (`agendar` no index.ts),
// pelo mesmo motivo do e-mail: a Cakto não faz retentativa e trata qualquer
// resposta como entregue. Uma instabilidade do graph.facebook.com não pode
// transformar uma venda já aplicada em webhook com falha.
//
// Deploy:
//   supabase secrets set META_PIXEL_ID='...' META_CAPI_TOKEN='...'
// ════════════════════════════════════════════════════════════════════════════

import type { NormalizedEvent } from './cakto.ts';

/** A versão fica presa: a Meta muda contrato entre versões sem avisar. */
const GRAPH_VERSION = 'v21.0';

export interface ConfigMeta {
  pixelId: string;
  token: string;
  /** Preenchido só enquanto se testa no "Eventos de Teste" do gerenciador. */
  testEventCode?: string;
}

/**
 * Lê a configuração do ambiente. Devolve `null` quando falta pixel ou token —
 * caso legítimo, não defeito: em ambiente local ninguém configura a Meta, e a
 * venda tem que continuar funcionando sem ela.
 */
export function configDoAmbiente(ler: (k: string) => string | undefined): ConfigMeta | null {
  const pixelId = ler('META_PIXEL_ID')?.trim() ?? '';
  const token = ler('META_CAPI_TOKEN')?.trim() ?? '';
  if (!pixelId || !token) return null;

  const testEventCode = ler('META_TEST_EVENT_CODE')?.trim();
  return { pixelId, token, ...(testEventCode ? { testEventCode } : {}) };
}

/**
 * SHA-256 em hexadecimal minúsculo, que é o formato exigido pela Meta.
 *
 * O e-mail nunca sai daqui em texto puro. Não é zelo decorativo: mandar e-mail
 * de comprador legível para um terceiro é tratamento de dado pessoal sem base
 * legal, e o hash é justamente o que permite a correspondência sem a entrega.
 */
export async function hashear(valor: string): Promise<string> {
  const normalizado = valor.trim().toLowerCase();
  const bytes = new TextEncoder().encode(normalizado);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Só compra aprovada vira `Purchase`.
 *
 * Reembolso e chargeback não são "venda negativa" para a Meta — o caminho deles
 * é a atualização do catálogo/conjunto, não um evento. E cancelamento de
 * assinatura não devolve dinheiro nenhum: o período pago continua valendo.
 * Mandar qualquer um dos três como Purchase inventaria receita.
 *
 * Renovação mensal entra: é dinheiro que entrou de verdade. Ela não infla a
 * atribuição do anúncio porque a janela padrão da Meta (7 dias de clique) já
 * expirou muito antes da segunda cobrança — a renovação aparece na receita
 * total, não como conversão daquele anúncio.
 */
export function deveEnviar(acao: string): boolean {
  return acao === 'grant';
}

export interface EventoPurchase {
  event_name: 'Purchase';
  event_time: number;
  event_id: string;
  action_source: 'website';
  event_source_url?: string;
  user_data: Record<string, string[] | string>;
  custom_data: Record<string, unknown>;
}

/**
 * Monta o evento. Separado do envio para poder ser testado sem rede.
 *
 * `event_id` usa a chave de deduplicação da Cakto: se a Cakto reenviar o mesmo
 * POST e ele passar pelo dedupe do banco, a Meta ainda descarta o repetido.
 * Duas redes de proteção porque venda contada duas vezes é erro que ninguém
 * percebe olhando o gerenciador.
 */
export async function montarEventoPurchase(
  evt: NormalizedEvent,
  opcoes: { valorPadrao: number; urlDaLoja: string; agoraEmSegundos?: number },
): Promise<EventoPurchase> {
  const user_data: Record<string, string[] | string> = {};
  if (evt.customerEmail) user_data.em = [await hashear(evt.customerEmail)];
  if (evt.customerName) {
    // A Meta espera nome e sobrenome separados e em campos próprios. Nome do
    // meio vai junto do sobrenome: errar a separação vale menos que não mandar.
    const partes = evt.customerName.trim().split(/\s+/);
    if (partes.length > 0 && partes[0]) user_data.fn = [await hashear(partes[0])];
    if (partes.length > 1) user_data.ln = [await hashear(partes.slice(1).join(' '))];
  }

  return {
    event_name: 'Purchase',
    event_time: opcoes.agoraEmSegundos ?? Math.floor(Date.now() / 1000),
    // `dedupeKey` só é nulo em `checkout_abandonment`, que nunca vira Purchase.
    event_id: evt.dedupeKey ?? `${evt.event}:${evt.orderId ?? evt.refId ?? 'sem-id'}`,
    // Não há `fbp`/`fbc` aqui: o webhook chega da Cakto, não do navegador do
    // comprador, então os cookies do pixel não existem nesta requisição. A
    // correspondência fica por conta do e-mail com hash — qualidade menor do
    // que a do evento do navegador, e é o teto do que dá para fazer server-side
    // sem a Cakto repassar os cookies.
    action_source: 'website',
    event_source_url: opcoes.urlDaLoja,
    user_data,
    custom_data: {
      currency: 'BRL',
      // `amount` vem da Cakto em reais. Se vier ausente (payload incompleto),
      // o preço anunciado é melhor estimativa do que zero: valor zerado faz a
      // Meta tratar a conversão como sem receita e estraga o ROAS.
      value: evt.amount ?? opcoes.valorPadrao,
      ...(evt.orderId ? { order_id: evt.orderId } : {}),
      ...(evt.productName ? { content_name: evt.productName } : {}),
      ...(evt.productId ? { content_ids: [evt.productId] } : {}),
    },
  };
}

/**
 * Manda o evento. Nunca lança: roda depois da resposta ao webhook, onde uma
 * exceção não teria quem a lesse. Devolve o motivo da falha para o log.
 */
export async function enviarPurchase(
  config: ConfigMeta,
  evento: EventoPurchase,
): Promise<{ ok: boolean; detalhe?: string }> {
  const url = `https://graph.facebook.com/${GRAPH_VERSION}/${config.pixelId}/events`;

  try {
    const resposta = await fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        data: [evento],
        // O token vai no corpo, não na query string: URL vaza em log de proxy
        // e em mensagem de erro, e este token dispara eventos em nome do pixel.
        access_token: config.token,
        ...(config.testEventCode ? { test_event_code: config.testEventCode } : {}),
      }),
    });

    if (!resposta.ok) {
      const detalhe = await resposta.text().catch(() => '');
      return { ok: false, detalhe: `Meta respondeu ${resposta.status}: ${detalhe.slice(0, 500)}` };
    }

    return { ok: true };
  } catch (err) {
    return { ok: false, detalhe: err instanceof Error ? err.message : String(err) };
  }
}
