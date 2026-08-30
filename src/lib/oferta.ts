// ════════════════════════════════════════════════════════════════════════════
// A oferta do AulaTeca — fonte única do que a landing anuncia sobre preço.
//
// Estes valores precisam bater com a oferta configurada na Cakto, aberta por
// `VITE_CAKTO_CHECKOUT_URL`. Não há como conferir isso no build: a Cakto é
// externa e o preço vive lá. Então a regra é humana e vale a pena repetir —
// **mudou a oferta na Cakto, muda aqui no mesmo dia.** Anunciar um preço e
// cobrar outro no checkout é o tipo de divergência que o cliente descobre com o
// cartão na mão.
//
// ⚠️ DIVERGÊNCIA ABERTA EM 29/08/2026 — ler antes de publicar a landing.
// O valor abaixo (R$ 37,90) é o definido pelo gestor. O checkout que
// `VITE_CAKTO_CHECKOUT_URL` abre hoje ainda cobra **R$ 5,00/mês** — uma oferta
// que aparece no próprio checkout como "Oferta finalizada", com o cronômetro
// zerado, e que por isso parece ser a de teste citada em `CheckoutButton.tsx`.
// Enquanto a oferta na Cakto não for trocada, a página anuncia um preço e o
// checkout cobra outro. Registrado em `docs/pendencias-gestao.md`.
// ════════════════════════════════════════════════════════════════════════════

/** Em centavos, para não somar float. */
export const valorMensalCentavos = 3790;

/**
 * Taxa de serviço da Cakto, cobrada junto no checkout.
 *
 * ⚠️ Os R$ 0,99 foram medidos na oferta de R$ 5,00. A Cakto calcula a taxa por
 * oferta, então este número precisa ser reconferido no checkout novo — se ele
 * mudar e ninguém atualizar aqui, o total anunciado fica errado por centavos,
 * que é o tipo de erro que só aparece na reclamação do cliente.
 */
export const taxaServicoCentavos = 99;

export const totalMensalCentavos = valorMensalCentavos + taxaServicoCentavos;

/**
 * A cobrança é recorrente. Isto não é detalhe de copy: assinatura anunciada
 * como compra única é o motivo de estorno mais comum que existe, e o produto
 * chegou a ter "não existe assinatura" escrito na documentação enquanto a Cakto
 * cobrava renovação mensal. Se um dia virar compra única, este campo vira
 * `false` e o card para de escrever "por mês" sozinho.
 */
export const cobrancaRecorrente = true;

/**
 * Preço riscado ("DE R$ 97 POR..."). Fica `null` de propósito.
 *
 * O gestor confirmou que R$ 97 já foi praticado, e um preço-âncora só é legítimo
 * se for preço que existiu de verdade (CDC art. 37). O que falta não é a
 * confirmação — é a **comparabilidade**: R$ 97 foi cobrança única e a oferta de
 * hoje é assinatura mensal. Riscar um contra o outro compara coisas diferentes e
 * sugere um desconto que não é o que está acontecendo.
 *
 * Para ligar: preencher com o valor em centavos **da mesma modalidade** da
 * oferta atual, e registrar em `docs/pendencias-gestao.md` o período em que ele
 * valeu. O card já sabe desenhar o riscado quando este campo deixa de ser nulo.
 */
export const valorAnteriorCentavos: number | null = null;

/** "R$ 5,00" — sem "/mês", que é decisão de layout, não de dado. */
export const emReais = (centavos: number): string =>
  (centavos / 100).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
