import React from 'react';
import { Mail, MessageCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { suporteEmailVisivel, suporteMailto, suporteWhatsappUrl, temSuporte } from '@/lib/suporte';

interface SuporteLinksProps {
  /** Assunto do e-mail. Curto e específico: é o que vira o título do chamado. */
  assunto: string;
  /**
   * Linhas de contexto que já vão no corpo da mensagem — e-mail da conta, tela,
   * id do evento no Sentry. Quanto mais vier daqui, menos a pessoa travada
   * precisa digitar.
   */
  contexto?: (string | null | undefined)[];
  /** Uma frase acima dos botões. Some se não vier. */
  titulo?: string;
  className?: string;
}

/**
 * Os dois canais de suporte, lado a lado.
 *
 * E-mail primeiro por deixar rastro escrito e funcionar em qualquer aparelho;
 * WhatsApp em seguida porque é onde o professor já está. Cada botão só aparece
 * se a variável dele estiver configurada — e o bloco inteiro some se nenhuma
 * estiver, em vez de mostrar uma promessa de ajuda sem ajuda atrás.
 */
const SuporteLinks: React.FC<SuporteLinksProps> = ({
  assunto,
  contexto = [],
  titulo = 'Precisa de ajuda?',
  className,
}) => {
  if (!temSuporte) return null;

  const linhas = contexto.filter(Boolean) as string[];
  const corpo = ['', '', '---', 'Enviado do Aulateca:', ...linhas].join('\n');
  const mensagemCurta = [assunto, ...linhas].join(' — ');

  const mailto = suporteMailto(assunto, corpo);
  const whatsapp = suporteWhatsappUrl(mensagemCurta);

  const botao =
    'flex-1 inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold border-2 border-border text-foreground hover:border-primary hover:text-primary transition-colors';

  return (
    <div className={cn('space-y-2.5', className)}>
      {titulo && <p className="text-sm text-muted-foreground text-center">{titulo}</p>}
      <div className="flex flex-col sm:flex-row gap-2">
        {mailto && (
          <a href={mailto} className={botao}>
            <Mail size={16} aria-hidden="true" />
            Falar por e-mail
          </a>
        )}
        {whatsapp && (
          <a href={whatsapp} target="_blank" rel="noopener noreferrer" className={botao}>
            <MessageCircle size={16} aria-hidden="true" />
            Falar no WhatsApp
          </a>
        )}
      </div>
      {/* O endereço em texto existe para quem está num computador sem cliente de
          e-mail configurado — onde o mailto: não abre nada e o link parece quebrado. */}
      {suporteEmailVisivel && (
        <p className="text-xs text-muted-foreground text-center">
          ou escreva para{' '}
          <span className="font-medium text-foreground">{suporteEmailVisivel}</span>
        </p>
      )}
    </div>
  );
};

export default SuporteLinks;
