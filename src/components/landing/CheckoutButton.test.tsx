import React from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

/**
 * Este botão é o único caminho entre a landing e o dinheiro. Ele lê a URL do
 * checkout do ambiente, e a leitura acontece uma vez, quando o módulo carrega —
 * por isso cada caso aqui reimporta o módulo depois de trocar o ambiente.
 *
 * O que se trava: com a URL configurada, o botão leva ao checkout; sem ela, cai
 * no login em vez de virar um link morto. O modo degradado importa porque foi o
 * estado real do produto por um tempo — a página no ar, sem caminho de compra.
 */

const CHECKOUT = 'https://pay.cakto.com.br/jjaa83u_1053515';

async function montar(url?: string) {
  vi.resetModules();
  if (url === undefined) vi.stubEnv('VITE_CAKTO_CHECKOUT_URL', '');
  else vi.stubEnv('VITE_CAKTO_CHECKOUT_URL', url);

  const { default: CheckoutButton } = await import('./CheckoutButton');
  render(
    <MemoryRouter>
      <CheckoutButton>Quero acessar</CheckoutButton>
    </MemoryRouter>,
  );
  return screen.getByRole('link', { name: 'Quero acessar' });
}

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('CheckoutButton', () => {
  it('leva ao checkout da Cakto quando a URL está configurada', async () => {
    const link = await montar(CHECKOUT);
    expect(link).toHaveAttribute('href', CHECKOUT);
  });

  it('sem URL configurada, cai no login em vez de virar link morto', async () => {
    const link = await montar(undefined);
    expect(link).toHaveAttribute('href', '/login');
  });
});
