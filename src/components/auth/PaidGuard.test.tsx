import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';

vi.mock('@/integrations/supabase/client', () => ({ supabase: {} }));

const access = {
  hasAccess: false,
  isLoading: false,
  entitlements: [],
  isError: false,
  refetch: () => {},
};
vi.mock('@/hooks/useAccess', () => ({ useAccess: () => access }));
import PaidGuard from '@/components/auth/PaidGuard';

function renderGuard() {
  return render(
    <MemoryRouter initialEntries={['/']}>
      <Routes>
        <Route
          path="/"
          element={
            <PaidGuard>
              <p>conteúdo pago</p>
            </PaidGuard>
          }
        />
        <Route path="/acesso" element={<p>tela de acesso</p>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('PaidGuard', () => {
  beforeEach(() => {
    access.hasAccess = false;
    access.isLoading = false;
  });

  it('deixa passar quem tem acesso', () => {
    access.hasAccess = true;
    renderGuard();
    expect(screen.getByText('conteúdo pago')).toBeInTheDocument();
  });

  it('manda para /acesso quem não tem', () => {
    renderGuard();
    expect(screen.getByText('tela de acesso')).toBeInTheDocument();
    expect(screen.queryByText('conteúdo pago')).not.toBeInTheDocument();
  });

  it('durante o carregamento não mostra o paywall — nem o conteúdo', () => {
    // O caso que este teste protege: alguém que ACABOU de pagar abrindo o app.
    // Se o guard decidisse pelo `hasAccess` ainda não carregado, a primeira
    // coisa que essa pessoa veria é uma tela dizendo que ela não pagou.
    access.isLoading = true;
    renderGuard();
    expect(screen.queryByText('tela de acesso')).not.toBeInTheDocument();
    expect(screen.queryByText('conteúdo pago')).not.toBeInTheDocument();
    expect(screen.getByText(/Carregando/)).toBeInTheDocument();
  });
});
