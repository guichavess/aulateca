import { Link } from "react-router-dom";

const FinalCTASection = () => {
  return (
    <section className="relative bg-gradient-to-br from-[#6366F1] to-[#4F46E5] py-16 sm:py-20 lg:py-24 overflow-hidden">
      {/* Orbs decorativos */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute rounded-full animate-float"
          style={{
            width: 300,
            height: 300,
            top: "-10%",
            right: "-5%",
            background: "radial-gradient(circle, rgba(255,184,48,0.1), transparent 70%)",
            filter: "blur(60px)",
          }}
        />
        <div
          className="absolute rounded-full animate-float-delayed"
          style={{
            width: 250,
            height: 250,
            bottom: "-5%",
            left: "-3%",
            background: "radial-gradient(circle, rgba(162,155,254,0.12), transparent 70%)",
            filter: "blur(60px)",
          }}
        />
      </div>

      <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="font-fredoka font-bold text-2xl sm:text-3xl lg:text-4xl text-white mb-6 leading-tight">
          Pronta para transformar suas aulas de produção de texto?
        </h2>

        <p className="font-nunito text-base sm:text-lg text-white/80 mb-10 leading-relaxed">
          Junte-se a mais de 8.500 professoras que já estão usando o AulaTeca
          para economizar tempo e engajar seus alunos.
        </p>

        <Link
          to="/"
          className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-[#FFB830] text-[#1A1D2B] font-nunito font-extrabold text-base sm:text-lg hover:brightness-105 transition-all shadow-[0_4px_20px_rgba(255,184,48,0.5)] hover:shadow-[0_8px_30px_rgba(255,184,48,0.6)] hover:-translate-y-1 active:translate-y-0"
        >
          🐙 QUERO ACESSAR TODAS AS 226+ ATIVIDADES + IA AGORA!
        </Link>

        <p className="mt-4 text-white/60 text-sm font-nunito">
          ✓ 7 dias de garantia &nbsp;·&nbsp; ✓ Cancele quando
          quiser &nbsp;·&nbsp; ✓ Comece grátis
        </p>
      </div>
    </section>
  );
};

export default FinalCTASection;
