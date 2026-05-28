const PainSection = () => {
  return (
    <section className="bg-[#FAFBFD] py-16 sm:py-20 lg:py-24">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="font-fredoka font-bold text-2xl sm:text-3xl lg:text-4xl text-[#1A1D2B] mb-8 leading-tight">
          Seus alunos travam na hora de escrever uma redação?
        </h2>

        <p className="font-nunito text-base sm:text-lg text-[#6B7186] leading-relaxed mb-6">
          Você pede uma produção de texto e recebe 3 linhas. O aluno não sabe
          começar, não entende a estrutura do gênero e trava no meio da escrita.
          A turma inteira com a folha em branco te olhando pedindo socorro.
        </p>

        <p className="font-nunito text-base sm:text-lg text-[#6B7186] leading-relaxed mb-10">
          E do outro lado, você: gastando noites inteiras buscando atividades em
          blogs desatualizados, adaptando PDF mal formatado, montando plano de
          aula do zero — sozinha, sem nenhuma ferramenta à altura da sua
          dedicação.
        </p>

        <p className="font-nunito text-base sm:text-lg text-[#6B7186]/80 italic">
          A gente entende porque já viveu isso. E foi por isso que criamos o{" "}
          <span className="text-[#6366F1] font-semibold not-italic">
            AulaTeca
          </span>
          .
        </p>
      </div>
    </section>
  );
};

export default PainSection;
