import CheckoutButton from "@/components/landing/CheckoutButton";
import HeroPhone from "@/components/landing/HeroPhone";

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
              <h1 className="font-fredoka font-bold text-display text-white mb-6">
                Chega de perder noites montando aula.{" "}
                <span className="text-[#FFB830]">226+ atividades</span> de
                Produção de Textos prontas para usar AMANHÃ.
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

              {/* CTA */}
              <CheckoutButton
                className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-[#FFB830] text-[#1A1D2B] font-nunito font-extrabold text-base sm:text-lg hover:brightness-105 transition-all shadow-[0_4px_20px_rgba(255,184,48,0.5)] hover:shadow-[0_8px_30px_rgba(255,184,48,0.6)] hover:-translate-y-1 active:translate-y-0"
              >
                🐙 QUERO ACESSAR TODAS AS 226+ ATIVIDADES AGORA!
              </CheckoutButton>

              {/* Subtexto CTA */}
              <p className="mt-4 text-white/60 text-sm font-nunito">
                ✓ 7 dias de garantia (direito de arrependimento, CDC art. 49)
              </p>
            </div>

            {/* Coluna direita — Mockup iPhone */}
            <div className="flex justify-center lg:justify-end">
              <HeroPhone />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
