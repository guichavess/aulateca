import CheckoutButton from "@/components/landing/CheckoutButton";
import HeroPhone from "@/components/landing/HeroPhone";
import TecaMascot from "@/components/brand/TecaMascot";

/**
 * A landing não anuncia mais a contagem do acervo. Decisão do gestor em
 * 29/08/2026: dizer o total exato entrega ao concorrente o tamanho do catálogo
 * e, do lado do cliente, ancora a compra num número em vez do que o material
 * faz. A promessa passa a ser qualitativa — o que tem, para que ano, pronto
 * para quando.
 *
 * Por isso nenhuma tela pública importa o módulo de contagem do acervo, e há
 * um teste em `numeros.test.tsx` que reprova quem voltar a importá-lo.
 */

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
                <TecaMascot size="xs" className="w-9 h-9" />
                <span className="font-fredoka font-bold text-2xl text-white">
                  AulaTeca
                </span>
                <span className="px-3 py-1 rounded-full bg-white/15 text-white/90 text-xs font-nunito font-semibold backdrop-blur-sm">
                  Ensino Fundamental 1
                </span>
              </div>

              {/* Headline */}
              <h1 className="font-fredoka font-bold text-display text-white mb-6">
                Chega de perder noites montando aula.{" "}
                <span className="text-[#FFB830]">Atividades</span> de
                Produção de Textos prontas para usar AMANHÃ.
              </h1>

              {/* Corpo */}
              <p className="font-nunito text-base sm:text-lg text-white/85 leading-relaxed mb-4">
                Acesse agora a plataforma completa, com{" "}
                <strong className="text-white">atividades</strong>,{" "}
                <strong className="text-white">jogos lúdicos</strong> e{" "}
                <strong className="text-white">exercícios complementares</strong>{" "}
                de produção textual e interpretação de texto — narrativa, personagem,
                carta, jornal, rimas e leitura com perguntas. Do 1° ao 5° ano.
              </p>

              {/* CTA */}
              <CheckoutButton
                className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-[#FFB830] text-[#1A1D2B] font-nunito font-extrabold text-base sm:text-lg hover:brightness-105 transition-all shadow-[0_4px_20px_rgba(255,184,48,0.5)] hover:shadow-[0_8px_30px_rgba(255,184,48,0.6)] hover:-translate-y-1 active:translate-y-0"
              >
                <TecaMascot size="xs" className="w-7 h-7 shrink-0" />
                QUERO ACESSAR AS ATIVIDADES AGORA!
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
