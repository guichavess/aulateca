import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';

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

// A flag do acervo de demonstração é lida do ambiente uma vez só, na carga do
// módulo. O getter deixa cada teste escolher o cenário sem recarregar tudo.
let demoLigado = false;
vi.mock('@/lib/demoFallback', () => ({
  get demoFallbackAtivo() {
    return demoLigado;
  },
}));

const fetchByIds = vi.fn();
vi.mock('@/services/resources.service', () => ({ resourcesService: { fetchByIds: (ids: string[]) => fetchByIds(ids) } }));

import FavoritesPage from '@/pages/profile/FavoritesPage';

function renderPage() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    // O estado vazio traz um <Link> para o acervo — sem Router, ele explode.
    <QueryClientProvider client={qc}>
      <MemoryRouter>
        <FavoritesPage />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

const TITULO_MOCK = '1º Ano — Gramática: Monte a Palavra';

describe('FavoritesPage', () => {
  beforeEach(() => {
    demoLigado = false;
  });

  describe('com o acervo de demonstração ligado', () => {
    beforeEach(() => {
      demoLigado = true;
    });

    it('mostra o recurso mockado favoritado quando o backend não o conhece', async () => {
      fetchByIds.mockResolvedValue([]);
      renderPage();
      expect(await screen.findByText(TITULO_MOCK)).toBeInTheDocument();
    });

    it('ainda mostra os favoritos locais quando a consulta ao backend falha', async () => {
      fetchByIds.mockRejectedValue(new Error('boom'));
      renderPage();
      expect(await screen.findByText(TITULO_MOCK)).toBeInTheDocument();
      expect(screen.queryByText(/Não foi possível carregar/)).not.toBeInTheDocument();
    });
  });

  /**
   * O caso que importa em produção. Ressuscitar um favorito que só existe no
   * bundle mostra ao professor um material que o banco não tem — e cujo
   * download não funciona, porque depende de uma URL assinada.
   */
  it('não ressuscita favorito de demonstração quando a flag está desligada', async () => {
    fetchByIds.mockResolvedValue([]);
    renderPage();
    expect(await screen.findByText(/0 recurso/)).toBeInTheDocument();
    expect(screen.queryByText(TITULO_MOCK)).not.toBeInTheDocument();
  });
});
