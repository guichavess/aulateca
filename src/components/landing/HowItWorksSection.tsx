import { ArrowRight } from "lucide-react";

const steps = [
  {
    emoji: "🐙",
    title: "Crie sua conta grátis em 30 segundos",
    description:
      "Baixe o app ou acesse pelo navegador. Login com e-mail ou Google — sem complicação.",
  },
  {
    emoji: "📚",
    title: "Escolha a atividade perfeita",
    description:
      "Filtre por ano escolar, gênero textual ou categoria. Ou peça pro Teca escolher por você.",
  },
  {
    emoji: "✨",
    title: "Use na sua aula",
    description:
      "Abra na sala, projete no quadro ou mande pro aluno pelo celular. Pronto, é só isso.",
  },
];

const HowItWorksSection = () => {
  return (
    <section className="bg-white py-16 sm:py-20 lg:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Headline */}
        <div className="text-center mb-6">
          <h2 className="font-fredoka font-bold text-2xl sm:text-3xl lg:text-4xl text-[#1A1D2B]">
            Como funciona o{" "}
            <span className="text-[#6366F1]">AulaTeca</span>?
          </h2>
        </div>

        {/* Subtexto pertencimento */}
        <p className="text-center font-nunito text-[#6B7186] text-base sm:text-lg max-w-2xl mx-auto mb-14 leading-relaxed">
          Se você sabe usar o WhatsApp, já sabe usar o AulaTeca. Mais de{" "}
          <strong className="text-[#1A1D2B]">8.500 professoras</strong> já
          estão usando — muitas dizem que é mais fácil que escolher filme na
          Netflix.
        </p>

        {/* 3 passos */}
        <div className="grid md:grid-cols-3 gap-6 lg:gap-4 items-start mb-20">
          {steps.map((step, i) => (
            <div key={i} className="flex items-start gap-4 lg:gap-0">
              {/* Card */}
              <div className="glass-card p-6 sm:p-8 text-center flex-1">
                <div className="text-4xl mb-4">{step.emoji}</div>
                <p className="text-xs font-nunito font-bold text-[#6366F1] uppercase tracking-wider mb-2">
                  Passo {i + 1}
                </p>
                <h3 className="font-fredoka font-semibold text-lg text-[#1A1D2B] mb-3">
                  {step.title}
                </h3>
                <p className="font-nunito text-sm text-[#6B7186] leading-relaxed">
                  {step.description}
                </p>
              </div>

              {/* Seta entre cards (não no último) */}
              {i < steps.length - 1 && (
                <div className="hidden md:flex items-center justify-center px-2 pt-16">
                  <ArrowRight className="w-6 h-6 text-[#6366F1]" />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Bloco de vídeo */}
        <div className="bg-[#6366F1] rounded-2xl p-8 sm:p-12 text-center">
          <h3 className="font-fredoka font-bold text-xl sm:text-2xl text-white mb-2">
            Veja em 2 minutos como é simples
          </h3>
          <p className="text-white/70 font-nunito text-sm mb-8">▼</p>

          {/* Placeholder para embed de vídeo */}
          <div className="max-w-3xl mx-auto">
            <div className="relative aspect-video rounded-xl overflow-hidden bg-[#4F46E5] shadow-2xl shadow-black/20">
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mb-3">
                  <div className="w-0 h-0 border-t-8 border-t-transparent border-b-8 border-b-transparent border-l-12 border-l-white ml-1"
                    style={{ borderLeftWidth: 14 }}
                  />
                </div>
                <p className="text-white/60 text-sm font-nunito">
                  Vídeo em breve
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
