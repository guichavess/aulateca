import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AuthErrorPtBr } from '@/lib/authErrors';

vi.mock('@/integrations/supabase/client', () => ({ supabase: {} }));

const finishPasswordRecovery = vi.fn();
const app = {
  isLoggedIn: true,
  user: { id: 'u1', name: 'Joana', email: 'joana@escola.com', role: 'PROFESSOR' as const },
  finishPasswordRecovery,
};
vi.mock('@/lib/context', () => ({ useApp: () => app }));

const completePasswordReset = vi.fn();
vi.mock('@/services/auth.service', () => ({
  authService: { completePasswordReset: (...args: unknown[]) => completePasswordReset(...args) },
}));

const navigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return { ...actual, useNavigate: () => navigate };
});

import RedefinirSenhaPage from '@/pages/auth/RedefinirSenhaPage';

const renderPage = () =>
  render(
    <MemoryRouter>
      <RedefinirSenhaPage />
    </MemoryRouter>,
  );

describe('RedefinirSenhaPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    app.isLoggedIn = true;
  });

  it('sem sessão, avisa que o link expirou em vez de mostrar o formulário', () => {
    app.isLoggedIn = false;
    renderPage();
    expect(screen.getByText('Link expirado')).toBeInTheDocument();
    expect(screen.queryByLabelText('Senha nova')).not.toBeInTheDocument();
  });

  it('não deixa salvar enquanto as duas senhas forem diferentes', async () => {
    renderPage();

    fireEvent.change(screen.getByLabelText('Senha nova'), { target: { value: 'Girassol#2026' } });
    fireEvent.change(screen.getByLabelText('Repita a senha'), { target: { value: 'Girassol#2025' } });

    expect(screen.getByRole('button', { name: /Salvar/ })).toBeDisabled();
    expect(screen.getByText(/ainda estão diferentes/)).toBeInTheDocument();
  });

  it('não deixa salvar senha que não passa na política', async () => {
    renderPage();

    fireEvent.change(screen.getByLabelText('Senha nova'), { target: { value: 'senha123' } });
    fireEvent.change(screen.getByLabelText('Repita a senha'), { target: { value: 'senha123' } });

    expect(screen.getByRole('button', { name: /Salvar/ })).toBeDisabled();
  });

  it('salva, derruba a flag de recuperação e leva para o app', async () => {
    // A flag é o que segura a pessoa nesta tela; se ela não cair aqui, o
    // usuário fica preso no formulário mesmo depois de trocar a senha.
    completePasswordReset.mockResolvedValue(undefined);
    renderPage();

    fireEvent.change(screen.getByLabelText('Senha nova'), { target: { value: 'Girassol#2026' } });
    fireEvent.change(screen.getByLabelText('Repita a senha'), { target: { value: 'Girassol#2026' } });
    fireEvent.click(screen.getByRole('button', { name: /Salvar/ }));

    await waitFor(() => expect(finishPasswordRecovery).toHaveBeenCalled());
    expect(completePasswordReset).toHaveBeenCalledWith('Girassol#2026', 'joana@escola.com');
    expect(navigate).toHaveBeenCalledWith('/', { replace: true });
  });

  it('mantém a flag ligada quando o Supabase recusa a troca', async () => {
    completePasswordReset.mockRejectedValue(new AuthErrorPtBr('senha_igual_a_anterior'));
    renderPage();

    fireEvent.change(screen.getByLabelText('Senha nova'), { target: { value: 'Girassol#2026' } });
    fireEvent.change(screen.getByLabelText('Repita a senha'), { target: { value: 'Girassol#2026' } });
    fireEvent.click(screen.getByRole('button', { name: /Salvar/ }));

    expect(
      await screen.findByText('Essa é a mesma senha de antes. Escolha uma diferente.'),
    ).toBeInTheDocument();
    expect(finishPasswordRecovery).not.toHaveBeenCalled();
    expect(navigate).not.toHaveBeenCalled();
  });
});
