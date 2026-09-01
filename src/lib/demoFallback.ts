// ════════════════════════════════════════════════════════════════════════════
// Acervo de demonstração — desligado por padrão, e isso é o ponto.
//
// O fallback nasceu para a tela não ficar vazia numa demo, e em demo ele
// resolve. Em produção o efeito é outro: com o Supabase fora do ar, o professor
// vê a grade cheia, clica, e o download morre — o arquivo depende de URL
// assinada que um banco caído não vai assinar. É um erro honesto trocado por um
// produto que parece funcionar e não funciona, e de quebra apaga o sinal de que
// algo caiu.
//
// Por isso o mock passou a ser uma escolha explícita (VITE_DEMO_FALLBACK=true),
// nunca o comportamento acidental de uma lista vazia. E quando está ligado, a
// tela diz que está.
// ════════════════════════════════════════════════════════════════════════════

export const demoFallbackAtivo = import.meta.env.VITE_DEMO_FALLBACK === 'true';
