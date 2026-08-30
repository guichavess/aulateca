import OfertaCard from "@/components/landing/OfertaCard";

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
          São fichas prontas para imprimir, do 1° ao 9° ano — baixe hoje e use
          na aula de amanhã.
        </p>

        <OfertaCard />
      </div>
    </section>
  );
};

export default FinalCTASection;
