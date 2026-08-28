import React from 'react';
import { cn } from '@/lib/utils';
import tecaSvg from '@/assets/teca-mascot.svg';

/**
 * Ponto único de acesso à Teca.
 *
 * Hoje há uma arte só — `teca-mascot.svg`, vetor com a piscada animada em CSS.
 * Ela vem por `<img src>` e não inline: a animação roda igual dentro de um
 * `<img>` (SVG-como-imagem executa CSS declarativo; só script e recurso externo
 * é que ficam de fora), e assim os 115 KB de vetor são baixados uma vez pelo
 * navegador em vez de entrarem no bundle de JS de toda tela que mostra a Teca.
 *
 * `mood` continua na API mesmo sem arte por estado: quando houver ilustração
 * nova (comemorando, pensando, triste) basta mapear aqui, sem caçar imports
 * pelo projeto — que era exatamente o problema quando eram quatro PNGs soltos.
 */
export type TecaMood = 'neutral' | 'happy' | 'thinking';
export type TecaSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

const SIZE_CLASS: Record<TecaSize, string> = {
  xs: 'w-7 h-7',
  sm: 'w-10 h-10',
  md: 'w-20 h-20',
  lg: 'w-32 h-32',
  xl: 'w-40 h-40 sm:w-48 sm:h-48',
};

interface TecaMascotProps {
  mood?: TecaMood;
  size?: TecaSize;
  className?: string;
  /** Texto alternativo. Vazio (padrão) quando a Teca é puramente decorativa. */
  alt?: string;
}

const TecaMascot: React.FC<TecaMascotProps> = ({
  size = 'md',
  className,
  alt = '',
}) => (
  <img
    src={tecaSvg}
    alt={alt}
    aria-hidden={alt === '' ? true : undefined}
    className={cn(SIZE_CLASS[size], 'object-contain select-none', className)}
    draggable={false}
  />
);

export default TecaMascot;
