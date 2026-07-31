# Briefing de assets ilustrativos para o Nano Banana (Gemini)

Este documento é um briefing de **assets ilustrativos reutilizáveis**, não de
páginas completas. A decisão de arquitetura (ver [[pipeline_pdf]]) é que o
Nano Banana gera apenas ilustrações soltas com fundo transparente; o texto de
cada atividade é sempre renderizado em HTML/CSS de verdade, nunca embutido
numa imagem gerada por IA. Nenhuma imagem foi gerada ainda — isto é só a lista
de prompts prontos para quando a geração for autorizada.

## Identidade visual extraída dos 8 prompts (fixa em todos os assets)

- Paleta: roxo `#6366F1`, amarelo `#FFB830`, lavanda `#C7D2FE`, sobre fundo branco.
- Mascote: um polvo chamado **Teca** (🐙), estilo ilustração flat 2D, colorida e lúdica.
- Estilo geral (ciclo 1º-2º ano): traços arredondados, expressões bem infantis,
  cenários lúdicos (escola, parque, casa).
- Estilo geral (ciclo 3º-5º ano): mesma paleta, mas "menos infantil, mais
  aventura/desafio" — traços um pouco mais dinâmicos, cenários temáticos
  (investigação, jornalismo, tribunal, palco de debate).
- Diversidade étnica e de gênero obrigatória em toda ilustração com pessoas.
- Rodapé de toda página leva o logo "🐙 AulaTeca" — mas o logo em si **não**
  deve ser gerado pelo Nano Banana repetidamente; deve ser 1 asset único
  fixo, reaproveitado via CSS em todas as páginas.

## Lote 1 — Mascote Teca (biblioteca de poses)

Gerar como PNG individual, fundo transparente, mesmo estilo de traço/cor em
todas as poses (usar a primeira pose gerada como referência de consistência
para as seguintes).

1. "Teca, a friendly cartoon octopus mascot, flat 2D vector illustration style,
   purple and yellow color palette (#6366F1, #FFB830), simple round eyes,
   waving one tentacle, transparent background, no text, children's
   educational material style."
2. "Same Teca octopus mascot as reference, wearing a detective coat and
   holding a magnifying glass with one tentacle, transparent background,
   flat 2D vector style, no text."
3. "Same Teca octopus mascot as reference, wearing a graduation cap and
   holding a book, transparent background, flat 2D vector style, no text."
4. "Same Teca octopus mascot as reference, wearing a chef hat and apron,
   holding a wooden spoon, transparent background, flat 2D vector style, no text."
5. "Same Teca octopus mascot as reference, dressed as an explorer with a hat
   and compass, transparent background, flat 2D vector style, no text."
6. "Same Teca octopus mascot as reference, sitting and reading a book with
   glasses on, transparent background, flat 2D vector style, no text."
7. "Same Teca octopus mascot as reference, holding a clipboard and pencil,
   professional pose (for teacher-facing instrument pages), transparent
   background, flat 2D vector style, no text, slightly more neutral
   expression than the playful poses."

*(Usar sempre "same Teca octopus mascot as reference" + anexar a imagem-base
para manter consistência de estilo entre as poses — sem isso o Nano Banana
tende a gerar variações incompatíveis a cada chamada.)*

## Lote 2 — Molduras e elementos de canto (não a página inteira)

Gerar como PNG com fundo transparente, pensados para overlay via CSS
`position: absolute` nos 4 cantos ou nas bordas da página — nunca como
imagem de fundo de página inteira, para não conflitar com quantidades
variáveis de conteúdo.

1. "Decorative corner illustration for a children's worksheet, top-left
   corner style, colorful stars and swirls in purple (#6366F1) and yellow
   (#FFB830), flat 2D vector, transparent background, no text, no full frame,
   just a corner ornament."
2. "Same style corner ornament, rotated for top-right corner placement,
   transparent background."
3. "Same style corner ornament, for bottom-left corner, transparent background."
4. "Same style corner ornament, for bottom-right corner, transparent background."
5. "Thin decorative border strip, horizontal, repeatable/tileable pattern of
   small stars and dots in lavender (#C7D2FE) and purple (#6366F1), flat 2D
   vector, transparent background, no text — for use as a top banner strip
   above page titles."
6. "Alternative corner ornament set in a more mature/adventurous style (less
   childish), same color palette, subtle magnifying-glass and compass motifs,
   transparent background — for the 3rd-5th grade material."

## Lote 3 — Ícones decorativos avulsos

Gerar como conjunto único de ícones pequenos, todos no mesmo estilo, fundo
transparente, para reuso pontual (autoavaliação, destaques, badges).

1. "Set of small flat 2D vector icons: a smiling star, a heart, a rainbow, a
   speech bubble, all in the purple/yellow/lavender palette (#6366F1,
   #FFB830, #C7D2FE), transparent background, no text, consistent line
   weight and style, children's educational material."
2. "Three simple emoji-style face icons for self-assessment: happy face,
   neutral face, sad face, flat 2D vector, same color palette, transparent
   background, no text."
3. "Set of achievement badge icons: bronze star badge, silver star badge,
   gold star badge, flat 2D vector, transparent background, no text — for
   certificates and reading passport milestones."

## Lote 4 — Cenários temáticos por bloco (fundo de capa apenas, não de atividade inteira)

Estes são para as **páginas de capa** de cada atividade (1 ilustração de
cenário por capa, com espaço em branco reservado para o título em HTML por
cima) — não para as páginas de exercício.

Exemplos representativos (gerar 1 por atividade na hora de produzir, seguindo
o tema descrito no prompt original de cada atividade):
- "Colorful flat 2D illustration of a whimsical detective office scene with
  post-it notes and string connecting clues, purple/yellow palette, empty
  space at the top third for a title overlay, no text in the image."
- "Colorful flat 2D illustration of a cozy reading corner with cushions and a
  stack of books, purple/yellow/lavender palette, empty space at the top for
  title overlay, no text in the image."

## Regras de uso (para quem for compor os templates HTML)

- Nenhum asset deve conter texto embutido — todo texto (títulos, instruções,
  exercícios) é HTML real, nunca parte da imagem gerada.
- Toda imagem deve ter fundo transparente, exceto as ilustrações de capa
  (Lote 4), que podem ser retangulares mas devem reservar espaço vazio para
  o título ser sobreposto em HTML.
- Manter 1 imagem-referência fixa da Teca "oficial" e sempre anexá-la como
  referência visual nas gerações seguintes, para não haver deriva de estilo
  entre lotes gerados em sessões diferentes do Nano Banana.

Ver [[pipeline_pdf]] para como esses assets entram no template HTML/CSS final.
