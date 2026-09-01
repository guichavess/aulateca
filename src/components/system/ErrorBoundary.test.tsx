import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';

const reportarErro = vi.fn();
vi.mock('@/lib/monitoring', () => ({ reportarErro: (...a: unknown[]) => reportarErro(...a) }));
vi.mock('@/lib/suporte', () => ({
  temSuporte: true,
  suporteEmailVisivel: 'suporte@exemplo.com',
  suporteMailto: (assunto: string) => `mailto:suporte@exemplo.com?subject=${assunto}`,
  suporteWhatsappUrl: () => 'https://wa.me/5511999998888',
}));

import ErrorBoundary from './ErrorBoundary';

const Explode: React.FC = () => {
  throw new Error('boom');
};

/**
 * O que estes testes protegem é o cenário que não tinha dono: erro de render
 * virando tela branca, sem mensagem para o professor e sem alarme para a gente.
 */
describe('ErrorBoundary', () => {
  // O React loga o erro capturado no console; silenciamos para a saída do teste
  // continuar legível.
  beforeEach(() => vi.spyOn(console, 'error').mockImplementation(() => {}));
  afterEach(() => vi.restoreAllMocks());

  it('deixa passar quando nada quebra', () => {
    render(
      <ErrorBoundary origem="teste">
        <p>conteúdo normal</p>
      </ErrorBoundary>,
    );
    expect(screen.getByText('conteúdo normal')).toBeInTheDocument();
  });

  it('mostra tela de erro em vez de tela branca', () => {
    reportarErro.mockReturnValue(null);
    render(
      <ErrorBoundary origem="teste">
        <Explode />
      </ErrorBoundary>,
    );
    expect(screen.getByText('Alguma coisa quebrou por aqui')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Recarregar' })).toBeInTheDocument();
  });

  it('reporta o erro para o monitoramento', () => {
    reportarErro.mockReturnValue(null);
    render(
      <ErrorBoundary origem="página">
        <Explode />
      </ErrorBoundary>,
    );
    expect(reportarErro).toHaveBeenCalled();
    const [erro, contexto] = reportarErro.mock.calls.at(-1)!;
    expect((erro as Error).message).toBe('boom');
    expect(contexto).toMatchObject({ origem: 'página' });
  });

  // O código na tela é o que transforma "não abre aqui" num chamado
  // investigável: a pessoa manda o número e ele aponta o evento exato.
  it('mostra o código do evento e oferece o suporte', () => {
    reportarErro.mockReturnValue('evt-12345');
    render(
      <ErrorBoundary origem="teste">
        <Explode />
      </ErrorBoundary>,
    );
    expect(screen.getByText('evt-12345')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /e-mail/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /WhatsApp/i })).toBeInTheDocument();
  });
});
