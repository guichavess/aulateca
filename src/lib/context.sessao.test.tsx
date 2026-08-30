import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';

/**
 * O bug que este arquivo trava:
 *
 * Numa visita de volta — sessão já válida no navegador, sem passar pelo
 * formulário de login — o app montava o usuário a partir do `localStorage` e
 * nunca reconsultava o perfil. A biblioteca do Supabase emite `INITIAL_SESSION`
 * nesse caminho (não `SIGNED_IN`), evento que o listener não trata, e o
 * `TOKEN_REFRESHED` mantém a sessão viva indefinidamente. Resultado: `role`
 * congelava no valor do último login de verdade.
 *
 * Quem foi promovido a ADMIN depois disso continuava com a role antiga, era
 * mandado ao paywall e lia "não encontramos sua compra" — sendo admin, que não
 * compra nada. Recarregar não corrigia, porque o boot era justamente o caminho
 * que não rebuscava.
 */

const sessao = {
  access_token: 'token-novo',
  user: { id: 'user-1', email: 'admin@aulateca.com.br' },
};

// `vi.mock` e' icado para o topo do arquivo, acima de qualquer `const`. Os
// dublES precisam nascer em `vi.hoisted` para existirem quando a fabrica rodar.
const { getSession, onAuthStateChange, fetchProfile } = vi.hoisted(() => ({
  getSession: vi.fn(),
  onAuthStateChange: vi.fn(() => ({
    data: { subscription: { unsubscribe: () => {} } },
  })),
  fetchProfile: vi.fn(),
}));

vi.mock('@/integrations/supabase/client', () => ({
  supabase: { auth: { getSession, onAuthStateChange } },
}));
vi.mock('@/services/auth.service', () => ({
  authService: {
    loadUser: () => JSON.parse(localStorage.getItem('user') ?? 'null'),
    saveSession: (token: string, user: unknown) => {
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
    },
    fetchProfile: (...args: unknown[]) => fetchProfile(...args),
  },
}));

vi.mock('@/services/favorites.service', () => ({
  favoritesService: { fetchAll: () => Promise.resolve([]) },
}));

import { AppProvider, useApp } from '@/lib/context';

const MostraRole = () => {
  const { user } = useApp();
  return <p>role: {user?.role ?? 'sem usuário'}</p>;
};

const montar = () =>
  render(
    <AppProvider>
      <MostraRole />
    </AppProvider>,
  );

/** O que ficou gravado no navegador no último login de verdade. */
const cacheAntigo = {
  id: 'user-1',
  name: 'Guilherme',
  email: 'admin@aulateca.com.br',
  role: 'PROFESSOR',
};

describe('perfil na volta ao app (sessão já existente)', () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem('token', 'token-antigo');
    localStorage.setItem('user', JSON.stringify(cacheAntigo));
    getSession.mockResolvedValue({ data: { session: sessao } });
    fetchProfile.mockReset();
  });

  afterEach(() => localStorage.clear());

  it('rebusca o perfil no boot em vez de confiar no localStorage', async () => {
    fetchProfile.mockResolvedValue({ ...cacheAntigo, role: 'ADMIN' });
    montar();

    // Sem a correção, isto seria "PROFESSOR" para sempre: o admin cairia no
    // paywall e leria que a compra dele não foi encontrada.
    await waitFor(() => expect(screen.getByText('role: ADMIN')).toBeInTheDocument());
    expect(fetchProfile).toHaveBeenCalledWith('user-1', 'admin@aulateca.com.br');
  });

  it('grava a role nova no cache, para o próximo boot não regredir', async () => {
    fetchProfile.mockResolvedValue({ ...cacheAntigo, role: 'ADMIN' });
    montar();

    await waitFor(() =>
      expect(JSON.parse(localStorage.getItem('user') ?? '{}').role).toBe('ADMIN'),
    );
  });

  it('também enxerga o rebaixamento, não só a promoção', async () => {
    // O sentido inverso do mesmo bug: quem perdeu o ADMIN continuava vendo a
    // área administrativa enquanto o cache não fosse limpo à mão.
    localStorage.setItem('user', JSON.stringify({ ...cacheAntigo, role: 'ADMIN' }));
    fetchProfile.mockResolvedValue({ ...cacheAntigo, role: 'PROFESSOR' });
    montar();

    await waitFor(() => expect(screen.getByText('role: PROFESSOR')).toBeInTheDocument());
  });

  it('perfil indisponível mantém o cache em vez de derrubar a sessão', async () => {
    fetchProfile.mockRejectedValue(new Error('rede fora'));
    montar();

    await waitFor(() => expect(fetchProfile).toHaveBeenCalled());
    expect(screen.getByText('role: PROFESSOR')).toBeInTheDocument();
  });

  it('sem sessão no Supabase, não tenta buscar perfil nenhum', async () => {
    getSession.mockResolvedValue({ data: { session: null } });
    montar();

    await waitFor(() => expect(screen.getByText('role: sem usuário')).toBeInTheDocument());
    expect(fetchProfile).not.toHaveBeenCalled();
  });
});
