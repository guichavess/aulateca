# Decisão de pipeline de geração de PDF

Esta é uma decisão de arquitetura já tomada (não uma análise em aberto) —
registrada aqui para referência de quem for implementar a geração das 50
atividades.

## Contexto

Um gestor do produto reportou que os PDFs gerados anteriormente não tinham
"personalidade" — sem estilização, sem estética infantil, sem a identidade
visual do Aulateca (a referência de comparação foi um worksheet colorido com
moldura arredondada, mascotes, ícones decorativos e caixinhas de cor).

## Decisão

**Pipeline: HTML/CSS renderizado e convertido para PDF via headless browser**
(Puppeteer ou Playwright, usando `page.pdf()` com CSS `@page` configurado
para A4), **não** geração da página inteira como imagem por IA.

O Nano Banana (Gemini) entra apenas como fonte de uma **biblioteca de assets
ilustrativos reutilizáveis** (ver [[guia_visual_nanobanana]]) — molduras de
canto, poses da mascote Teca, ícones — que são compostos sobre o HTML via CSS
(`background-image`, `position: absolute`), enquanto todo o texto de cada
atividade continua sendo HTML real (título, instruções, enunciados,
gabaritos).

## Por que não gerar a página inteira via IA de imagem

- **Risco ortográfico/de precisão**: modelos de geração de imagem ainda
  cometem erros de grafia e acentuação em português com frequência
  perceptível, especialmente em blocos de texto longos — inaceitável para
  material didático que ensina justamente ortografia.
- **Texto raster**: texto dentro de uma imagem gerada não é selecionável,
  fica com nitidez inferior ao imprimir em A4 (especialmente em fontes
  pequenas), e não é acessível a leitores de tela.
- **Rigidez de layout**: cada uma das 50 atividades tem uma quantidade
  diferente de exercícios, caixas e linhas — uma imagem de página inteira
  gerada previamente não se adapta a conteúdo variável; um template HTML sim.
- **Impossível de reaproveitar em escala**: gerar 50 atividades × 10-20
  páginas cada como imagens únicas não é repetível/parametrizável; um
  template HTML com dados variáveis (ex: gerado a partir do `catalogo.csv` e
  do conteúdo fragmentado de cada prompt) é.

## Por que HTML/CSS resolve o problema relatado pelo gestor

A "falta de personalidade" apontada não depende de imagem gerada por IA —
depende de CSS que hoje aparentemente não está sendo aplicado: bordas
arredondadas (`border-radius`), sombras (`box-shadow`), a paleta de cores já
definida nos prompts (`#6366F1`, `#FFB830`, `#C7D2FE`), tipografia lúdica e
os assets do Nano Banana posicionados como decoração. Nenhum desses recursos
depende de geração de imagem de página inteira.

## Alternativas descartadas

| Alternativa | Por que foi descartada |
|---|---|
| Canva (via API de bulk create) | A API de automação em lote do Canva exige plano Enterprise e um fluxo de "brand templates com campos", que é mais pesado de manter para 50 atividades × múltiplas páginas cada do que um pipeline HTML→PDF simples; também amarra a geração a uma ferramenta de terceiros fora do controle do time. |
| Página inteira gerada por IA de imagem (Nano Banana ou similar) | Ver riscos acima (ortografia, texto raster, rigidez de layout, não-escalável). |
| LaTeX | Excelente para tipografia técnica/científica, mas não é natural para o visual "colorido e arredondado" pedido nos prompts (caixinhas de cor, ilustrações soltas, moldura decorativa) — exigiria tanto trabalho de customização quanto o HTML/CSS, sem a vantagem de reaproveitar conhecimento de front-end que o time já tem (o projeto já é React/Vite). |

## Consequência prática

Quem for implementar a geração deve montar templates HTML/CSS (reaproveitando
o stack React/Vite já existente no projeto) que recebem como dados de entrada
o conteúdo fragmentado de cada atividade (ver [[catalogo]]) e compõem por
cima os assets do [[guia_visual_nanobanana]], depois convertem para PDF via
Puppeteer/Playwright `page.pdf()` com formato A4.
