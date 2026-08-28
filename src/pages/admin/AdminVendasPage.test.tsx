import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

vi.mock('@/integrations/supabase/client', () => ({ supabase: {} }));

const list = vi.fn();
const summary = vi.fn();

vi.mock('@/services/sales.service', async () => {
  const actual = await vi.importActual<typeof import('@/services/sales.service')>(
    '@/services/sales.service',
  );
  return { ...actual, salesService: { list: (...a: unknown[]) => list(...a), summary: () => summary() } };
});

import AdminVendasPage from '@/pages/admin/AdminVendasPage';
import { toSale } from '@/services/sales.service';

const row = (over: Record<string, unknown> = {}) => ({
  id: 'e1',
  email: 'joana@escola.com',
  user_id: null,
  user_name: null,
  kind: 'unique',
  status: 'active',
  product_name: 'Aulateca',
  order_id: 'o1',
  ref_id: 'ABC123',
  subscription_id: null,
  granted_at: '2026-08-01T12:00:00Z',
  expires_at: null,
  revoked_at: null,
  revoke_reason: null,
  last_event: 'purchase_approved',
  last_event_at: '2026-08-01T12:00:00Z',
  is_active: true,
  access_email_sent_at: null,
  access_email_error: null,
  created_at: '2026-08-01T12:00:00Z',
  ...over,
});

function renderPage() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={qc}>
      <AdminVendasPage />
    </QueryClientProvider>,
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  summary.mockResolvedValue({ total: 0, ativas: 0, atencao: 0, semConta: 0 });
  list.mockResolvedValue([]);
});

describe('AdminVendasPage', () => {
  it('chama a fila travada pelo nome, não só por um número', async () => {
    // O cartão sozinho vira decoração: quem abre a tela precisa ler que tem
    // gente que pagou e está sem produto, e o que fazer a respeito.
    summary.mockResolvedValue({ total: 9, ativas: 7, atencao: 2, semConta: 3 });
    renderPage();

    expect(await screen.findByText(/2 pessoas pagaram/)).toBeInTheDocument();
    expect(screen.getByText(/reenvio é manual/)).toBeInTheDocument();
  });

  it('não alarma quando a fila está vazia', async () => {
    summary.mockResolvedValue({ total: 9, ativas: 9, atencao: 0, semConta: 0 });
    renderPage();

    await screen.findByText('Vendas registradas');
    expect(screen.queryByText(/não conseguem entrar/)).not.toBeInTheDocument();
  });

  it('mostra acesso e conta como duas leituras separadas', async () => {
    // Quem pagou e não criou a senha tem acesso ativo E não entra. A tela
    // precisa dizer as duas coisas ao mesmo tempo, ou o suporte responde errado.
    list.mockResolvedValue([toSale(row())]);
    renderPage();

    expect(await screen.findByText('joana@escola.com')).toBeInTheDocument();
    expect(screen.getByText('Ativa')).toBeInTheDocument();
    expect(screen.getByText('E-mail não enviado')).toBeInTheDocument();
  });

  it('refaz a consulta ao trocar de filtro', async () => {
    renderPage();
    await waitFor(() => expect(list).toHaveBeenCalledWith('todas', ''));

    fireEvent.click(screen.getByRole('button', { name: 'Travadas' }));
    await waitFor(() => expect(list).toHaveBeenCalledWith('atencao', ''));
  });

  it('busca por e-mail só ao enviar, não a cada tecla', async () => {
    renderPage();
    await waitFor(() => expect(list).toHaveBeenCalledTimes(1));

    fireEvent.change(screen.getByLabelText('Buscar por e-mail'), {
      target: { value: 'joana@escola.com' },
    });
    expect(list).toHaveBeenCalledTimes(1);

    fireEvent.submit(screen.getByLabelText('Buscar por e-mail').closest('form')!);
    await waitFor(() => expect(list).toHaveBeenCalledWith('todas', 'joana@escola.com'));
  });

  it('mostra o erro em vez de dizer que não há vendas', async () => {
    list.mockRejectedValue(new Error('permission denied for view cakto_access_overview'));
    renderPage();

    expect(await screen.findByText(/permission denied/)).toBeInTheDocument();
    expect(screen.queryByText(/Nenhuma venda registrada/)).not.toBeInTheDocument();
  });
});
