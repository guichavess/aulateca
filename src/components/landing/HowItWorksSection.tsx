import type { ReactNode } from "react";
import { ArrowRight } from "lucide-react";
import TecaMascot from "@/components/brand/TecaMascot";

// O passo 1 é o único que fala da marca ("crie sua senha"), e é onde a Teca de
// verdade entra no lugar do emoji genérico de polvo. Os outros dois seguem
// emoji: 📚 e ✨ ilustram a ação, não a marca, e trocar os três por vetor
// deixaria a fileira pesada.
interface Step {
  icon?: ReactNode;
  emoji?: string;
  title: string;
  description: string;
}

const steps: Step[] = [
  {
    icon: <TecaMascot size="xs" className="w-11 h-11 mx-auto" />,
    // Não existe conta grátis: a conta nasce depois da compra, com o e-mail do
    // pagamento. O texto antigo prometia um tier que o produto não tem.
    title: "Crie sua senha em 30 segundos",
    description:
      "Depois da compra você recebe o link por e-mail. Crie a senha com o mesmo e-mail do pagamento e pronto.",
  },
  {
    emoji: "📚",
    title: "Escolha a atividade perfeita",
    description:
      "Filtre por ano escolar, gênero textual ou categoria.",
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
          Se você sabe usar o WhatsApp, já sabe usar o AulaTeca: entra, escolhe a
          ficha e imprime. Sem instalar nada, sem curso para aprender a usar.
        </p>

        {/* 3 passos */}
        {/* `items-stretch` (padrão do grid) em vez de `items-start`: os três
            passos têm descrições de tamanhos diferentes, e com altura natural o
            card do passo 1 descia mais que os outros dois. Agora a linha inteira
            tem a altura do maior, e a seta se centra sozinha nela — era o que o
            `pt-16` mágico tentava fazer no olho. */}
        <div className="grid md:grid-cols-3 gap-6 lg:gap-4 mb-20">
          {steps.map((step, i) => (
            <div key={i} className="flex items-stretch gap-4 lg:gap-0">
              {/* Card */}
              <div className="glass-card p-6 sm:p-8 text-center flex-1">
                {/* Altura fixa no slot do ícone: o emoji ocupa a linha do
                    `text-4xl` (40px) e a Teca é um `<img>` de 44px. Sem isto,
                    os 4px de diferença desalinham "PASSO 1" dos outros dois. */}
                <div className="h-11 mb-4 flex items-center justify-center text-4xl leading-none">
                  {step.icon ?? step.emoji}
                </div>
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
                <div className="hidden md:flex items-center justify-center px-2">
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
          <div className="max-w-sm mx-auto">
            <div className="relative rounded-xl overflow-hidden shadow-2xl shadow-black/20 bg-black">
              <video
                className="w-full h-auto"
                controls
                preload="metadata"
                playsInline
              >
                <source src="/landing/tutorial.mp4" type="video/mp4" />
              </video>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
