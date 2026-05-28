import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

const slides = [
  {
    title: "Dashboard com as categorias",
    description: "Encontre atividades organizadas por gênero textual e ano escolar.",
  },
  {
    title: "Atividades Lúdicas",
    description: "37 jogos educativos que tornam a escrita divertida para os alunos.",
  },
  {
    title: "Chat do Teca — IA Pedagógica",
    description: "Gere planos de aula completos em 30 segundos com o Teca.",
  },
  {
    title: "Catálogo filtrado por ano",
    description: "Do 1° ao 9° ano, atividades adaptadas para cada faixa etária.",
  },
  {
    title: "Atividade aberta",
    description: "Conteúdo completo pronto para projetar ou enviar ao aluno.",
  },
];

const VisualProofSection = () => {
  return (
    <section className="relative py-16 sm:py-20 lg:py-24 overflow-hidden">
      {/* Fundo: gradiente lavanda (substituir por screenshot com blur quando tiver) */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#EEF2FF] to-[#F5F3FF]" />
      <div className="absolute inset-0 bg-[rgba(99,102,241,0.03)]" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Headline */}
        <div className="text-center mb-12">
          <h2 className="font-fredoka font-bold text-2xl sm:text-3xl lg:text-4xl text-[#1A1D2B] mb-4">
            Espie o que te espera lá dentro
          </h2>
          <p className="font-nunito text-base sm:text-lg text-[#6B7186] max-w-2xl mx-auto leading-relaxed">
            <strong className="text-[#6366F1]">226+</strong> atividades
            organizadas por ano, gênero textual e categoria — com os códigos da
            BNCC já inseridos. Tudo isso na palma da sua mão.
          </p>
        </div>

        {/* Carrossel */}
        <div className="max-w-4xl mx-auto">
          <Carousel
            opts={{ align: "center", loop: true }}
            className="w-full"
          >
            <CarouselContent className="-ml-4">
              {slides.map((slide, i) => (
                <CarouselItem key={i} className="pl-4 md:basis-3/4 lg:basis-2/3">
                  <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                    {/* Área de imagem placeholder */}
                    <div className="aspect-[16/10] bg-gradient-to-br from-[#EEF2FF] to-[#E0E7FF] flex flex-col items-center justify-center p-8">
                      <div className="w-16 h-16 rounded-2xl bg-[#6366F1]/10 flex items-center justify-center mb-4">
                        <span className="text-3xl">
                          {["📊", "🎮", "🤖", "📋", "📝"][i]}
                        </span>
                      </div>
                      <p className="font-nunito text-sm text-[#6B7186]">
                        Screenshot em breve
                      </p>
                    </div>
                    {/* Legenda */}
                    <div className="p-5 sm:p-6">
                      <p className="text-xs font-nunito font-bold text-[#6366F1] uppercase tracking-wider mb-1">
                        Slide {i + 1}
                      </p>
                      <h3 className="font-fredoka font-semibold text-lg text-[#1A1D2B] mb-1">
                        {slide.title}
                      </h3>
                      <p className="font-nunito text-sm text-[#6B7186]">
                        {slide.description}
                      </p>
                    </div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="hidden sm:flex -left-4 lg:-left-12 border-[#6366F1]/20 text-[#6366F1] hover:bg-[#6366F1] hover:text-white" />
            <CarouselNext className="hidden sm:flex -right-4 lg:-right-12 border-[#6366F1]/20 text-[#6366F1] hover:bg-[#6366F1] hover:text-white" />
          </Carousel>
        </div>
      </div>
    </section>
  );
};

export default VisualProofSection;
