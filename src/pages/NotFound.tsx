import React, { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowLeft, Compass, Search } from 'lucide-react';
import TecaMascot from '@/components/brand/TecaMascot';

/**
 * A 404 era a do template: "Oops! Page not found", em inglês, sobre cinza.
 *
 * Ela é a única tela que a pessoa encontra sem querer — e por isso é onde a
 * marca mais precisa aparecer. Quem chega aqui já errou o caminho: a tela tem
 * que dizer isso sem soar como falha do usuário, e devolver o caminho de volta.
 *
 * A Teca vem em tamanho grande porque aqui ela é o assunto, não o enfeite. É o
 * mesmo SVG do cabeçalho, com a piscada e a respiração que o arquivo já traz —
 * é o que faz a tela de erro parecer habitada em vez de quebrada.
 */
const NotFound: React.FC = () => {
  const location = useLocation();

  useEffect(() => {
    // Mantido do template: é o rastro que diz QUAL link quebrado levou aqui.
    console.error('404: rota inexistente —', location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background">
      <div className="w-full max-w-lg text-center animate-slide-up">
        <div className="relative inline-block mb-2">
          <TecaMascot size="xl" alt="" />
          {/* O 404 como adesivo colado na Teca: o número é a informação, mas
              quem dá o tom é ela. Sombra sólida, o mesmo gesto dos cards. */}
          <span
            className="absolute -bottom-1 -right-2 font-fredoka text-2xl font-bold px-3 py-1 bg-card text-primary"
            style={{
              border: '2px solid hsl(var(--border))',
              borderRadius: 'var(--radius-pill)',
              boxShadow: 'var(--shadow-sticker-neutral)',
              transform: 'rotate(-6deg)',
            }}
          >
            404
          </span>
        </div>

        <h1 className="font-fredoka text-h1 font-bold text-foreground mt-6">
          A Teca procurou com os oito braços
        </h1>
        <p className="text-muted-foreground mt-3 leading-relaxed max-w-md mx-auto">
          E não achou esta página. Ou o link veio quebrado, ou o conteúdo mudou de lugar —
          nos dois casos o problema é nosso, não seu.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8">
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3.5 font-semibold text-primary-foreground btn-primary-glow"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar para o início
          </Link>
          <Link
            to="/explore"
            className="inline-flex items-center justify-center gap-2 px-6 py-3.5 font-semibold sticker-surface text-foreground hover:border-primary transition-colors"
            style={{ boxShadow: 'var(--shadow-sticker-neutral)' }}
          >
            <Compass className="w-4 h-4" />
            Explorar atividades
          </Link>
        </div>

        {/* O caminho de quem sabe o que queria e só perdeu o endereço. */}
        <p className="text-sm text-muted-foreground mt-8 flex items-center justify-center gap-1.5">
          <Search className="w-3.5 h-3.5" />
          Procurando algo específico? Use a busca no topo do catálogo.
        </p>
      </div>
    </div>
  );
};

export default NotFound;
