import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  BarChart3,
  CheckCircle2,
  ChevronDown,
  Copy,
  FileDown,
  Send,
  Sparkles,
  Timer,
} from "lucide-react";
import tecaMascot from "@/assets/teca-mascot.png";

// ══════════════════════════════════════════════════════════════════════════════
// Demo do TECA na landing — reproduz a experiência da /ai-plan sem chamar o LLM.
// O conteúdo dos planos vem das conversas já validadas em lib/mockConversations.
// ══════════════════════════════════════════════════════════════════════════════

const anos = [
  "1º ano",
  "2º ano",
  "3º ano",
  "4º ano",
  "5º ano",
  "6º ano",
  "7º ano",
  "8º ano",
  "9º ano",
];

interface Etapa {
  tempo: string;
  titulo: string;
  desc: string;
}

interface Genero {
  label: string;
  /** Ano cujo código BNCC abaixo se aplica — em outros anos mostramos só "Alinhado à BNCC". */
  anoCanonico: string;
  bncc: string;
  tema: string;
  duracao: string;
  nivel: string;
  etapas: Etapa[];
  extras: string[];
  followUp: string;
}

const generos: Record<string, Genero> = {
  narrativa: {
    label: "Narrativa criativa",
    anoCanonico: "4º ano",
    bncc: "EF04LP21",
    tema: "uma aventura no fundo do mar",
    duracao: "50 min",
    nivel: "Médio",
    etapas: [
      {
        tempo: "10 min",
        titulo: "Aquecimento — Dado de Histórias",
        desc: "Cada aluno sorteia personagem, lugar e objeto ligados a {tema}.",
      },
      {
        tempo: "15 min",
        titulo: "Planejamento",
        desc: "Organizador gráfico com começo, meio e fim preenchido em dupla.",
      },
      {
        tempo: "20 min",
        titulo: "Escrita guiada",
        desc: "Produção individual com apoio docente e banco de conectivos na lousa.",
      },
      {
        tempo: "5 min",
        titulo: "Roda de leitura",
        desc: "Compartilhamento voluntário dos trechos favoritos.",
      },
    ],
    extras: [
      "Rubrica de avaliação em 4 níveis",
      "Ficha do organizador gráfico imprimível em A4",
      "Adaptação para alunos com baixa visão",
    ],
    followUp:
      "Quer que eu reorganize em 5 estações rotativas para turmas de 25 alunos?",
  },
  descritivo: {
    label: "Texto descritivo",
    anoCanonico: "3º ano",
    bncc: "EF03LP24",
    tema: "um objeto misterioso",
    duracao: "45 min",
    nivel: "Fácil",
    etapas: [
      {
        tempo: "10 min",
        titulo: "Caixa Surpresa",
        desc: "Observação de {tema} usando os cinco sentidos, sem poder mostrar à turma.",
      },
      {
        tempo: "15 min",
        titulo: "Escrita sensorial",
        desc: "Descrição individual a partir da observação, com o banco de adjetivos aberto.",
      },
      {
        tempo: "10 min",
        titulo: "Adivinhe o objeto",
        desc: "Troca de textos entre colegas — quem acerta pela descrição pontua.",
      },
      {
        tempo: "10 min",
        titulo: "Reescrita coletiva",
        desc: "Revisão com apoio do mural da turma e da Parede de Adjetivos.",
      },
    ],
    extras: [
      "Banco de 60 adjetivos sensoriais agrupados por sentido",
      "Parede de Adjetivos em PDF colorido (A2)",
      'Jogo "Proibidão": bonito, legal e muito viram palavras banidas',
    ],
    followUp:
      "Quer que eu troque a ênfase de adjetivação para vocabulário sensorial?",
  },
  poema: {
    label: "Poema com rimas",
    anoCanonico: "5º ano",
    bncc: "EF05LP25",
    tema: "as estações do ano",
    duracao: "45 min",
    nivel: "Médio",
    etapas: [
      {
        tempo: "15 min",
        titulo: "Ouvido poético",
        desc: "Bingo das Rimas + leitura de Cecília Meireles com foco em {tema}.",
      },
      {
        tempo: "15 min",
        titulo: "Mão na massa",
        desc: "Escrita de quartetos com rima ABAB a partir de palavras-semente sorteadas.",
      },
      {
        tempo: "10 min",
        titulo: "Momento Ateliê",
        desc: "Cada aluno ilustra um verso do próprio poema.",
      },
      {
        tempo: "5 min",
        titulo: "Sarau da turma",
        desc: "Declamação dos poemas autorais em roda.",
      },
    ],
    extras: [
      "Cartelas do Bingo das Rimas prontas para imprimir",
      "Livreto coletivo com as ilustrações digitalizadas",
      "Capa do livreto em 3 opções de tema",
    ],
    followUp: "Quer estrutura livre em vez de quartetos?",
  },
  noticia: {
    label: "Notícia / jornal escolar",
    anoCanonico: "7º ano",
    bncc: "EF67LP08",
    tema: "o dia a dia da escola",
    duracao: "50 min",
    nivel: "Avançado",
    etapas: [
      {
        tempo: "10 min",
        titulo: "Manchete relâmpago",
        desc: "Leitura de 3 manchetes reais sobre {tema} e caça ao lead.",
      },
      {
        tempo: "10 min",
        titulo: "Pauta colaborativa",
        desc: "Divisão da turma em editorias: Esportes, Cultura, Comunidade e Ciência.",
      },
      {
        tempo: "25 min",
        titulo: "Apuração e escrita",
        desc: "Produção em duplas usando a pirâmide invertida.",
      },
      {
        tempo: "5 min",
        titulo: "Fechamento",
        desc: "Montagem do mural-jornal da turma com as laudas prontas.",
      },
    ],
    extras: [
      "Rubrica de avaliação 360° em 4 dimensões",
      "Modelo de pauta e de lauda para imprimir",
      "Diagramação do jornal em PDF",
    ],
    followUp:
      "Quer que eu transforme isso num projeto de 4 semanas com jornal digital?",
  },
};

type GeneroKey = keyof typeof generos;

type Phase = "idle" | "typing" | "thinking" | "streaming" | "done";

const BLOCK_DELAY = 280;
const CHAR_DELAY = 22;
const THINKING_DELAY = 900;

const TecaDemoSection = () => {
  const [generoKey, setGeneroKey] = useState<GeneroKey>("narrativa");
  const [ano, setAno] = useState(generos.narrativa.anoCanonico);
  const [tema, setTema] = useState(generos.narrativa.tema);

  const [phase, setPhase] = useState<Phase>("idle");
  const [typed, setTyped] = useState("");
  const [revealed, setRevealed] = useState(0);

  const sectionRef = useRef<HTMLElement>(null);
  const playedRef = useRef(false);
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  // O observer é montado uma vez só; sem este ref ele dispararia a `run` do
  // primeiro render, digitando o prompt antigo se a visitante já tiver trocado
  // o gênero/ano antes da seção chegar na tela.
  const runRef = useRef<() => void>(() => {});

  const genero = generos[generoKey];
  const promptText = `Monte um plano de aula de ${genero.label.toLowerCase()} para o ${ano}. Tema: ${tema}.`;
  // meta + etapas + extras + follow-up
  const totalBlocks = genero.etapas.length + 3;

  const clearTimers = () => {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const later = (fn: () => void, ms: number) => {
    timeoutsRef.current.push(setTimeout(fn, ms));
  };

  const run = () => {
    clearTimers();

    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduced) {
      setTyped(promptText);
      setRevealed(totalBlocks);
      setPhase("done");
      return;
    }

    setTyped("");
    setRevealed(0);
    setPhase("typing");

    // 1. Digita a pergunta da professora
    let i = 0;
    intervalRef.current = setInterval(() => {
      i += 1;
      setTyped(promptText.slice(0, i));
      if (i >= promptText.length) {
        if (intervalRef.current) clearInterval(intervalRef.current);
        intervalRef.current = null;
        setPhase("thinking");

        // 2. Teca "pensando" e 3. resposta em blocos
        later(() => {
          // o 1º bloco entra junto com a bolha, senão ela pisca vazia
          setPhase("streaming");
          setRevealed(1);
          for (let b = 2; b <= totalBlocks; b += 1) {
            later(() => {
              setRevealed(b);
              if (b === totalBlocks) setPhase("done");
            }, (b - 1) * BLOCK_DELAY);
          }
        }, THINKING_DELAY);
      }
    }, CHAR_DELAY);
  };

  useEffect(() => {
    runRef.current = run;
  });

  // Dispara sozinho quando a seção entra na tela (só na primeira vez).
  // rootMargin negativo em vez de threshold: a seção pode ficar mais alta que a
  // viewport no mobile e nunca atingir uma fração fixa de visibilidade.
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !playedRef.current) {
            playedRef.current = true;
            runRef.current();
          }
        });
      },
      { threshold: 0, rootMargin: "-25% 0px -25% 0px" },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => clearTimers, []);

  // Qualquer mudança nos campos volta pro estado de espera: se o plano
  // continuasse na tela ele passaria a mostrar o ano/tema novo num plano que
  // não foi regerado, e a bolha ficaria com a pergunta antiga.
  const resetOutput = () => {
    clearTimers();
    setPhase("idle");
    setTyped("");
    setRevealed(0);
  };

  const handleGenero = (key: GeneroKey) => {
    setGeneroKey(key);
    setAno(generos[key].anoCanonico);
    setTema(generos[key].tema);
    resetOutput();
  };

  const handleAno = (value: string) => {
    setAno(value);
    resetOutput();
  };

  const handleTema = (value: string) => {
    setTema(value);
    if (phase !== "idle") resetOutput();
  };

  const running = phase === "typing" || phase === "thinking";
  const showBncc = ano === genero.anoCanonico;
  const fill = (text: string) => text.replace("{tema}", tema.trim() || genero.tema);

  const selectClass =
    "w-full appearance-none font-nunito text-sm bg-white border border-[#6366F1]/20 rounded-xl pl-3 pr-9 py-2.5 text-[#1A1D2B] outline-none cursor-pointer transition-all duration-200 focus:ring-2 focus:ring-[#6366F1]/40";

  return (
    <section
      ref={sectionRef}
      className="relative py-16 sm:py-20 lg:py-24 overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-[#EEF2FF] to-[#F5F3FF]" />
      <div className="absolute inset-0 bg-[rgba(99,102,241,0.03)]" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Headline */}
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-14">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#6366F1]/10 text-[#6366F1] text-xs font-nunito font-bold uppercase tracking-wider mb-4">
            <Sparkles className="w-3.5 h-3.5" /> TECA · IA pedagógica
          </span>
          <h2 className="font-fredoka font-bold text-2xl sm:text-3xl lg:text-4xl text-[#1A1D2B] leading-tight mb-4">
            Veja o TECA montar um plano de aula em{" "}
            <span className="text-[#6366F1]">30 segundos</span>
          </h2>
          <p className="font-nunito text-base sm:text-lg text-[#6B7186] leading-relaxed">
            Escolha o ano, o gênero e o tema. O TECA escreve o plano completo —
            com etapas, tempo de cada momento, materiais e alinhamento à BNCC.
          </p>
        </div>

        <div className="grid lg:grid-cols-[minmax(0,340px)_minmax(0,1fr)] gap-6 lg:gap-8 items-start max-w-5xl mx-auto">
          {/* ── Coluna esquerda: o que a professora escolhe ── */}
          <div className="bg-white rounded-2xl shadow-lg shadow-[#6366F1]/5 border border-[#6366F1]/10 p-5 sm:p-6">
            <p className="text-xs font-nunito font-bold text-[#6366F1] uppercase tracking-wider mb-5">
              Você escolhe
            </p>

            <div className="space-y-4">
              <div>
                <label
                  htmlFor="teca-demo-ano"
                  className="block font-nunito text-xs font-bold text-[#6B7186] mb-1.5"
                >
                  Ano escolar
                </label>
                <div className="relative">
                  <select
                    id="teca-demo-ano"
                    value={ano}
                    onChange={(e) => handleAno(e.target.value)}
                    className={selectClass}
                  >
                    {anos.map((a) => (
                      <option key={a} value={a}>
                        {a}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-[#6B7186] pointer-events-none" />
                </div>
              </div>

              <div>
                <label
                  htmlFor="teca-demo-genero"
                  className="block font-nunito text-xs font-bold text-[#6B7186] mb-1.5"
                >
                  Gênero textual
                </label>
                <div className="relative">
                  <select
                    id="teca-demo-genero"
                    value={generoKey}
                    onChange={(e) => handleGenero(e.target.value as GeneroKey)}
                    className={selectClass}
                  >
                    {(Object.keys(generos) as GeneroKey[]).map((key) => (
                      <option key={key} value={key}>
                        {generos[key].label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-[#6B7186] pointer-events-none" />
                </div>
              </div>

              <div>
                <label
                  htmlFor="teca-demo-tema"
                  className="block font-nunito text-xs font-bold text-[#6B7186] mb-1.5"
                >
                  Tema da aula
                </label>
                <input
                  id="teca-demo-tema"
                  value={tema}
                  onChange={(e) => handleTema(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") run();
                  }}
                  maxLength={60}
                  placeholder={genero.tema}
                  className="w-full font-nunito text-sm bg-white border border-[#6366F1]/20 rounded-xl px-3 py-2.5 text-[#1A1D2B] placeholder:text-[#6B7186]/60 outline-none transition-all duration-200 focus:ring-2 focus:ring-[#6366F1]/40"
                />
              </div>

              <button
                type="button"
                onClick={run}
                disabled={running}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-[#6366F1] to-[#4F46E5] text-white font-nunito font-extrabold text-sm py-3 transition-all duration-200 hover:brightness-110 hover:-translate-y-0.5 active:translate-y-0 shadow-[0_4px_16px_rgba(99,102,241,0.35)] disabled:opacity-70 disabled:translate-y-0 disabled:cursor-default"
              >
                <Send className="w-4 h-4" />
                {running
                  ? "GERANDO..."
                  : phase === "idle"
                    ? "GERAR PLANO"
                    : "GERAR DE NOVO"}
              </button>
            </div>

            <div className="mt-5 pt-5 border-t border-[#6366F1]/10 space-y-2">
              {[
                "Alinhado à BNCC automaticamente",
                "Exporta em PDF e Word",
                "Você edita tudo depois",
              ].map((item) => (
                <p
                  key={item}
                  className="flex items-start gap-2 font-nunito text-xs text-[#6B7186]"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#6366F1] shrink-0 mt-0.5" />
                  {item}
                </p>
              ))}
            </div>
          </div>

          {/* ── Coluna direita: o TECA respondendo ── */}
          <div className="bg-white rounded-2xl shadow-xl shadow-[#6366F1]/10 border border-[#6366F1]/10 overflow-hidden">
            {/* Barra de janela */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-[#6366F1]/10 bg-[#FAFBFD]">
              <span className="w-2.5 h-2.5 rounded-full bg-[#FF6B6B]" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#FFB830]" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#4ECDC4]" />
              <span className="ml-2 font-nunito text-xs font-semibold text-[#6B7186]">
                Teca — Assistente de Escrita
              </span>
            </div>

            <div
              className="p-4 sm:p-6 space-y-4 min-h-[420px]"
              aria-busy={phase === "typing" || phase === "thinking" || phase === "streaming"}
            >
              {phase === "idle" ? (
                <div className="flex flex-col items-center justify-center text-center py-14">
                  <img
                    src={tecaMascot}
                    alt="Teca"
                    width={96}
                    height={96}
                    loading="lazy"
                    decoding="async"
                    className="w-24 h-24 object-contain mb-4 animate-float"
                  />
                  <p className="font-nunito text-sm text-[#6B7186] max-w-xs">
                    É só clicar em{" "}
                    <strong className="text-[#1A1D2B]">GERAR PLANO</strong> e ver
                    o TECA montar a aula de {genero.label.toLowerCase()} do{" "}
                    {ano}.
                  </p>
                </div>
              ) : (
                <>
                  {/* Pergunta da professora */}
                  <div className="flex justify-end animate-slide-up">
                    <div className="max-w-[85%] rounded-2xl px-4 py-3 bg-gradient-to-br from-[#6366F1] to-[#4F46E5] text-white font-nunito text-sm leading-relaxed">
                      {typed}
                      {phase === "typing" && (
                        <span className="inline-block ml-0.5 animate-pulse-dot">
                          ▌
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Resposta do TECA */}
                  {phase !== "typing" && (
                    <div className="flex gap-3 animate-slide-up">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#6366F1] to-[#A29BFE] flex items-center justify-center shrink-0 overflow-hidden">
                        <img
                          src={tecaMascot}
                          alt="Teca"
                          width={28}
                          height={28}
                          loading="lazy"
                          decoding="async"
                          className="w-7 h-7 object-contain"
                        />
                      </div>

                      {phase === "thinking" ? (
                        <div className="rounded-2xl bg-[#FAFBFD] border border-[#6366F1]/10 px-4 py-4 flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-[#6366F1] animate-pulse-dot" />
                          <span
                            className="w-2 h-2 rounded-full bg-[#6366F1] animate-pulse-dot"
                            style={{ animationDelay: "0.2s" }}
                          />
                          <span
                            className="w-2 h-2 rounded-full bg-[#6366F1] animate-pulse-dot"
                            style={{ animationDelay: "0.4s" }}
                          />
                        </div>
                      ) : (
                        <div className="flex-1 min-w-0 rounded-2xl bg-[#FAFBFD] border border-[#6366F1]/10 p-4">
                          <div className="flex items-center gap-2 pb-2 mb-3 border-b border-[#6366F1]/10">
                            <span className="font-fredoka text-xs font-bold text-[#6366F1]">
                              Teca
                            </span>
                            <span className="font-nunito text-[10px] text-[#6B7186]">
                              • agora
                            </span>
                          </div>

                          {/* Bloco 1 — cabeçalho + métricas */}
                          {revealed >= 1 && (
                            <div className="animate-slide-up">
                              <h3 className="font-fredoka font-bold text-base text-[#1A1D2B] mb-3">
                                📋 Plano de Aula — {genero.label} · {ano}
                              </h3>
                              <div className="grid grid-cols-3 gap-2 mb-4">
                                {[
                                  {
                                    icon: Timer,
                                    label: "Duração",
                                    value: genero.duracao,
                                    color: "#4ECDC4",
                                  },
                                  {
                                    icon: BarChart3,
                                    label: "Nível",
                                    value: genero.nivel,
                                    color: "#FFB830",
                                  },
                                  {
                                    icon: CheckCircle2,
                                    label: "BNCC",
                                    value: showBncc ? genero.bncc : "Alinhado",
                                    color: "#6366F1",
                                  },
                                ].map((m) => (
                                  <div
                                    key={m.label}
                                    className="rounded-xl bg-white border border-[#6366F1]/10 p-2.5 text-center"
                                  >
                                    <m.icon
                                      className="w-4 h-4 mx-auto mb-1"
                                      style={{ color: m.color }}
                                    />
                                    <div className="font-nunito text-[10px] text-[#6B7186]">
                                      {m.label}
                                    </div>
                                    <div className="font-nunito text-[11px] font-bold text-[#1A1D2B] truncate">
                                      {m.value}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Blocos 2..n — etapas */}
                          {genero.etapas.map((etapa, i) =>
                            revealed >= i + 2 ? (
                              <div
                                key={etapa.titulo}
                                className="flex gap-3 mb-3 animate-slide-up"
                              >
                                <span className="shrink-0 mt-0.5 px-2 py-0.5 rounded-full bg-[#6366F1]/10 text-[#6366F1] font-nunito text-[10px] font-bold whitespace-nowrap">
                                  {etapa.tempo}
                                </span>
                                <div className="min-w-0">
                                  <p className="font-nunito text-sm font-bold text-[#1A1D2B]">
                                    {i + 1}. {etapa.titulo}
                                  </p>
                                  <p className="font-nunito text-[13px] text-[#6B7186] leading-relaxed">
                                    {fill(etapa.desc)}
                                  </p>
                                </div>
                              </div>
                            ) : null,
                          )}

                          {/* Penúltimo bloco — materiais inclusos */}
                          {revealed >= genero.etapas.length + 2 && (
                            <div className="animate-slide-up mt-4 pt-3 border-t border-[#6366F1]/10">
                              <p className="font-nunito text-xs font-bold text-[#1A1D2B] mb-2">
                                📦 Já vem pronto com você:
                              </p>
                              <ul className="space-y-1.5">
                                {genero.extras.map((extra) => (
                                  <li
                                    key={extra}
                                    className="flex items-start gap-2 font-nunito text-[13px] text-[#6B7186]"
                                  >
                                    <CheckCircle2 className="w-3.5 h-3.5 text-[#4ECDC4] shrink-0 mt-0.5" />
                                    {extra}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {/* Último bloco — follow-up + ações */}
                          {revealed >= totalBlocks && (
                            <div className="animate-slide-up">
                              <p className="font-nunito text-[13px] text-[#1A1D2B] mt-4 p-3 rounded-xl bg-[#6366F1]/5 border border-[#6366F1]/10">
                                {genero.followUp}
                              </p>
                              {/* Ilustrativos: são os botões reais da /ai-plan.
                                  aria-hidden pra não anunciar ação que não existe aqui. */}
                              <div
                                className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-[#6366F1]/10 select-none"
                                aria-hidden="true"
                              >
                                {[
                                  { icon: Copy, label: "Copiar" },
                                  { icon: FileDown, label: "Baixar PDF" },
                                  { icon: FileDown, label: "Word" },
                                ].map((action) => (
                                  <span
                                    key={action.label}
                                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white border border-[#6366F1]/15 font-nunito text-[10px] font-semibold text-[#6B7186]"
                                  >
                                    <action.icon className="w-3 h-3" />
                                    {action.label}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-10 sm:mt-14">
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-[#FFB830] text-[#1A1D2B] font-nunito font-extrabold text-base sm:text-lg hover:brightness-105 transition-all shadow-[0_4px_20px_rgba(255,184,48,0.5)] hover:shadow-[0_8px_30px_rgba(255,184,48,0.6)] hover:-translate-y-1 active:translate-y-0"
          >
            QUERO TESTAR O TECA AGORA →
          </Link>
          <p className="mt-4 font-nunito text-sm text-[#6B7186]">
            É assim de verdade, dentro da plataforma. Nenhuma outra faz isso.
          </p>
        </div>
      </div>
    </section>
  );
};

export default TecaDemoSection;
