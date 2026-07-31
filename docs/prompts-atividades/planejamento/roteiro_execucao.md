> **PLANEJAMENTO APENAS — NENHUMA ATIVIDADE DEVE SER GERADA A PARTIR DESTE ROTEIRO SEM CONFIRMAÇÃO EXPLÍCITA DO USUÁRIO.**

# Roteiro de execução (roadmap de produção)

Este roteiro expande a recomendação de uso do resumo avaliativo inicial:
começar pelos prompts-base de cada ciclo (1 e 6), depois os instrumentos do
professor (5 e 8, alto valor percebido para escolas), e por último os blocos
intermediários (2, 3, 4, 7). A ordem abaixo referencia os códigos definidos
em [[catalogo]] e incorpora as correções de [[redundancias]] e
[[padrao_profundidade]].

## Fase 0 — Pré-requisitos (antes de gerar qualquer atividade)

- [ ] Definir e travar o "dicionário de níveis" único (nomenclatura de níveis
  de escrita/leitura/fluência) citado em `redundancias.md` item 6, para que
  os 4 instrumentos de avaliação de cada ciclo usem os mesmos rótulos.
- [ ] Ter o pipeline HTML→PDF funcional (ver [[pipeline_pdf]]) com pelo menos
  1 template de página validado (moldura + tipografia + rodapé com logo).
- [ ] Ter a biblioteca mínima de assets do Nano Banana pronta (ver
  [[guia_visual_nanobanana]]): ao menos 1 conjunto de poses da mascote Teca
  e 1 moldura por cor-tema.

## Fase 1 — Bases de cada ciclo (fundação pedagógica)

Objetivo: validar o formato de atividade "padrão" (capa + guia do professor +
exercícios + autoavaliação) em ambos os ciclos antes de escalar.

1. `LP-12-ALF-01` — Aventura do Alfabeto (mais simples do catálogo, bom piloto)
2. `LP-12-ALF-05` — Kit Gramática Divertida (testa o material "denso")
3. `LP-35-GRAM-01` — Detetive Gramatical (piloto do ciclo 3º-5º, testa mecânica de jogo/patente)
4. `LP-35-PROD-01` — Oficina de Fábulas e Contos (testa o Checklist do Escritor reaproveitável)

**Marco de saída da Fase 1**: os 4 templates acima aprovados visualmente
(estética "com personalidade" resolvendo a queixa relatada pelo gestor) antes
de seguir em lote para o resto do catálogo.

## Fase 2 — Instrumentos do professor (alto valor percebido, baixo volume de ilustração)

Prioridade alta porque são o diferencial B2B do Aulateca para escolas e
exigem menos trabalho de ilustração do Nano Banana (visual mais institucional).

5. `LP-12-AVAL-01` — Sondagem de Escrita
6. `LP-12-AVAL-02` — Sondagem de Leitura
7. `LP-12-AVAL-05` — Ficha de Acompanhamento Bimestral
8. `LP-12-AVAL-06` — Relatório Descritivo
9. `LP-12-AVAL-08` — Rubrica de Avaliação de Produção Textual
10. `LP-35-AVAL-01` — Sondagem de Fluência Leitora
11. `LP-35-AVAL-05` — Simulado SAEB (mais complexo do bloco, deixar por último aqui)
12. `LP-35-AVAL-06` — Ficha de Acompanhamento Bimestral (3º-5º)
13. `LP-35-AVAL-07` — Rubrica de Produção Textual por Gênero
14. `LP-35-AVAL-09` — Relatório Descritivo (3º-5º)
15. `LP-12-AVAL-03` / `LP-12-AVAL-04` — Avaliações Diagnósticas 1º/2º ano
16. `LP-35-AVAL-02` / `LP-35-AVAL-03` / `LP-35-AVAL-04` — Avaliações Diagnósticas 3º/4º/5º ano

**Atenção**: aplicar o dicionário de níveis da Fase 0 de forma idêntica em
todos os itens 5-14 (são exatamente o quarteto redundante descrito em
`redundancias.md` item 6).

## Fase 3 — Blocos intermediários de conteúdo do aluno

17-21. Prompt 2 completo: `LP-12-LEI-06` a `LP-12-LEI-10`
(atenção especial ao diferenciar `LEI-06` de `LEI-07`, ver `redundancias.md` item 4)

22-26. Prompt 3 completo: `LP-12-PROD-11` a `LP-12-PROD-15`

27-32. Prompt 4 completo: `LP-12-GRAM-01` a `LP-12-GRAM-06`
(aplicar a correção de profundidade de `LP-12-GRAM-04` e `LP-12-GRAM-05`
antes de gerar — ver `padrao_profundidade.md`)

33-38. Prompt 7 completo: `LP-35-PROD-02` a `LP-35-PROD-06`
(faltando apenas `PROD-01`, já gerado na Fase 1)

39-41. Prompt 6 restante: `LP-35-GRAM-02`, `LP-35-GRAM-03`, `LP-35-GRAM-04`
(faltando apenas `GRAM-01`, já gerado na Fase 1)

## Fase 4 — Complementares/sazonais (menor urgência)

42. `LP-12-ALF-02` a `LP-12-ALF-04` — restante do prompt 1 (jogos)
43. `LP-12-AVAL-07` — Portfólio do Aluno (1º-2º)
44. `LP-12-AVAL-09` — Kit Datas Comemorativas (1º-2º)
45. `LP-35-AVAL-08` — Portfólio de Produção Textual (3º-5º)
46. `LP-35-AVAL-10` — Kit Datas Comemorativas (3º-5º)
(gerar os dois kits de datas em sequência, lado a lado, para aplicar a
checagem de não-duplicação de `redundancias.md` item 7 enquanto o conteúdo
do outro ainda está fresco)

## Notas de sequenciamento

- Sempre gerar `LEI-06` antes de `LEI-07` (e nunca em paralelo por agentes
  diferentes) para poder aplicar a diferenciação descrita em `redundancias.md`.
- Sempre gerar o par de "Kit Datas Comemorativas" (`AVAL-09` e `AVAL-10`) em
  sequência próxima, pelo mesmo motivo.
- As avaliações diagnósticas somativas (Fase 2, itens 15-16) foram deixadas
  por último dentro da Fase 2 propositalmente: são as mais fáceis de gerar
  (formato de prova padronizado) e menos urgentes que as sondagens/fichas de
  uso contínuo.

## Execução em subagentes paralelos (quando a produção real for confirmada)

**Unidade padrão de paralelização = 1 subagente por prompt de origem.**
Isso coincide com os limites naturais de arquivo/tema do catálogo e evita que
dois subagentes editem o mesmo trecho de conteúdo ao mesmo tempo. Na prática:

- Fase 1 (pilotos): os 4 códigos podem rodar em **4 subagentes em paralelo**
  — são de prompts de origem diferentes e não têm dependência entre si. Só
  não avançar para a Fase 2 antes do marco de aprovação visual dos 4.
- Fase 2 (instrumentos do professor): paralelizável **somente depois** que o
  "dicionário de níveis" da Fase 0 estiver congelado. Cada subagente deve
  receber esse dicionário já pronto (colado no prompt, não redescoberto por
  ele) para os 10 itens não divergirem em nomenclatura. Com essa trava, os
  itens 5-14 podem rodar em subagentes paralelos (ex: 1 por código ou 1 por
  par ciclo, a gosto de quem orquestrar).
- Fase 3: paralelizar por prompt de origem (1 subagente para o restante do
  Prompt 2, 1 para o Prompt 3, 1 para o Prompt 4, 1 para o Prompt 7, 1 para o
  restante do Prompt 6) — 5 subagentes simultâneos.
- Fase 4: paralelizável livremente, **exceto** o par `AVAL-09`/`AVAL-10`
  (Kits de Datas Comemorativas), que deve ficar no mesmo subagente e na
  mesma ordem, pelo motivo já descrito acima.

**Exceções que nunca devem paralelizar** (mesmo subagente, ordem fixa):
- `LEI-06` → `LEI-07` (diferenciação depende de gerar um sabendo do outro)
- `AVAL-09` → `AVAL-10` (checagem de não-duplicação entre os kits)
- Fase 0 é sempre sequencial e é um gate: nenhuma Fase 1+ começa antes dela
  fechar.

**Regra de escrita compartilhada**: subagentes de produção não devem editar
`catalogo.csv` diretamente (risco de conflito quando rodam em paralelo). Cada
um entrega seu material e reporta o(s) código(s) concluído(s); quem orquestra
a produção atualiza a coluna `status` no catálogo depois que o resultado for
conferido.
