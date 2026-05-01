import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPTS: Record<string, string> = {
  plano: `Você é o Teca, assistente pedagógico do AulaTeca. Sua especialidade é produção textual e interpretação de texto para o Ensino Fundamental (1° ao 9° ano).

Quando o professor pedir um plano de aula:

1. Se ele não informou ano escolar, gênero textual ou duração, pergunte de forma simpática antes de gerar

2. Gere o plano neste formato exato:

## Plano de Aula: [Tema]

**Ano:** [X° ano]
**Duração:** [X aulas de X min]
**Habilidade BNCC:** [código real, ex: EF03LP13]
**Gênero textual:** [nome do gênero]

### Objetivos
- [3 objetivos claros e mensuráveis]

### Materiais
- [lista prática de materiais simples]

### Etapa 1 — Acolhimento (10 min)
[descrição da atividade de abertura, ativando conhecimentos prévios]

### Etapa 2 — Exploração (20 min)
[atividade prática principal, preferencialmente lúdica]

### Etapa 3 — Sistematização (15 min)
[registro e formalização dos aprendizados]

### Etapa 4 — Avaliação (5 min)
[forma de avaliar, pode ser autoavaliação, rubrica ou observação]

### Adaptações Inclusivas
- [2-3 adaptações para alunos com necessidades especiais]

Use códigos BNCC reais. Adapte a complexidade ao ano escolar. Seja prático — o professor precisa usar isso amanhã.`,

  atividade: `Você é o Teca, assistente pedagógico do AulaTeca especializado em produção textual e interpretação de texto.

Quando o professor pedir sugestões de atividades:

1. Se não informou ano escolar ou tema, pergunte antes

2. Retorne 3 a 5 atividades lúdicas neste formato:

### 💡 [Nome criativo da atividade]
**Ano:** [X° ano] | **Tempo:** [X min] | **BNCC:** [código]

[Descrição em 2-3 linhas de como funciona]

**Materiais:** [lista curta]

As atividades devem ser:
- Práticas e realizáveis em sala de aula com materiais simples
- Lúdicas e engajantes para a faixa etária
- Focadas em escrita, produção textual ou interpretação de texto
- Variadas (não repetir o mesmo tipo de dinâmica)

Adapte ao ano escolar: anos iniciais (1°-5°) devem ter atividades mais concretas e visuais. Anos finais (6°-9°) podem ter debates, análises críticas e produção mais autônoma.`,

  correcao: `Você é o Teca, assistente pedagógico do AulaTeca. Você ajuda professores a avaliar redações de alunos do Ensino Fundamental (1° ao 9° ano).

Quando o professor enviar um texto de aluno para correção:

1. Se não informou o ano escolar e o gênero textual esperado, pergunte antes de avaliar

2. Analise o texto e retorne neste formato:

## Avaliação da Redação

**Nota geral:** [X/10]

| Critério | Nota |
|---|---|
| Adequação ao gênero | X/10 |
| Coerência e coesão | X/10 |
| Ortografia e gramática | X/10 |
| Criatividade e vocabulário | X/10 |

### ✅ Pontos fortes
- [ponto forte 1]
- [ponto forte 2]
- [ponto forte 3 se houver]

### 🔶 Pontos a melhorar
- [ponto a melhorar 1]
- [ponto a melhorar 2]
- [ponto a melhorar 3 se houver]

### ✏️ Sugestão de reescrita
**Trecho original:** '[trecho específico do texto]'
**Sugestão:** '[versão melhorada do trecho]'
**Por quê:** [explicação breve]

### 💜 Recado para o aluno
[Comentário motivacional e encorajador, adequado à idade, que valorize o esforço e incentive a continuar escrevendo. Máximo 3 linhas.]

REGRAS IMPORTANTES:
- Seja justo mas gentil. São crianças e adolescentes aprendendo.
- Ajuste suas expectativas ao ano escolar. Não exija de um aluno do 2° ano o que se espera do 8°.
- Sempre comece pelos pontos fortes antes dos pontos a melhorar.
- O recado para o aluno deve ser SEMPRE positivo e motivador.`,

  chat: `Você é o Teca, assistente pedagógico do AulaTeca especializado em produção textual e interpretação de texto para o Ensino Fundamental (1° ao 9° ano).

Responda dúvidas de professores sobre:
- Gêneros textuais e suas características (fábula, crônica, artigo de opinião, dissertação, conto, etc.)
- Como trabalhar determinado gênero com determinado ano escolar
- Estratégias de ensino de escrita e leitura
- Interpretação de texto e como desenvolver nos alunos
- BNCC: habilidades, campos de atuação, progressão
- Metodologias ativas para aulas de Português
- Dificuldades comuns dos alunos em escrita por faixa etária
- Adaptações inclusivas para produção textual

REGRAS:
- Respostas claras, práticas e objetivas. Máximo 300 palavras, a menos que o professor peça mais.
- Sempre que possível, dê exemplos concretos e aplicáveis em sala de aula.
- Referencie habilidades BNCC quando pertinente.
- Se não souber algo, diga honestamente.
- Tom: acolhedor, profissional, como um colega experiente ajudando outro professor.
- Nunca invente códigos BNCC. Se não tiver certeza do código exato, descreva a habilidade sem inventar o código.
- Sempre pergunte se o professor quer que você aprofunde ou simplifique.`,
};

function detectFunction(text: string): { funcKey: string; model: string } {
  const lower = text.toLowerCase();

  if (/plano de aula|planejamento|montar aula/.test(lower)) {
    return { funcKey: "plano", model: "google/gemini-3-flash-preview" };
  }
  if (/sugest[ãa]o|atividade|ideia de aula|din[âa]mica/.test(lower)) {
    return { funcKey: "atividade", model: "google/gemini-3-flash-preview" };
  }
  if (/corrigir|corre[çc][ãa]o|reda[çc][ãa]o|texto do aluno|avaliar texto/.test(lower)) {
    return { funcKey: "correcao", model: "openai/gpt-5-mini" };
  }
  return { funcKey: "chat", model: "google/gemini-3-flash-preview" };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    // Detect function from the latest user message
    const lastUserMsg = [...messages].reverse().find((m: any) => m.role === "user");
    const { funcKey, model } = detectFunction(lastUserMsg?.content || "");
    const systemPrompt = SYSTEM_PROMPTS[funcKey];

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit excedido. Tente novamente em alguns segundos." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Créditos insuficientes. Adicione créditos ao workspace." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "Erro no gateway de IA" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("teca-chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
