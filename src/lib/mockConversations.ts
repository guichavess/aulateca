// ══════════════════════════════════════════════════════════════════════════════
// Mock Conversations — usadas pelos suggestion cards da AIPlanPage para
// demonstrar a experiência da Teca sem depender do LLM real.
// ══════════════════════════════════════════════════════════════════════════════

export interface MockMessage {
  role: 'user' | 'assistant';
  content: string;
}

export type MockConversationKey =
  | 'objetivo'
  | 'genero'
  | 'sequencia'
  | 'projeto';

export const mockConversations: Record<MockConversationKey, MockMessage[]> = {
  // ──────────────────────────────────────────────────────────────────────────
  // 1. Plano por Objetivo
  // ──────────────────────────────────────────────────────────────────────────
  objetivo: [
    {
      role: 'user',
      content:
        'Crie um plano de aula sobre produção de narrativas para o 4° ano com atividades lúdicas.',
    },
    {
      role: 'assistant',
      content: `## 📋 Plano de Aula — Produção de Narrativas Criativas

**Duração:** 2 aulas de 50 min
**Turma:** 4° ano do Ensino Fundamental
**Alinhamento BNCC:** EF04LP21

### 🎯 Estrutura
1. **Aquecimento (10 min)** — "Dado de Histórias": cada aluno sorteia personagem, lugar e objeto.
2. **Planejamento (15 min)** — Organizador gráfico com começo, meio e fim.
3. **Escrita guiada (20 min)** — Produção individual com apoio docente.
4. **Roda de leitura (5 min)** — Compartilhamento voluntário.

Quer que eu inclua **adaptação para alunos com baixa visão** e uma **rubrica de avaliação em 4 níveis**?`,
    },
    {
      role: 'user',
      content: 'Sim, e adapta para 25 alunos divididos em 5 grupos.',
    },
    {
      role: 'assistant',
      content: `Reorganizei em **5 estações rotativas de 10 min**, uma por grupo:

| Estação | Foco |
|---|---|
| 1. Personagens | Quem é o protagonista? |
| 2. Cenários | Onde a história acontece? |
| 3. Conflito | Qual é o problema? |
| 4. Reviravolta | O que muda tudo? |
| 5. Final | Como termina? |

**Rubrica em 4 níveis** (coerência, criatividade, ortografia, oralidade) e ficha imprimível em A4 inclusas. Posso já gerar o **PDF do plano + materiais**?`,
    },
  ],

  // ──────────────────────────────────────────────────────────────────────────
  // 2. Plano por Gênero
  // ──────────────────────────────────────────────────────────────────────────
  genero: [
    {
      role: 'user',
      content:
        'Planeje uma sequência didática de texto descritivo para turma do 3° ano.',
    },
    {
      role: 'assistant',
      content: `## ✍️ Sequência Didática — Texto Descritivo (3° ano)

**Encontros:** 4 aulas de 45 min
**BNCC:** EF03LP24 — Ler/produzir textos descritivos.

### Roteiro
1. **Caixa Surpresa** — Observação de um objeto misterioso usando os 5 sentidos.
2. **Escrita sensorial** — Descrição individual a partir da observação.
3. **Adivinhe o objeto** — Troca de textos entre colegas.
4. **Reescrita coletiva** — Revisão com apoio do mural da turma.

Quer ênfase em **vocabulário sensorial** ou em **adjetivação**?`,
    },
    {
      role: 'user',
      content: 'Adjetivação, porque eles repetem muito "bonito" e "legal".',
    },
    {
      role: 'assistant',
      content: `Excelente diagnóstico! Adicionei:

- 🎨 **Parede de Adjetivos** — mural colaborativo que cresce a cada aula.
- 📚 **Banco de 60 adjetivos sensoriais**, agrupados por sentido (visão, audição, tato, olfato, paladar).
- 🚫 **Jogo "Proibidão"** — durante a escrita, *bonito*, *legal* e *muito* viram palavras-banidas. Cada substituição criativa vale 1 ponto.

Quer que eu prepare a **Parede de Adjetivos em PDF imprimível** (A2 colorido)?`,
    },
  ],

  // ──────────────────────────────────────────────────────────────────────────
  // 3. Sequência Didática
  // ──────────────────────────────────────────────────────────────────────────
  sequencia: [
    {
      role: 'user',
      content:
        'Elabore uma oficina de produção de poemas com jogos de rimas para o 5° ano.',
    },
    {
      role: 'assistant',
      content: `## 🎭 Oficina — Poesia & Rimas (5° ano)

**3 aulas de 45 min** — BNCC EF05LP25.

### Programação
- **Aula 1 — Ouvido poético** 🎵
  Bingo das Rimas + leitura de Vinicius de Moraes e Cecília Meireles.
- **Aula 2 — Mão na massa** ✏️
  Escrita guiada "verso a verso" usando palavras-semente sorteadas.
- **Aula 3 — Sarau da turma** 🎤
  Declamação dos poemas autorais.

Quer estrutura livre ou **estrofes fixas** (ex.: quartetos)?`,
    },
    {
      role: 'user',
      content: 'Quartetos, e queria incluir um momento de ilustração.',
    },
    {
      role: 'assistant',
      content: `Combinado! Ajustei a oficina:

- 📐 **Quartetos com rima ABAB** como estrutura base.
- 🖍️ **Momento Ateliê** ao final da Aula 2 (15 min) — cada aluno ilustra um verso do próprio poema.
- 📖 **Livreto coletivo "Poesias do 5° ano"** com as ilustrações digitalizadas, entregue no sarau.

Posso gerar a **capa do livreto** (3 opções de tema) para você escolher?`,
    },
  ],

  // ──────────────────────────────────────────────────────────────────────────
  // 4. Projeto de Escrita
  // ──────────────────────────────────────────────────────────────────────────
  projeto: [
    {
      role: 'user',
      content:
        'Monte um projeto de jornal escolar com textos informativos para o 7° ano.',
    },
    {
      role: 'assistant',
      content: `## 📰 Projeto "Repórter na Escola" (7° ano)

**Duração:** 4 semanas — BNCC EF67LP08 / EF67LP10.

### Cronograma
- **Semana 1** — Estudo de manchetes, lead e pirâmide invertida.
- **Semana 2** — Pauta colaborativa + divisão em editorias (Esportes, Cultura, Comunidade, Ciência).
- **Semana 3** — Apuração e escrita em duplas.
- **Semana 4** — Diagramação e lançamento.

Formato final: **impresso**, **digital (PDF/site)** ou **os dois**?`,
    },
    {
      role: 'user',
      content: 'Digital em PDF, e como avalio sem ser só pela nota da escrita?',
    },
    {
      role: 'assistant',
      content: `Ótima pergunta! Sugiro **avaliação 360°** em 4 dimensões iguais (25% cada):

1. 🔄 **Processo** — participação na pauta e reuniões de redação (autoavaliação).
2. 📝 **Produto** — qualidade do texto via rubrica (lead, clareza, fontes citadas).
3. 🤝 **Colaboração** — feedback do par de dupla.
4. 📊 **Impacto** — engajamento dos leitores via formulário após o lançamento.

Quer que eu monte os **4 instrumentos prontos pra imprimir** (rubrica + 3 formulários)?`,
    },
  ],
};
