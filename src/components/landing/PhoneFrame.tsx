import type { ReactNode } from "react";

interface PhoneFrameProps {
  /** Corpo da tela. Recebe `flex-1 min-h-0`, então pode crescer e recortar. */
  children: ReactNode;
  /** Barra de navegação. As telas de e-mail e de auth do tutorial não têm. */
  footer?: ReactNode;
  /**
   * Cor da superfície do aparelho. `dark` é o fundo `#0A0A12` das telas de
   * acesso (`AuthShell`): sem isto, a status bar e o home indicator continuavam
   * claros e a tela escura ficava com uma faixa branca embaixo.
   */
  tone?: "light" | "dark";
  /** Largura do aparelho. */
  className?: string;
}

// ══════════════════════════════════════════════════════════════════════════════
// A moldura dos celulares da landing: aparelho preto, notch, status bar,
// home indicator e o glow laranja atrás.
//
// Estava embutida no HeroPhone até o tutorial em vídeo virar um segundo
// celular. Duplicá-la é como um dos dois fica para trás no próximo ajuste
// visual — o mesmo motivo que fez o AuthShell existir.
// ══════════════════════════════════════════════════════════════════════════════

const PhoneFrame = ({
  children,
  footer,
  tone = "light",
  className = "w-[280px] sm:w-[320px]",
}: PhoneFrameProps) => {
  const escuro = tone === "dark";
  const tinta = escuro ? "#FFFFFF" : "#1A1D2B";

  return (
    // `text-left` explícito: o aparelho é uma tela de app, e herdar o
    // alinhamento da seção que o contém deixou o e-mail do tutorial
    // centralizado dentro do painel `text-center` do "Como funciona".
    <div className={`relative text-left ${className}`}>
      {/* Moldura */}
      <div className="relative bg-black rounded-[3rem] p-3 shadow-2xl shadow-black/30">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[120px] h-[30px] bg-black rounded-b-2xl z-10" />

        <div
          className="rounded-[2.4rem] overflow-hidden aspect-[9/19.5] flex flex-col"
          style={{ background: escuro ? "#0A0A12" : "#FAFBFD" }}
        >
          {/* Status bar */}
          <div className="flex items-center justify-between px-5 pt-3 pb-1 shrink-0">
            <span
              className="font-nunito text-[9px] font-bold"
              style={{ color: tinta }}
            >
              9:41
            </span>
            <div className="flex items-center gap-1" aria-hidden="true">
              <span className="flex items-end gap-[1.5px]">
                {[3, 5, 7, 9].map((h) => (
                  <span
                    key={h}
                    style={{ height: h, background: tinta }}
                    className="w-[2px] rounded-sm"
                  />
                ))}
              </span>
              <span
                className="ml-0.5 w-4 h-[8px] rounded-[2px] border p-[1px] flex"
                style={{ borderColor: tinta }}
              >
                <span
                  className="flex-1 rounded-[1px]"
                  style={{ background: tinta }}
                />
              </span>
            </div>
          </div>

          <div className="flex-1 min-h-0 flex flex-col">{children}</div>

          {footer}

          {/* Home indicator. No claro a faixa é branca para emendar com a barra
              de abas, que também é; no escuro ela some no fundo do aparelho. */}
          <div
            className={`flex justify-center pb-1.5 pt-0.5 shrink-0 ${
              escuro ? "" : "bg-white"
            }`}
          >
            <span
              className="w-16 h-[3px] rounded-full"
              style={{
                background: escuro ? "rgba(255,255,255,0.3)" : "rgba(26,29,43,0.25)",
              }}
            />
          </div>
        </div>
      </div>

      {/* Glow atrás do aparelho */}
      <div className="absolute inset-0 -z-10 rounded-[3rem] bg-[#FFB830]/20 blur-3xl scale-110" />
    </div>
  );
};

export default PhoneFrame;
