# Mapa de redundâncias entre prompts

Objetivo: quando as 50 atividades forem de fato produzidas, evitar gerar o
mesmo conteúdo pedagógico duas vezes com roupagem diferente. Para cada
sobreposição encontrada, este documento diz **qual atividade deve ser o
aprofundamento definitivo daquele tema** e **como as demais devem se
diferenciar** (nível, ângulo pedagógico ou referência cruzada) em vez de
repetir exercícios equivalentes.

Nem toda sobreposição é redundância — o material foi desenhado com revisão
espiral (o mesmo tema volta em nível mais difícil em anos seguintes). Este
documento distingue os dois casos.

---

## 1. Pontuação (. ? ! , : —)

Aparece em: `LP-12-ALF-05` (Kit Gramática, pág. 5-8 — introdução), `LP-12-GRAM-01`
(Pontuação, 19 págs — tratamento completo e definitivo do ciclo 1º-2º),
`LP-35-GRAM-01` (Detetive Gramatical, Caso 8 — revisão + ponto-e-vírgula/parênteses
novos), `LP-35-PROD-04` (aplicada em contexto argumentativo).

**Veredito**: não é redundância — é progressão correta (introdução → aprofundamento →
revisão com sinais novos → aplicação). **Ação**: ao gerar `LP-12-ALF-05`, os exercícios
de pontuação devem ficar deliberadamente rasos (nível 1, só . ? !) e remeter no Guia
do Professor a `LP-12-GRAM-01` para o tratamento completo, em vez de duplicar os
mesmos tipos de exercício (evitar repetir "coloque . ? ! nas 10 frases" nos dois
materiais com frases quase idênticas).

## 2. Ortografia (dígrafos, SS/RR, M antes de P/B, C/Ç, G/J, S com som de Z)

Aparece em: `LP-12-GRAM-02` (Ortografia Nível 1 — sons e letras), `LP-12-GRAM-03`
(Ortografia Nível 2 — dificuldades, tratamento definitivo do ciclo 1º-2º),
`LP-35-GRAM-03` (Torneio de Ortografia — retoma as mesmas dificuldades em listas
de palavras mais longas/raras para 3º-5º), e exercícios de revisão embutidos em
`LP-35-GRAM-01` (Caso 7 — Cena do Crime Ortográfico) e nas avaliações
`LP-35-AVAL-02/03/04`.

**Veredito**: progressão correta entre ciclos. **Ação**: ao gerar `LP-35-GRAM-03`,
usar exclusivamente os bancos de palavras do 3º-5º ano já definidos no prompt 6
(mais longas, com prefixos/sufixos e termos como "excepcional", "consequência") —
não reaproveitar as listas de palavras do ciclo 1º-2º ano, mesmo que a regra
ortográfica seja a mesma.

## 3. Classes de palavras e concordância

Aparece em: `LP-12-ALF-05` (introdução a substantivo), `LP-12-GRAM-05`
(Classes de Palavras, tratamento definitivo do ciclo 1º-2º: substantivo/adjetivo/
verbo + concordância simples), `LP-35-GRAM-01` (Detetive Gramatical, revisão +
avanço para advérbio, pronome, sujeito/predicado, concordância nominal e verbal).

**Veredito**: progressão correta. **Ação**: nenhuma — a estrutura já está bem
escalonada. Único cuidado: `LP-35-GRAM-01` Caso 1 (classificação de substantivo/
adjetivo/verbo) deve ser tratado como revisão rápida (1 página), não repetir o
volume de exercícios de `LP-12-GRAM-05`.

## 4. Passaporte da Leitura x Maleta Literária (`LP-12-LEI-06` x `LP-12-LEI-07`)

Esta é a sobreposição mais real do conjunto. Ambas são projetos contínuos de
registro de leitura com ficha de livro lido, nota em estrelas, campo de
personagem favorito e envolvimento da família — a estrutura de preenchimento
é quase idêntica.

**Diferença pretendida (mas não suficientemente explícita nos prompts)**:
- Passaporte da Leitura = projeto **individual**, o aluno é o dono do documento,
  o livro pode vir de qualquer lugar (biblioteca, casa), o registro é feito na
  escola.
- Maleta Literária = projeto **de circulação física da turma** (uma maleta com
  1 livro específico roda entre as casas), com carta para a família e caderno
  viajante coletivo — o produto final não é do aluno individualmente, é da turma.

**Ação ao gerar**: no Guia do Professor de `LP-12-LEI-07`, abrir com um quadro
explícito "Isso não é o Passaporte da Leitura — aqui o livro é o MESMO para
toda a turma, em rodízio, e o caderno viajante é coletivo." Evitar reusar os
mesmos campos de ficha (ex: não repetir "personagem favorito" com a mesma
redação nas duas atividades).

## 5. Fato x Opinião (progressão em 3 atividades + avaliações)

Aparece em: `LP-35-PROD-03` (Notícia e Reportagem — introduz a distinção),
`LP-35-PROD-04` (Texto Argumentativo — usa a distinção como base da tese/
argumento), e é testado em `LP-35-AVAL-02/03/04/05` (todas as avaliações
diagnósticas e o simulado SAEB, descritor D11).

**Veredito**: progressão correta e desejável (introduzir → aplicar → avaliar).
**Ação**: nenhuma mudança estrutural — só garantir que os textos-exemplo usados
para treinar Fato x Opinião em `LP-35-PROD-03` não sejam os mesmos reaproveitados
nas avaliações (isso invalidaria a avaliação como medida real, já que o aluno
teria memorizado a resposta do exercício de aula).

## 6. Quarteto de instrumentos do professor: Sondagem → Ficha de Acompanhamento → Relatório Descritivo → Rubrica

Cada ciclo tem 4 instrumentos que capturam essencialmente o mesmo dado (nível de
leitura/escrita do aluno) em formatos diferentes:
- Ciclo 1º-2º: `LP-12-AVAL-01/02` (sondagem, gera o dado bruto) →
  `LP-12-AVAL-05` (ficha checklist bimestral) → `LP-12-AVAL-06` (relatório
  narrativo com banco de frases) → `LP-12-AVAL-08` (rubrica de produção textual).
- Ciclo 3º-5º: `LP-35-AVAL-01` (sondagem de fluência) → `LP-35-AVAL-06` (ficha) →
  `LP-35-AVAL-09` (relatório) → `LP-35-AVAL-07` (rubrica).

**Veredito**: não é redundância de conteúdo pedagógico — são **audiências e
formatos diferentes** para o mesmo dado (ficha = uso interno pedagógico rápido;
relatório = comunicação com a família/coordenação; rubrica = avaliação pontual
de uma produção específica). **Ação real necessária**: ao implementar, os
campos de nível (ex: "PRÉ-SILÁBICO / SILÁBICO... / ALFABÉTICO" ou "PPM/precisão/
prosódia/compreensão") devem usar a **mesma nomenclatura e as mesmas faixas**
nos 4 instrumentos do ciclo — hoje os prompts descrevem os rótulos de forma
consistente, mas isso deve ser tratado como um contrato de dados fixo na hora
de gerar (um único "dicionário de níveis" compartilhado pelos 4 documentos),
não reescrito 4 vezes de forma levemente diferente.

## 7. Kit Datas Comemorativas (`LP-12-AVAL-09` x `LP-35-AVAL-10`)

Mesma estrutura (calendário de datas comemorativas → 1 gênero textual por data)
para os dois ciclos, com gêneros propositalmente mais simples no ciclo 1º-2º
(bilhete, poema guiado, lista de desejos) e mais avançados no 3º-5º (biografia,
artigo de opinião, manifesto, reportagem).

**Veredito**: correto por design, não redundante. **Ação**: nenhuma — só
atenção para não copiar/colar os mesmos textos-modelo (ex: a mesma "carta ao
Papai Noel") entre os dois documentos quando forem gerados.

## 8. "Checklist do Escritor" (processo de escrita reaproveitado)

`LP-12-PROD-11` (Fábrica de Textos) introduz o processo de 5 etapas
(pensar/planejar/rascunhar/revisar/publicar) e o "Checklist do Escritor".
Esse mesmo checklist é reaproveitado, com pequenas variações, em
`LP-12-GRAM-06`, `LP-35-PROD-01` (Fábulas), `LP-35-PROD-04` (Argumentativo)
e implicitamente em várias outras oficinas de produção.

**Veredito**: isto é reuso de andaime pedagógico, **desejável e recomendado**
— não deve ser "corrigido" ou removido. **Ação**: ao gerar, manter o checklist
visualmente idêntico (mesmos ícones/etapas) em todas as atividades que o citam,
para que o aluno reconheça o processo como um método fixo do curso, não como
uma explicação nova a cada vez.

---

## Resumo para quem for gerar o conteúdo

Antes de gerar qualquer atividade da coluna `sobreposicoes` do catálogo,
consultar a seção correspondente aqui. Na dúvida entre "é progressão" ou
"é redundância": se o texto-fonte, o banco de palavras ou os exemplos vão
ser os mesmos usados em outra atividade → é redundância, differenciar.
Se o nível de dificuldade, o gênero ou o ângulo pedagógico já muda
naturalmente entre ciclos ou etapas → é progressão, manter como está.
