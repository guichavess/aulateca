import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

vi.mock('@/integrations/supabase/client', () => ({ supabase: {} }));

const favorites = new Set<string>(['a01a7eca-0002-4000-8000-000000000001']);
vi.mock('@/lib/context', () => ({
  useApp: () => ({
    favorites,
    isFavorite: (id: string) => favorites.has(id),
    toggleFavorite: () => {},
    isLoggedIn: true,
    user: null,
  }),
}));

const fetchByIds = vi.fn();
vi.mock('@/services/resources.service', () => ({ resourcesService: { fetchByIds: (ids: string[]) => fetchByIds(ids) } }));

import FavoritesPage from '@/pages/profile/FavoritesPage';

function renderPage() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={qc}>
      <FavoritesPage />
    </QueryClientProvider>,
  );
}

describe('FavoritesPage', () => {
  it('mostra o recurso mockado favoritado quando o backend não o conhece', async () => {
    fetchByIds.mockResolvedValue([]);
    renderPage();
    expect(await screen.findByText('1º Ano — Gramática: Monte a Palavra')).toBeInTheDocument();
  });

  it('ainda mostra os favoritos locais quando a consulta ao backend falha', async () => {
    fetchByIds.mockRejectedValue(new Error('boom'));
    renderPage();
    expect(await screen.findByText('1º Ano — Gramática: Monte a Palavra')).toBeInTheDocument();
    expect(screen.queryByText(/Não foi possível carregar/)).not.toBeInTheDocument();
  });
});
