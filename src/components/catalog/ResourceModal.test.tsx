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

  it('o botão de favorito diz o que faz e em que estado está', () => {
    render(<ResourceModal resource={recurso} onClose={() => {}} />);
    const fav = screen.getByRole('button', { name: /Salvar .* nos favoritos/ });
    expect(fav).toHaveAttribute('aria-pressed', 'false');
  });
});
