# Como ler o `catalogo.csv`

Este catálogo cobre as 50 atividades descritas nos 8 arquivos de prompt
(`prompt 1.md` a `prompt 8.md`). Ele existe para permitir que cada atividade
seja rastreada, gerada e catalogada na plataforma de forma independente do
prompt de origem — os prompts foram escritos como blocos de texto corrido,
não como itens de catálogo.

## Esquema do código (`codigo`)

Formato: `LP-{CICLO}-{SUBCATEGORIA}-{SEQUENCIAL}`

- `LP` — Língua Portuguesa (fixo; outras disciplinas usarão outro prefixo no futuro).
- `{CICLO}` — `12` (1º e 2º ano) ou `35` (3º ao 5º ano).
- `{SUBCATEGORIA}` — sigla de 3-4 letras da subcategoria pedagógica:
  - `ALF` — Alfabetização e Língua Portuguesa básica (só existe no ciclo 12)
  - `LEI` — Leitura Interativa e Compreensão (só existe no ciclo 12)
  - `PROD` — Produção de Texto e Gêneros Textuais
  - `GRAM` — Gramática e Ortografia (Aprofundada no ciclo 12; "Gramática, Ortografia e Vocabulário" no ciclo 35)
  - `AVAL` — Avaliação e Instrumentos do Professor
- `{SEQUENCIAL}` — número de 2 dígitos, sequencial **dentro da subcategoria e do ciclo**, não dentro do prompt de origem.

Exemplo: `LP-35-PROD-04` é a 4ª atividade de produção textual do ciclo 3º-5º ano
(Oficina de Texto Argumentativo), independente de qual prompt a originou.

O código é a chave estável. Ele não muda se a ordem de exibição no catálogo
da plataforma mudar, se novas atividades forem inseridas no meio de uma
subcategoria, ou se a atividade for renumerada visualmente para o professor.

## Por que a numeração foi corrigida (id_global 31-50)

Os prompts originais numeram as atividades do ciclo 1º-2º ano de 1 a 30
(prompts 1-5), mas os prompts do ciclo 3º-5º ano (6-8) reiniciam a numeração
em 1 (voltando a "Atividade 1", "Atividade 2"...). Isso gera dois problemas
para o catálogo real:

1. **Colisão de identificador**: "Atividade 1" existiria duas vezes (Aventura
   do Alfabeto E Detetive Gramatical), o que quebra qualquer sistema que use
   esse número como chave.
2. **Falsa impressão de tamanho**: um usuário vendo "1 a 20" no ciclo 3º-5º
   não percebe que o conjunto completo tem 50 atividades.

Correção aplicada no campo `id_global`: as atividades do ciclo 3º-5º ano
continuam a numeração a partir de 31 (prompt 6 = 31-34, prompt 7 = 35-40,
prompt 8 = 41-50), preservando a ordem em que os prompts foram escritos.
`id_global` é só para referência humana e ordenação cronológica de produção —
quem deve ser usado como chave em qualquer sistema é o `codigo`, não o `id_global`.

## Colunas do catálogo

| Coluna | Significado |
|---|---|
| `codigo` | chave estável (ver acima) |
| `id_global` | número sequencial 01-50 corrigido (só para referência humana) |
| `prompt_origem` | arquivo `.md` de onde a atividade foi extraída |
| `ciclo` | 1º-2º ano ou 3º-5º ano |
| `subcategoria` | nome completo da subcategoria pedagógica |
| `titulo_atividade` | título como aparece no prompt original |
| `temas_generos_cobertos` | resumo do conteúdo/gênero textual trabalhado |
| `habilidades_bncc` | códigos BNCC citados no prompt original |
| `paginas_estimadas` | estimativa a partir do prompt (ver `padrao_profundidade.md` para outliers) |
| `tipo_material` | `atividade do aluno`, `instrumento do professor` ou `jogo recortável` (classificação pela natureza predominante do material — várias atividades "atividade do aluno" têm um componente recortável embutido, mas não são jogos autônomos) |
| `sobreposicoes` | referência cruzada a outras atividades com tema semelhante — ver `redundancias.md` para o que fazer com cada caso |
| `status` | sempre `não gerado` neste momento — nenhuma atividade foi produzida ainda |

## Arquivos relacionados

- [[redundancias]] — o que fazer com cada sobreposição listada na coluna `sobreposicoes`
- [[padrao_profundidade]] — por que algumas atividades têm poucas páginas e como corrigir
- [[roteiro_execucao]] — em que ordem produzir, por código
- [[guia_visual_nanobanana]] — briefing de assets ilustrativos
- [[pipeline_pdf]] — decisão de arquitetura de geração do PDF final
