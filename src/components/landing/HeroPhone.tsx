import { useEffect, useRef, useState } from "react";
import { Bell, BookOpen, Heart, Home, Menu, Sparkles, User } from "lucide-react";
// Versão recortada e reduzida (192px) do teca-icon.png: a arte original tem
// 669x373 com margens largas, então renderizava pequena dentro do celular e
// custava 209 KB acima da dobra.
import tecaIcon from "@/assets/teca-icon-sm.png";

// ══════════════════════════════════════════════════════════════════════════════
// Celular do hero — a tela é HTML de verdade, não print.
// Espelha a HomePage real (saudação, CTA do polvo, chips de categoria, bottom
// nav) e alterna sozinha entre Início → Catálogo → Favoritos.
// ══════════════════════════════════════════════════════════════════════════════

const SCREEN_MS = 3200;

const chips = [
  { label: "Todos", icon: "✦", active: true },
  { label: "Produção de Texto", icon: "✍️" },
  { label: "Interpretação", icon: "📖" },
  { label: "Lúdicas", icon: "🎲" },
];

const atividades = [
  { emoji: "🎲", titulo: "Bingo do Nome", ano: "1º ano", cor: "#FD79A8" },
  { emoji: "📖", titulo: "Aeroporto da Leitura", ano: "3º ano", cor: "#4ECDC4" },
  { emoji: "✍️", titulo: "Fábrica de Textos", ano: "5º ano", cor: "#6C5CE7" },
  { emoji: "🔍", titulo: "Fluência Leitora", ano: "2º ano", cor: "#45B7D1" },
];

const favoritos = [
  { emoji: "✍️", titulo: "Diário de Aventuras", ano: "4º ano" },
  { emoji: "🎲", titulo: "Aventuras Ortográficas", ano: "2º ano" },
  { emoji: "📖", titulo: "Banquinha de Leitura", ano: "3º ano" },
];

const navItems = [
  { icon: Home, label: "Início" },
  { icon: BookOpen, label: "Catálogo" },
  { icon: Heart, label: "Favoritos" },
  { icon: User, label: "Perfil" },
];

const Chips = () => (
  <div className="flex flex-wrap gap-1 px-3">
    {chips.map((chip) => (
      <span
        key={chip.label}
        className={`px-2 py-[3px] rounded-full text-[8px] font-nunito font-semibold whitespace-nowrap ${
          chip.active
            ? "bg-[#6366F1] text-white"
            : "bg-white text-[#6B7186] border border-[#E5E7F0]"
        }`}
      >
        {chip.icon} {chip.label}
      </span>
    ))}
  </div>
);

const HeroPhone = () => {
  const [screen, setScreen] = useState(0);
  const wrapRef = useRef<HTMLDivElement>(null);

  // Só roda enquanto está visível e a aba está em foco — não faz sentido
  // re-renderizar o celular enquanto a visitante lê o resto da página.
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    const el = wrapRef.current;
    if (!el) return;

    let timer: ReturnType<typeof setInterval> | null = null;
    let onScreen = false;

    const stop = () => {
      if (timer) {
        clearInterval(timer);
        timer = null;
      }
    };

    const sync = () => {
      const shouldRun = onScreen && document.visibilityState === "visible";
      if (shouldRun && !timer) {
        timer = setInterval(
          () => setScreen((s) => (s + 1) % navItems.length),
          SCREEN_MS,
        );
      } else if (!shouldRun) {
        stop();
      }
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          onScreen = entry.isIntersecting;
        });
        sync();
      },
      { threshold: 0 },
    );

    observer.observe(el);
    document.addEventListener("visibilitychange", sync);

    return () => {
      stop();
      observer.disconnect();
      document.removeEventListener("visibilitychange", sync);
    };
  }, []);

  return (
    <div ref={wrapRef} className="relative w-[280px] sm:w-[320px]">
      {/* Moldura */}
      <div className="relative bg-black rounded-[3rem] p-3 shadow-2xl shadow-black/30">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[120px] h-[30px] bg-black rounded-b-2xl z-10" />

        <div className="rounded-[2.4rem] overflow-hidden bg-[#FAFBFD] aspect-[9/19.5] flex flex-col">
          {/* Status bar */}
          <div className="flex items-center justify-between px-5 pt-3 pb-1 shrink-0">
            <span className="font-nunito text-[9px] font-bold text-[#1A1D2B]">
              9:41
            </span>
            <div className="flex items-center gap-1" aria-hidden="true">
              <span className="flex items-end gap-[1.5px]">
                {[3, 5, 7, 9].map((h) => (
                  <span
                    key={h}
                    style={{ height: h }}
                    className="w-[2px] rounded-sm bg-[#1A1D2B]"
                  />
                ))}
              </span>
              <span className="ml-0.5 w-4 h-[8px] rounded-[2px] border border-[#1A1D2B] p-[1px] flex">
                <span className="flex-1 bg-[#1A1D2B] rounded-[1px]" />
              </span>
            </div>
          </div>

          {/* Topbar do app */}
          <div className="flex items-center gap-2 px-3 py-2 border-b border-[#E5E7F0] shrink-0">
            <Menu className="w-3.5 h-3.5 text-[#1A1D2B]" />
            <img
              src={tecaIcon}
              alt=""
              width={18}
              height={18}
              className="w-[18px] h-[18px] object-contain"
            />
            <span className="font-fredoka font-bold text-[11px] text-[#1A1D2B]">
              Aulateca
            </span>
            <div className="ml-auto flex items-center gap-2">
              <span className="relative">
                <Bell className="w-3.5 h-3.5 text-[#6B7186]" />
                <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-[#FF6B6B]" />
              </span>
              <span className="w-5 h-5 rounded-full bg-[#EEF2FF] flex items-center justify-center font-nunito text-[9px] font-bold text-[#6366F1]">
                P
              </span>
            </div>
          </div>

          {/* Saudação */}
          <div className="px-3 pt-3 pb-2 shrink-0">
            <p className="font-fredoka font-bold text-[13px] text-[#6366F1]">
              Olá, professora! 👋
            </p>
            <p className="font-nunito text-[9px] text-[#6B7186] leading-snug">
              Comece pela IA ou explore os recursos abaixo.
            </p>
          </div>

          {/* Conteúdo que alterna */}
          <div key={screen} className="flex-1 min-h-0 animate-slide-up">
            {screen === 0 && (
              <div className="h-full flex flex-col">
                <div className="flex-1 flex flex-col items-center justify-center px-3">
                  <div className="relative">
                    <img
                      src={tecaIcon}
                      alt="Teca, o polvo do Aulateca"
                      width={96}
                      height={96}
                      className="w-24 h-24 object-contain drop-shadow-lg"
                    />
                    <span className="absolute -bottom-1 right-0 w-5 h-5 rounded-full bg-white shadow-md flex items-center justify-center">
                      <Sparkles className="w-2.5 h-2.5 text-[#6366F1]" />
                    </span>
                  </div>
                  <p className="mt-3 flex items-center gap-1 font-nunito text-[8px] font-bold uppercase tracking-wider text-[#6366F1]/80 text-center">
                    <span className="w-1 h-1 rounded-full bg-[#6366F1] animate-pulse-dot" />
                    Clique para conversar com a IA
                  </p>
                </div>
                <div className="pb-3">
                  <Chips />
                </div>
              </div>
            )}

            {screen === 1 && (
              <div className="h-full flex flex-col">
                <Chips />
                <div className="grid grid-cols-2 gap-1.5 px-3 pt-2.5">
                  {atividades.map((a, i) => (
                    <div
                      key={a.titulo}
                      style={{ animationDelay: `${0.06 * i}s` }}
                      className="rounded-lg bg-white border border-[#E5E7F0] overflow-hidden animate-slide-up"
                    >
                      <div
                        className="h-9 flex items-center justify-center text-base"
                        style={{ background: `${a.cor}1F` }}
                      >
                        {a.emoji}
                      </div>
                      <div className="p-1.5">
                        <p className="font-nunito text-[8px] font-bold text-[#1A1D2B] leading-tight line-clamp-2">
                          {a.titulo}
                        </p>
                        <span
                          className="inline-block mt-1 px-1.5 py-[1px] rounded-full font-nunito text-[7px] font-bold"
                          style={{ background: `${a.cor}22`, color: a.cor }}
                        >
                          {a.ano}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {screen === 2 && (
              <div className="h-full px-3 pt-1">
                <p className="font-nunito text-[9px] font-bold text-[#1A1D2B] mb-2">
                  Suas favoritas
                </p>
                <div className="space-y-1.5">
                  {favoritos.map((f, i) => (
                    <div
                      key={f.titulo}
                      style={{ animationDelay: `${0.07 * i}s` }}
                      className="flex items-center gap-2 p-1.5 rounded-lg bg-white border border-[#E5E7F0] animate-slide-up"
                    >
                      <span className="w-7 h-7 rounded-md bg-[#EEF2FF] flex items-center justify-center text-[11px] shrink-0">
                        {f.emoji}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="font-nunito text-[8px] font-bold text-[#1A1D2B] truncate">
                          {f.titulo}
                        </p>
                        <p className="font-nunito text-[7px] text-[#6B7186]">
                          {f.ano}
                        </p>
                      </div>
                      <Heart
                        className="w-3 h-3 text-[#FF6B6B] shrink-0"
                        fill="currentColor"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Bottom nav */}
          <div className="flex items-stretch border-t border-[#E5E7F0] bg-white shrink-0">
            {navItems.map((item, i) => {
              const active = i === screen;
              return (
                <div
                  key={item.label}
                  className="flex-1 flex flex-col items-center gap-0.5 py-2"
                >
                  <item.icon
                    className={`w-3.5 h-3.5 transition-colors duration-300 ${
                      active ? "text-[#6366F1]" : "text-[#B4B9C9]"
                    }`}
                    fill={active ? "currentColor" : "none"}
                  />
                  <span
                    className={`font-nunito text-[7px] transition-colors duration-300 ${
                      active
                        ? "text-[#6366F1] font-bold"
                        : "text-[#B4B9C9] font-semibold"
                    }`}
                  >
                    {item.label}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Home indicator */}
          <div className="flex justify-center pb-1.5 pt-0.5 bg-white shrink-0">
            <span className="w-16 h-[3px] rounded-full bg-[#1A1D2B]/25" />
          </div>
        </div>
      </div>

      {/* Glow atrás do aparelho */}
      <div className="absolute inset-0 -z-10 rounded-[3rem] bg-[#FFB830]/20 blur-3xl scale-110" />
    </div>
  );
};

export default HeroPhone;
