import React, { useRef } from 'react';
import Chip from '@/components/ui/chip';

export interface FilterOption<T extends string> {
  id: T;
  label: string;
  icon?: React.ReactNode;
  /** Quantidade de resultados; quando 0, a opção é desabilitada. */
  count?: number;
}

interface FilterChipGroupProps<T extends string> {
  /** Rótulo do grupo — visível e usado como nome acessível do radiogroup. */
  label: string;
  options: FilterOption<T>[];
  value: T;
  onChange: (id: T) => void;
}

/**
 * Grupo de filtros de escolha única.
 *
 * Antes cada chip era um botão solto com `aria-pressed`, o que anuncia
 * "alternar" — mas os filtros são mutuamente exclusivos, e não havia como
 * navegar entre eles pelo teclado sem passar por todos com Tab. Aqui vira um
 * `radiogroup` com tabindex móvel: um único Tab entra no grupo e as setas
 * andam entre as opções, como manda o padrão ARIA de radio.
 */
function FilterChipGroup<T extends string>({
  label,
  options,
  value,
  onChange,
}: FilterChipGroupProps<T>) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  // Índice que recebe o Tab: o selecionado, ou o primeiro habilitado.
  const selectedIndex = options.findIndex((o) => o.id === value);
  const tabIndex = selectedIndex >= 0 ? selectedIndex : 0;

  const move = (from: number, step: number) => {
    const total = options.length;
    // Pula opções desabilitadas (categorias sem nenhum resultado).
    for (let i = 1; i <= total; i++) {
      const next = (from + step * i + total * total) % total;
      if (options[next].count !== 0) {
        onChange(options[next].id);
        refs.current[next]?.focus();
        return;
      }
    }
  };

  const onKeyDown = (e: React.KeyboardEvent, index: number) => {
    switch (e.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        e.preventDefault();
        move(index, 1);
        break;
      case 'ArrowLeft':
      case 'ArrowUp':
        e.preventDefault();
        move(index, -1);
        break;
      case 'Home':
        e.preventDefault();
        move(-1, 1);
        break;
      case 'End':
        e.preventDefault();
        move(options.length, -1);
        break;
    }
  };

  return (
    <div>
      <p className="section-label mb-2">{label}</p>
      <div role="radiogroup" aria-label={label} className="flex flex-wrap gap-2">
        {options.map((opt, i) => {
          const disabled = opt.count === 0;
          return (
            <Chip
              key={opt.id}
              ref={(el) => {
                refs.current[i] = el;
              }}
              role="radio"
              active={opt.id === value}
              icon={opt.icon}
              disabled={disabled}
              tabIndex={i === tabIndex ? 0 : -1}
              onKeyDown={(e) => onKeyDown(e, i)}
              onClick={() => onChange(opt.id)}
            >
              {opt.label}
              {typeof opt.count === 'number' && (
                <span className="tabular-nums opacity-70">{opt.count}</span>
              )}
            </Chip>
          );
        })}
      </div>
    </div>
  );
}

export default FilterChipGroup;
