# Padrão de profundidade (páginas-alvo por tipo de material)

Os 8 prompts pedem volumes de página inconsistentes entre si — alguns dizem
"mínimo 6, ideal 10-15", outros "ESTA ATIVIDADE DEVE TER 18-20 PÁGINAS" em
maiúsculas, e duas atividades do prompt 4 ficam com metade das páginas de
suas vizinhas sem justificativa aparente. Este documento fixa uma rubrica
única para uso na geração real, e sinaliza os outliers do material atual.

## Rubrica de profundidade por tipo de material

| Tipo de material | Faixa-alvo de páginas | Racional |
|---|---|---|
| Atividade do aluno — ciclo 1º-2º ano | 10-14 págs | Capa + guia do professor + 6-10 págs de exercício progressivo + autoavaliação |
| Atividade do aluno — ciclo 3º-5º ano | 11-14 págs | Mesma lógica, com 1-2 págs a mais para autonomia/produção mais longa |
| Jogo recortável (qualquer ciclo) | 10-13 págs | Inclui páginas de peças/moldes recortáveis, que ocupam mais espaço por conterem menos texto por página |
| Gramática/Ortografia "densa" (explicitamente sinalizada no prompt como aprofundada) | 17-20 págs | Cobre múltiplas regras correlatas (ex: 4 dígrafos, 6 sinais de pontuação) — volume alto é intencional aqui |
| Instrumento do professor — sondagem/avaliação diagnóstica completa | 18-24 págs | Inclui textos de aplicação + fichas de registro + gabarito + mapa de turma + gráfico |
| Instrumento do professor — ficha/relatório/rubrica (sem texto de aplicação) | 4-9 págs | Tabelas de critérios; poucas páginas é esperado, não é outlier |
| Portfólio do aluno (projeto anual) | 12-14 págs | 8 fichas mensais + capa + comparação + certificado |
| Kit datas comemorativas | 10-11 págs | 1 página por data + capa + autoavaliação |

## Outliers identificados no material atual

### `LP-12-GRAM-04` — Acentuação (8 páginas)
Está no mesmo prompt 4 que pede explicitamente 18-20 páginas para as
atividades vizinhas (`LP-12-GRAM-01`, `LP-12-GRAM-02`, `LP-12-GRAM-03`), mas
o prompt não repete a instrução de volume para esta atividade — ela ficou em
8 páginas por omissão, não por decisão pedagógica.
**Correção sugerida ao gerar**: elevar para a faixa 14-16 páginas, adicionando:
uma página de prática combinada (agudo + circunflexo + til no mesmo exercício,
o material atual só faz isso parcialmente na pág. 6), uma segunda rodada de
ditado com mais palavras, e um jogo de memória com pares de palavras
acentuadas/não-acentuadas (hoje só há um bingo).

### `LP-12-GRAM-05` — Classes de Palavras (8 páginas)
Mesmo caso do anterior: cobre 3 classes de palavras inteiras (substantivo,
adjetivo, verbo) mais concordância em apenas 8 páginas, abaixo da faixa de
17-20 pedida para o restante do prompt 4.
**Correção sugerida ao gerar**: elevar para 14-16 páginas, adicionando uma
página dedicada só a adjetivos com mais variedade semântica (a atual mistura
tudo em meia página) e um jogo de classificação recortável (cartas para
separar substantivo/adjetivo/verbo), que está ausente e destoa do padrão
lúdico-recortável do restante do bloco.

### `LP-12-AVAL-06` / `LP-35-AVAL-09` — Relatório Descritivo (5 e 4 páginas)
Não é outlier real — instrumentos de "modelo de texto + banco de frases" são
naturalmente curtos. Mantido como está.

### `LP-35-AVAL-06` — Ficha de Acompanhamento 3º-5º (4 páginas) vs `LP-12-AVAL-05` (6 páginas)
Pequena inconsistência entre ciclos para o mesmo tipo de instrumento (a versão
3º-5º tem 1 página a menos por ano, já que cobre 3 anos em 4 páginas contra
2 anos em 6 páginas na versão anterior). Não chega a ser um problema de
profundidade pedagógica (são tabelas de checklist, compressíveis), mas ao
gerar vale igualar para 2 páginas por ano (6 páginas totais) para manter
consistência visual entre os dois materiais.

## Como aplicar esta rubrica na geração

Ao fragmentar um prompt em uma atividade individual (ver [[roteiro_execucao]]),
conferir a faixa correspondente aqui **antes** de gerar. Se o prompt original
pedir um volume fora da faixa esperada para aquele tipo, e não houver uma
atividade "vizinha" que justifique o outlier (como aconteceu nas duas
gramáticas acima), tratar como o prompt pede primeiro e, na revisão de
qualidade pós-geração, comparar contra esta tabela.
