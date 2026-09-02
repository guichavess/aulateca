import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { totalMensalCentavos } from '@/lib/oferta';

/**
 * O CTA é o único caminho da landing para o dinheiro, e o evento que ele
 * dispara alimenta a otimização de anúncio da Meta. Dois erros aqui são caros
 * e silenciosos: disparar o evento errado (`Purchase` no clique conta
 * desistência como venda) e mandar um valor que não é o que a Cakto cobra.
 *
 * A URL do checkout vem do ambiente, e o `.env.local` de cada máquina pode ter
 * ou não ter a variável — daí o `stubEnv` com reimportação. Sem isso o teste
 * passaria na máquina de quem tem a variável e pularia calado na de quem não
 * tem, que é a pior forma de falhar.
 */

const fbqEspiao = vi.fn();
const CHECKOUT_DE_TESTE = 'https://pay.cakto.com.br/teste';

async function montar(urlDoCheckout: string) {
  vi.stubEnv('VITE_CAKTO_CHECKOUT_URL', urlDoCheckout);
  vi.resetModules();
  const { default: CheckoutButton } = await import('@/components/landing/CheckoutButton');

  render(
    <MemoryRouter>
      <CheckoutButton className="cta">Assinar</CheckoutButton>
    </MemoryRouter>,
  );
}

describe('o CTA de checkout', () => {
  beforeEach(() => {
    fbqEspiao.mockClear();
    (window as unknown as Record<string, unknown>).fbq = fbqEspiao;
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    delete (window as unknown as Record<string, unknown>).fbq;
  });

  it('avisa a Meta que o checkout começou, com o total que a Cakto cobra', async () => {
    await montar(CHECKOUT_DE_TESTE);
    fireEvent.click(screen.getByText('Assinar'));

    expect(fbqEspiao).toHaveBeenCalledWith('track', 'InitiateCheckout', {
      value: totalMensalCentavos / 100,
      currency: 'BRL',
    });
  });

  it('não dispara Purchase — o clique não é a compra', async () => {
    await montar(CHECKOUT_DE_TESTE);
    fireEvent.click(screen.getByText('Assinar'));

    const eventos = fbqEspiao.mock.calls.map((chamada) => chamada[1]);
    expect(eventos).not.toContain('Purchase');
  });

  it('leva mesmo ao checkout — o rastreio não pode engolir a navegação', async () => {
    await montar(CHECKOUT_DE_TESTE);

    expect(screen.getByText('Assinar').closest('a')).toHaveAttribute(
      'href',
      CHECKOUT_DE_TESTE,
    );
  });

  it('não quebra o clique quando a Meta não carregou', async () => {
    // Bloqueador de anúncio, ou uma rota onde o pixel não roda de propósito.
    delete (window as unknown as Record<string, unknown>).fbq;
    await montar(CHECKOUT_DE_TESTE);

    expect(() => fireEvent.click(screen.getByText('Assinar'))).not.toThrow();
  });

  it('sem URL de checkout, cai no login e não conta como início de compra', async () => {
    await montar('');
    fireEvent.click(screen.getByText('Assinar'));

    expect(screen.getByText('Assinar').closest('a')).toHaveAttribute('href', '/login');
    expect(fbqEspiao).not.toHaveBeenCalled();
  });
});
