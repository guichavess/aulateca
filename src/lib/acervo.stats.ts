// ════════════════════════════════════════════════════════════════════════════
// GERADO por scripts/build-atividades.mjs a partir de
// scripts/atividades.manifest.json. Não editar à mão: rode
//   node scripts/build-atividades.mjs
//
// Fonte única dos números que a landing anuncia. Se o acervo crescer, o texto
// da página de vendas acompanha sozinho — e nunca promete o que não existe.
// ════════════════════════════════════════════════════════════════════════════

export const totalAtividades = 54;

export const atividadesPorCategoria: Record<string, number> = {
  "interpretacao-texto": 7,
  "ludica": 30,
  "producao-texto": 17,
};

export const totalJogosLudicos = atividadesPorCategoria["ludica"] ?? 0;

export const totalExerciciosTexto =
  (atividadesPorCategoria["producao-texto"] ?? 0) +
  (atividadesPorCategoria["interpretacao-texto"] ?? 0);
