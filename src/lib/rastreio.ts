// ════════════════════════════════════════════════════════════════════════════
// Eventos de conversão da landing.
//
// Os pixels (Meta e Utmify) são carregados por blocos inline no `index.html`,
// fora do alcance do TypeScript. Este módulo é a única ponte entre o React e
// eles — se um dia trocar de ferramenta, muda aqui e não em cada botão.
//
// ⚠️ O evento do clique é `InitiateCheckout`, **não** `Purchase`. A distinção
// não é preciosismo de nomenclatura: quem clica no CTA vai para o checkout da
// Cakto e ainda pode desistir com o cartão na mão. Marcar isso como compra faz
// o gerenciador da Meta otimizar para quem clica em vez de quem paga, e infla
// a receita relatada pelo tamanho da taxa de desistência — um funil de 100
// cliques e 8 vendas apareceria como 100 vendas.
//
// O `Purchase` de verdade pertence ao webhook da Cakto
// (`supabase/functions/cakto-webhook/`), que é quem sabe que o dinheiro entrou.
// ════════════════════════════════════════════════════════════════════════════

import { totalMensalCentavos } from '@/lib/oferta';

type Fbq = (
  comando: 'track' | 'trackCustom' | 'init',
  evento: string,
  parametros?: Record<string, unknown>,
) => void;

/**
 * O `fbq` pode não existir, e isso é esperado — não é defeito a tratar.
 *
 * O bloco no `index.html` não roda em `/criar-acesso` nem nas rotas de senha
 * (elas levam dado do comprador na URL), o bloqueador de anúncio do visitante
 * derruba o `fbevents.js`, e nos testes ninguém carrega a Meta. Em todos esses
 * casos o certo é não rastrear e deixar a navegação seguir — nunca estourar
 * uma exceção no meio do clique de compra.
 */
const fbq = (): Fbq | null => {
  const candidato = (window as unknown as { fbq?: unknown }).fbq;
  return typeof candidato === 'function' ? (candidato as Fbq) : null;
};

/**
 * Dispara `InitiateCheckout` quando o visitante sai da landing para a Cakto.
 *
 * O valor vai em reais e inclui a taxa de serviço, porque é o total que a
 * pessoa vê no checkout — relatar o preço sem a taxa desencontra o número da
 * Meta do número da Cakto, e a diferença aparece só na conciliação.
 */
export function rastrearInicioDeCheckout(): void {
  fbq()?.('track', 'InitiateCheckout', {
    value: totalMensalCentavos / 100,
    currency: 'BRL',
  });
}
