import React from 'react';
import { cn } from '@/lib/utils';
import TecaMascot, { TecaMood } from '@/components/brand/TecaMascot';

interface EmptyStateProps {
  /** Frase curta e afirmativa. É o que a pessoa lê primeiro. */
  title: string;
  /** Uma linha explicando o porquê ou o próximo passo. Opcional. */
  description?: React.ReactNode;
  /** Botão de saída. Todo beco sem saída deveria ter um. */
  action?: React.ReactNode;
  mood?: TecaMood;
  /** `loading` faz a Teca flutuar; `error` a deixa mais apagada. */
  tone?: 'neutral' | 'loading' | 'error';
  className?: string;
}

/**
 * Estado vazio, de carregamento e de erro — os três em um.
 *
 * Estavam reescritos à mão em dez lugares: quatro telas mostravam um emoji
 * gigante (⏳ ⚠️ 🔍 ❤️) e duas mostravam a Teca. Mesmo momento do produto,
 * duas identidades diferentes, e nenhuma delas com saída — a pessoa chegava
 * num "nenhum recurso encontrado" e ficava sem próximo passo.
 *
 * A mascote aqui não é enfeite: é o que faz o vazio parecer parte do produto
 * em vez de uma tela que quebrou. Por isso ela é decorativa para o leitor de
 * tela (`alt=""`) e o texto carrega a informação toda.
 */
const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  action,
  mood = 'thinking',
  tone = 'neutral',
  className,
}) => (
  <div
    className={cn('flex flex-col items-center text-center py-16 px-4', className)}
    // Carregamento e erro precisam ser anunciados; o vazio comum, não —
    // ele já é a consequência visível de um filtro que a pessoa acabou de mexer.
    role={tone === 'error' ? 'alert' : undefined}
    aria-live={tone === 'loading' ? 'polite' : undefined}
  >
    <TecaMascot
      mood={mood}
      size="md"
      className={cn('mb-4', tone === 'loading' && 'animate-float', tone === 'error' && 'opacity-70')}
    />
    <p className="font-fredoka text-h3 font-bold text-ink">{title}</p>
    {description && (
      <p className="text-sm text-muted-foreground mt-2 max-w-md leading-relaxed">{description}</p>
    )}
    {action && <div className="mt-5">{action}</div>}
  </div>
);

export default EmptyState;
