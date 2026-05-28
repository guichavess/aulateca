import { Link } from "react-router-dom";

const HeroSection = () => {
  return (
    <section className="relative overflow-hidden">
      {/* Barra topo BNCC */}
      <div className="bg-[#4F46E5] text-center py-2 px-4">
        <p className="text-white/90 text-xs sm:text-sm font-nunito font-semibold tracking-wide">
          ✓ TODAS AS ATIVIDADES ALINHADAS À BASE NACIONAL COMUM CURRICULAR (BNCC)
        </p>
      </div>

      {/* Hero principal */}
      <div className="relative bg-gradient-to-br from-[#6366F1] to-[#4F46E5] py-16 sm:py-20 lg:py-24">
        {/* Orbs decorativos */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div
            className="absolute rounded-full animate-float"
            style={{
              width: 400,
              height: 400,
              top: "5%",
              left: "-8%",
              background: "radial-gradient(circle, rgba(162,155,254,0.15), transparent 70%)",
              filter: "blur(60px)",
            }}
          />
          <div
            className="absolute rounded-full animate-float-delayed"
            style={{
              width: 300,
              height: 300,
              bottom: "10%",
              right: "-5%",
              background: "radial-gradient(circle, rgba(255,184,48,0.12), transparent 70%)",
              filter: "blur(60px)",
            }}
          />
          <div
            className="absolute rounded-full animate-float-slow"
            style={{
              width: 200,
              height: 200,
              top: "60%",
              left: "40%",
              background: "radial-gradient(circle, rgba(199,210,254,0.1), transparent 70%)",
              filter: "blur(50px)",
            }}
          />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Coluna esquerda — texto */}
            <div className="text-center lg:text-left">
              {/* Logo + badge */}
              <div className="flex items-center gap-3 justify-center lg:justify-start mb-8">
                <span className="text-3xl">🐙</span>
                <span className="font-fredoka font-bold text-2xl text-white">
                  AulaTeca
                </span>
                <span className="px-3 py-1 rounded-full bg-white/15 text-white/90 text-xs font-nunito font-semibold backdrop-blur-sm">
                  Ensino Fundamental 1 e 2
                </span>
              </div>

              {/* Headline */}
              <h1 className="font-fredoka font-bold text-3xl sm:text-4xl lg:text-5xl text-white leading-tight mb-6">
                Chega de perder noites montando aula.{" "}
                <span className="text-[#FFB830]">226+ atividades</span> de
                Produção de Textos prontas para usar AMANHÃ — com IA que faz o
                plano por você.
              </h1>

              {/* Corpo */}
              <p className="font-nunito text-base sm:text-lg text-white/85 leading-relaxed mb-4">
                Acesse agora a plataforma completa com{" "}
                <strong className="text-white">226+ atividades</strong>,{" "}
                <strong className="text-white">37 jogos lúdicos</strong> e{" "}
                <strong className="text-white">47 exercícios complementares</strong>{" "}
                de produção textual e interpretação de texto — fábula, crônica,
                notícia, artigo de opinião, texto dissertativo-argumentativo,
                cordel, charge, tirinha, biografia, debate, seminário, texto
                estilo ENEM e muito mais. Do 1° ao 9° ano.
              </p>
              <p className="font-nunito text-base sm:text-lg text-white/85 leading-relaxed mb-8">
                E o melhor: o <strong className="text-white">TECA</strong>,
                nossa IA pedagógica, gera planos de aula completos em{" "}
                <strong className="text-white">30 segundos</strong> e ainda
                corrige as redações dos seus alunos com feedback motivacional.
                <br />
                <strong className="text-white">
                  Nenhuma outra plataforma faz isso.
                </strong>
              </p>

              {/* CTA */}
              <Link
                to="/"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-[#FFB830] text-[#1A1D2B] font-nunito font-extrabold text-base sm:text-lg hover:brightness-105 transition-all shadow-[0_4px_20px_rgba(255,184,48,0.5)] hover:shadow-[0_8px_30px_rgba(255,184,48,0.6)] hover:-translate-y-1 active:translate-y-0"
              >
                🐙 QUERO ACESSAR TODAS AS 226+ ATIVIDADES + IA AGORA!
              </Link>

              {/* Subtexto CTA */}
              <p className="mt-4 text-white/60 text-sm font-nunito">
                ✓ 7 dias de garantia &nbsp;·&nbsp; ✓ Cancele quando
                quiser &nbsp;·&nbsp; ✓ Comece grátis
              </p>
            </div>

            {/* Coluna direita — Mockup iPhone */}
            <div className="flex justify-center lg:justify-end">
              <div className="relative w-[280px] sm:w-[320px]">
                {/* Phone frame */}
                <div className="relative bg-black rounded-[3rem] p-3 shadow-2xl shadow-black/30">
                  {/* Notch */}
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[120px] h-[30px] bg-black rounded-b-2xl z-10" />
                  {/* Screen */}
                  <div className="rounded-[2.4rem] overflow-hidden bg-[#FAFBFD] aspect-[9/19.5]">
                    <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center">
                      <span className="text-6xl mb-4">🐙</span>
                      <p className="font-fredoka font-bold text-[#6366F1] text-xl mb-2">
                        AulaTeca
                      </p>
                      <p className="font-nunito text-[#6B7186] text-sm">
                        226+ atividades prontas
                      </p>
                      <div className="mt-6 grid grid-cols-2 gap-2 w-full">
                        {["Fábula", "Crônica", "Notícia", "Cordel"].map((g) => (
                          <div
                            key={g}
                            className="rounded-xl bg-[#EEF2FF] p-3 text-xs font-nunito font-semibold text-[#6366F1]"
                          >
                            {g}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                {/* Glow behind phone */}
                <div className="absolute inset-0 -z-10 rounded-[3rem] bg-[#FFB830]/20 blur-3xl scale-110" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
