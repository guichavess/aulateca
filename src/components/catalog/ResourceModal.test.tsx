import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import type { Resource } from '@/lib/types';

vi.mock('@/integrations/supabase/client', () => ({ supabase: {} }));
vi.mock('@/lib/context', () => ({
  useApp: () => ({ favorites: new Set<string>(), isFavorite: () => false, toggleFavorite: () => {} }),
}));
vi.mock('@/services/resources.service', () => ({
  resourcesService: { resolveDownloadUrl: vi.fn(), registerDownload: vi.fn() },
}));

import ResourceModal from './ResourceModal';

const recurso = {
  id: 'r1',
  title: 'Fábula: o polvo e a garça',
  description: 'Leitura e produção de texto.',
  category: 'ludica',
  ageRange: '6-8',
  type: 'pdf',
  duration: '50 min',
  author: 'Equipe Aulateca',
  rating: 4.8,
  downloads: 120,
} as unknown as Resource;

/**
 * O modal era um `<div>` solto: sem `role`, sem `aria-modal` e sem saída pelo
 * teclado — quem não usa mouse entrava e não conseguia sair. Estes testes
 * cobrem a saída, não a aparência.
 */
describe('ResourceModal', () => {
  it('se anuncia como diálogo e é nomeado pelo título do recurso', () => {
    render(<ResourceModal resource={recurso} onClose={() => {}} />);
    expect(screen.getByRole('dialog', { name: 'Fábula: o polvo e a garça' })).toBeInTheDocument();
  });

  it('fecha com Esc', () => {
    const onClose = vi.fn();
    render(<ResourceModal resource={recurso} onClose={onClose} />);
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('fecha pelo botão, que tem nome acessível', () => {
    const onClose = vi.fn();
    render(<ResourceModal resource={recurso} onClose={onClose} />);
    fireEvent.click(screen.getByRole('button', { name: 'Fechar' }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  /**
   * O acervo de estreia inteiro tem nota 0 e download 0. Mostrar isso é pior que
   * não mostrar nada: sugere um material que ninguém quis, quando na verdade
   * ninguém avaliou ainda.
   */
  it('esconde nota e downloads enquanto forem zero', () => {
    render(<ResourceModal resource={{ ...recurso, rating: 0, downloads: 0 }} onClose={() => {}} />);
    expect(screen.queryByText(/⭐/)).not.toBeInTheDocument();
    expect(screen.queryByText(/downloads/)).not.toBeInTheDocument();
  });

  it('mostra nota e downloads quando existem de verdade', () => {
    render(<ResourceModal resource={recurso} onClose={() => {}} />);
    expect(screen.getByText(/⭐ 4.8/)).toBeInTheDocument();
    expect(screen.getByText(/120 downloads/)).toBeInTheDocument();
  });

  it('o botão de favorito diz o que faz e em que estado está', () => {
    render(<ResourceModal resource={recurso} onClose={() => {}} />);
    const fav = screen.getByRole('button', { name: /Salvar .* nos favoritos/ });
    expect(fav).toHaveAttribute('aria-pressed', 'false');
  });
});
