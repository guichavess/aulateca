import React from 'react';
import { cn } from '@/lib/utils';

interface ChipProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
  /** Emoji ou ícone à esquerda do rótulo. */
  icon?: React.ReactNode;
}

/**
 * Pill de filtro no estilo adesivo.
 *
 * O padrão estava duplicado inline em várias telas (uma versão via classe
 * `.chip`, outra reescrita à mão com utilitários), o que fazia as duas linhas
 * de filtro da Home terem alturas diferentes. Aqui vira um componente só.
 *
 * Altura mínima de 40px: a versão anterior tinha ~28px, alvo apertado até
 * para mouse.
 *
 * Semântica: solto, o chip é um botão de alternância (`aria-pressed`). Dentro
 * de um `radiogroup` — como nos filtros da Home, que são escolha única —
 * recebe `role="radio"` e passa a anunciar `aria-checked`.
 */
const Chip = React.forwardRef<HTMLButtonElement, ChipProps>(
  ({ active = false, icon, children, className, role, ...props }, ref) => {
    const isRadio = role === 'radio';
    return (
      <button
        ref={ref}
        type="button"
        role={role}
        aria-pressed={isRadio ? undefined : active}
        aria-checked={isRadio ? active : undefined}
        className={cn(
          'chip',
          active && 'chip-active',
          'disabled:opacity-45 disabled:cursor-not-allowed disabled:hover:border-border disabled:hover:text-muted-foreground disabled:active:translate-y-0',
          className,
        )}
        {...props}
      >
        {icon && <span aria-hidden="true">{icon}</span>}
        {children}
      </button>
    );
  },
);
Chip.displayName = 'Chip';

export default Chip;
