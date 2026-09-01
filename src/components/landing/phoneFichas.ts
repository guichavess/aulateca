/**
 * As fichas que o celular da landing mostra.
 *
 * São fichas REAIS do acervo (`src/lib/atividades.data.ts`), com as capas que
 * já estão servidas de `public/atividades/`. Antes eram invenções — "Bingo do
 * Nome", "Aeroporto da Leitura" — e a landing exibia um catálogo que ninguém
 * ia encontrar depois de pagar.
 *
 * Ficam copiadas aqui, e não importadas de `atividades.data.ts`, porque aquele
 * módulo carrega as 54 fichas inteiras (com descrição, uuid e caminho de PDF) e
 * arrastá-lo para o bundle da landing custa caro por nada. `HeroPhone.test.tsx`
 * confere título por título contra o acervo de verdade, então a cópia não pode
 * divergir em silêncio.
 */

export interface FichaDoCelular {
  titulo: string;
  /** Rótulo de faixa etária como a Home escreve (`AGES` em HomePage.tsx). */
  ano: string;
  /** Cor da categoria — ver `categoryColorMap` em `src/lib/data.ts`. */
  cor: string;
  capa: string;
}

const LUDICA = "#E63F87";
const PRODUCAO = "#5B47E0";
const INTERPRETACAO = "#2BA89E";

/** Grade da Home. Cobre as três categorias e as duas faixas de ano do acervo. */
export const fichasDestaque: FichaDoCelular[] = [
  {
    titulo: "Bingo das Palavras",
    ano: "1° ao 3° ano",
    cor: LUDICA,
    capa: "/atividades/ludica/bingo-das-palavras/capa.webp",
  },
  {
    titulo: "Roleta da Imaginação",
    ano: "1° ao 3° ano",
    cor: PRODUCAO,
    capa: "/atividades/ludica/roleta-da-imaginacao/capa.webp",
  },
  {
    titulo: "Óculos do Detetive",
    ano: "4° e 5° ano",
    cor: INTERPRETACAO,
    capa: "/atividades/ludica/oculos-do-detetive/capa.webp",
  },
  {
    titulo: "Hospital das Frases",
    ano: "4° e 5° ano",
    cor: LUDICA,
    capa: "/atividades/ludica/hospital-das-frases/capa.webp",
  },
];

/** Lista de "Seus Favoritos ❤️". */
export const fichasFavoritas: FichaDoCelular[] = [
  {
    titulo: "Desafio das Rimas",
    ano: "1° ao 3° ano",
    cor: LUDICA,
    capa: "/atividades/ludica/desafio-das-rimas/capa.webp",
  },
  {
    titulo: "Cartas das Emoções",
    ano: "1° ao 3° ano",
    cor: PRODUCAO,
    capa: "/atividades/ludica/cartas-das-emocoes/capa.webp",
  },
  {
    titulo: "Quebra-Cabeça dos Parágrafos",
    ano: "4° e 5° ano",
    cor: INTERPRETACAO,
    capa: "/atividades/ludica/quebra-cabeca-dos-paragrafos/capa.webp",
  },
];

/**
 * Chips de categoria da Home. Rótulo e emoji saem de `categories`
 * (`src/lib/data.ts`) — repetidos aqui pelo mesmo motivo das fichas.
 */
export const chipsDeCategoria = [
  { label: "Todos", icon: "✦" },
  { label: "Produção de Texto", icon: "✍️" },
  { label: "Interpretação de Texto", icon: "📖" },
  { label: "Atividades Lúdicas", icon: "🎲" },
];

/** Chips de ano escolar. Espelham `AGES` em `src/pages/home/HomePage.tsx`. */
export const chipsDeAno = [
  { label: "Todas" },
  { label: "1° ao 3° ano" },
  { label: "4° e 5° ano" },
  { label: "6° ao 9° ano" },
];

/**
 * A pessoa que a landing mostra logada. O mesmo nome aparece no e-mail do
 * tutorial, no formulário de `/criar-acesso` e na saudação da Home — é uma
 * história só, do pagamento até a primeira ficha.
 */
export const PESSOA = {
  nome: "Maria",
  nomeCompleto: "Maria Silva",
  email: "maria@email.com",
  papel: "Professor(a)",
};
