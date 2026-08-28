# Prompt mestre — geração da estrutura HTML/CSS das atividades AulaTeca + assets Nano Banana

> Uso: colar este prompt inteiro em um LLM com capacidade de geração de imagem
> (ex: Gemini/Nano Banana), **anexando junto os arquivos desta mesma pasta**
> (`identidade-visual/`) como referência visual — não descrever a marca só em
> texto. Ele cobre as duas etapas da decisão de pipeline já tomada em
> [[pipeline_pdf]]: (1) gerar os assets ilustrativos soltos, (2) gerar o
> template HTML/CSS que os recebe. Antes de rodar em lote para as 50
> atividades, confirme comigo (ver aviso em [[roteiro_execucao]]).

## Arquivos de referência anexados nesta pasta

- `logo-mascote/` — marca oficial já em uso no produto (app AulaTeca):
  `teca-icon.png` / `teca-icon-sm.png` (ícone/logo), `teca-mascot.png` /
  `mascot.png` (mascote Teca em pose padrão), `login-bg.png` (fundo de
  referência de cor/estilo). **Use `teca-mascot.png` como imagem-base de
  referência** ao pedir novas poses da Teca no Lote 1, para não haver deriva
  de estilo em relação ao personagem já usado no app.
- `assets-gerados/` — assets já gerados anteriormente para o template
  (`teca-base.jpg`, `teca-detective.jpg`, `teca-graduation.jpg`,
  `corner-top-left.jpg`, `border-strip.jpg`, `cover-scene.jpg`,
  `self-assessment.jpg`). Servem de referência de estilo/consistência para
  completar os lotes que faltam (ex: as demais poses do Lote 1, os 3 outros
  cantos do Lote 2) — reaproveite-os em vez de regenerar os que já existem.
- `capturas-app/` — telas reais do produto AulaTeca (`telaInicial.jpeg`,
  `checklist.jpeg`, `maletaLiteraria.jpeg`), mostrando como a paleta e o
  personagem aparecem hoje na UI do app (fora do PDF) — use como referência
  de tom/acabamento, não como layout a copiar (o layout de app é diferente do
  layout de página impressa A4).
- `materiais-existentes/` — exemplos de ilustrações já usadas em atividades
  do catálogo atual (`kit-jogos-portugues.png`, `aventuras-ortograficas.png`,
  `certificado-explorador.png`, `kit-producao-texto.png` — capa da atividade
  "Meu Primeiro Texto") — referência do nível de detalhe/estilo de
  ilustração que já é aceito pelo produto.

---

## CONTEXTO DO PRODUTO

Você vai gerar o material de apoio visual e o template de página para
atividades educacionais imprimíveis (A4) da plataforma **AulaTeca**, voltadas
a professores do Ensino Fundamental (1º ao 5º ano), disciplina de Língua
Portuguesa. O conteúdo textual de cada atividade (títulos, enunciados,
exercícios, gabaritos) **já existe** em arquivos separados — sua tarefa aqui
é APENAS a camada visual: (A) os assets ilustrativos e (B) a estrutura
HTML/CSS que compõe tudo em página pronta para impressão.

**Importante — decisão de arquitetura já tomada, não abrir para debate:**
Nenhuma página é gerada inteira como imagem por IA. Texto é sempre HTML real
(selecionável, sem erro ortográfico, acessível). A IA de imagem gera somente
ilustrações soltas com fundo transparente, compostas por cima do HTML via CSS.

---

## PARTE A — IDENTIDADE VISUAL (fixa para todos os assets e páginas)

- **Paleta**: roxo `#6366F1`, amarelo `#FFB830`, lavanda `#C7D2FE`, sobre fundo branco.
- **Mascote**: um polvo chamado **Teca** (🐙), ilustração flat 2D, colorida e lúdica.
- **Estilo por ciclo**:
  - 1º-2º ano: traços arredondados, expressões bem infantis, cenários lúdicos (escola, parque, casa).
  - 3º-5º ano: mesma paleta, porém "menos infantil, mais aventura/desafio" — traços mais dinâmicos, cenários temáticos (investigação, jornalismo, tribunal, palco de debate).
- **Diversidade étnica e de gênero obrigatória** em toda ilustração com pessoas.
- **Tipografia**: letras grandes e legíveis; bastão/caixa alta para 1º ano, transição para cursiva a partir do 2º ano; mais "adulta"/institucional para instrumentos do professor (avaliações, fichas, rubricas).
- **Rodapé de toda página**: "🐙 AulaTeca — aulateca.com" + número da página. O logo é **1 asset único fixo**, nunca regenerado a cada página.
- **Cabeçalho de toda página**: nome da atividade + indicador de série (ex: ⭐ = 1º ano, ⭐⭐ = 2º ano).

---

## PARTE B — ASSETS A GERAR (Nano Banana / Gemini)

Gere cada lote abaixo como **PNG individual com fundo transparente**, exceto
onde indicado. Sempre anexe a imagem-base da Teca como referência nas
gerações seguintes para não haver deriva de estilo entre lotes.

### Lote 1 — Biblioteca de poses da mascote Teca
1. "Teca, a friendly cartoon octopus mascot, flat 2D vector illustration style, purple and yellow color palette (#6366F1, #FFB830), simple round eyes, waving one tentacle, transparent background, no text, children's educational material style."
2. "Same Teca octopus mascot as reference, wearing a detective coat and holding a magnifying glass with one tentacle, transparent background, flat 2D vector style, no text."
3. "Same Teca octopus mascot as reference, wearing a graduation cap and holding a book, transparent background, flat 2D vector style, no text."
4. "Same Teca octopus mascot as reference, wearing a chef hat and apron, holding a wooden spoon, transparent background, flat 2D vector style, no text."
5. "Same Teca octopus mascot as reference, dressed as an explorer with a hat and compass, transparent background, flat 2D vector style, no text."
6. "Same Teca octopus mascot as reference, sitting and reading a book with glasses on, transparent background, flat 2D vector style, no text."
7. "Same Teca octopus mascot as reference, holding a clipboard and pencil, professional pose (for teacher-facing instrument pages), transparent background, flat 2D vector style, no text, slightly more neutral expression than the playful poses."

### Lote 2 — Molduras e ornamentos de canto (nunca página inteira)
1. "Decorative corner illustration for a children's worksheet, top-left corner style, colorful stars and swirls in purple (#6366F1) and yellow (#FFB830), flat 2D vector, transparent background, no text, no full frame, just a corner ornament."
2. "Same style corner ornament, rotated for top-right corner placement, transparent background."
3. "Same style corner ornament, for bottom-left corner, transparent background."
4. "Same style corner ornament, for bottom-right corner, transparent background."
5. "Thin decorative border strip, horizontal, repeatable/tileable pattern of small stars and dots in lavender (#C7D2FE) and purple (#6366F1), flat 2D vector, transparent background, no text — for use as a top banner strip above page titles."
6. "Alternative corner ornament set in a more mature/adventurous style (less childish), same color palette, subtle magnifying-glass and compass motifs, transparent background — for the 3rd-5th grade material."

### Lote 3 — Ícones decorativos avulsos
1. "Set of small flat 2D vector icons: a smiling star, a heart, a rainbow, a speech bubble, all in the purple/yellow/lavender palette (#6366F1, #FFB830, #C7D2FE), transparent background, no text, consistent line weight and style, children's educational material."
2. "Three simple emoji-style face icons for self-assessment: happy face, neutral face, sad face, flat 2D vector, same color palette, transparent background, no text."
3. "Set of achievement badge icons: bronze star badge, silver star badge, gold star badge, flat 2D vector, transparent background, no text — for certificates and reading passport milestones."

### Lote 4 — Cenários de capa (1 por atividade, não por página de exercício)
Gerar 1 ilustração de cenário por atividade, seguindo o tema específico de
cada uma, sempre com espaço em branco reservado no terço superior para o
título ser sobreposto em HTML. Exemplos representativos:
- "Colorful flat 2D illustration of a whimsical detective office scene with post-it notes and string connecting clues, purple/yellow palette, empty space at the top third for a title overlay, no text in the image."
- "Colorful flat 2D illustration of a cozy reading corner with cushions and a stack of books, purple/yellow/lavender palette, empty space at the top for title overlay, no text in the image."

**Regras de uso para quem for compor os templates:**
- Nenhum asset contém texto embutido — todo texto é HTML real.
- Fundo transparente em tudo, exceto as capas do Lote 4 (retangulares, mas com espaço reservado).
- Manter 1 imagem-referência fixa da Teca "oficial" para consistência entre sessões de geração.

---

## PARTE C — ESTRUTURA HTML/CSS DO TEMPLATE

Gere um template HTML/CSS único, parametrizável, que recebe como dados de
entrada o conteúdo de cada atividade (título, BNCC, páginas de exercício
etc. — ver `catalogo.csv`) e renderiza via headless browser (Puppeteer/
Playwright, `page.pdf()`, formato A4) para PDF final. Estrutura de página
por tipo:

1. **Capa** — título + ilustração de cenário temático (Lote 4) com Teca em
   pose adequada ao tema (Lote 1) no canto.
2. **Guia do professor** — objetivo, habilidades BNCC (código + descrição),
   tempo estimado, materiais necessários, sugestão de mediação, adaptações
   inclusivas (versão ampliada, atividades táteis).
3. **Páginas de exercício** — progressivas (mais fácil → mais desafiador),
   cada uma com: cabeçalho (nome da atividade + indicador de série), corpo do
   exercício (grid/colunas/caixas conforme o tipo), moldura de canto (Lote 2)
   e ícones decorativos pontuais (Lote 3) quando fizer sentido, rodapé fixo
   (logo + número de página).
4. **Autoavaliação do aluno** (última página) — afirmações com carinhas 😊😐😕
   ou estrelas, espaço para desenho livre.

**Requisitos técnicos do CSS:**
- `@page` configurado para A4, com margens seguras de impressão.
- Bordas arredondadas (`border-radius`) e sombras suaves (`box-shadow`) nas
  caixas de exercício — é isso, e não imagem gerada por IA, que resolve a
  "falta de personalidade" apontada anteriormente pelo produto.
- Assets do Nano Banana posicionados via CSS (`background-image`,
  `position: absolute`) nos cantos/bordas, nunca como imagem de fundo de
  página inteira (para não conflitar com quantidade variável de conteúdo).
- Layout deve se adaptar a quantidades diferentes de exercícios por página
  sem quebrar (uma atividade pode ter 6 páginas, outra 20).

**Volume de páginas por tipo de material (rubrica, ver [[padrao_profundidade]]):**

| Tipo de material | Faixa-alvo de páginas |
|---|---|
| Atividade do aluno — ciclo 1º-2º ano | 10-14 |
| Atividade do aluno — ciclo 3º-5º ano | 11-14 |
| Jogo recortável | 10-13 |
| Gramática/Ortografia "densa" | 17-20 |
| Instrumento do professor — sondagem/avaliação completa | 18-24 |
| Instrumento do professor — ficha/relatório/rubrica | 4-9 |
| Portfólio do aluno (projeto anual) | 12-14 |
| Kit datas comemorativas | 10-11 |

---

## PARTE D — REGRAS GERAIS PARA TODAS AS ATIVIDADES

1. Cada atividade é um documento separado (1 PDF por atividade).
2. Identidade visual consistente entre todas (Parte A).
3. Rodapé de toda página: "🐙 AulaTeca — aulateca.com" + número da página.
4. Cabeçalho de toda página: nome da atividade + indicador de série.
5. Dicionário de níveis único entre instrumentos de avaliação do mesmo ciclo
   (não reinventar nomenclatura de nível de escrita/leitura/fluência por
   atividade — ver [[redundancias]]).

---

## O QUE NÃO FAZER

- Não gerar a página inteira como imagem de IA.
- Não embutir texto dentro de nenhum asset gerado.
- Não usar imagem de fundo de página inteira para molduras/ornamentos.
- Não regenerar o logo AulaTeca a cada página — é 1 asset fixo reaproveitado.
- Não gerar em lote para as 50 atividades sem autorização explícita prévia.
