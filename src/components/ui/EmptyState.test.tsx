import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import EmptyState from './EmptyState';

/**
 * O estado vazio estava reescrito à mão em dez lugares e cada cópia anunciava
 * de um jeito. O que estes testes travam não é a aparência — é o que muda de
 * verdade para quem usa: erro é anunciado, carregamento é anunciado, e a Teca
 * não rouba a leitura do texto.
 */
describe('EmptyState', () => {
  it('mostra título, descrição e a saída', () => {
    render(
      <EmptyState
        title="Nada encontrado para esses filtros"
        description="Tente afrouxar a categoria."
        action={<button>Limpar filtros</button>}
      />,
    );
    expect(screen.getByText('Nada encontrado para esses filtros')).toBeInTheDocument();
    expect(screen.getByText('Tente afrouxar a categoria.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Limpar filtros' })).toBeInTheDocument();
  });

  it('anuncia o erro para quem usa leitor de tela', () => {
    render(<EmptyState tone="error" title="Não foi possível carregar" />);
    expect(screen.getByRole('alert')).toHaveTextContent('Não foi possível carregar');
  });

  it('o vazio comum não vira alerta — é só a consequência do filtro', () => {
    render(<EmptyState title="Nenhum favorito ainda" />);
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('a Teca é decorativa: o texto é que carrega a informação', () => {
    const { container } = render(<EmptyState title="Carregando…" tone="loading" />);
    const img = container.querySelector('img');
    expect(img).toHaveAttribute('aria-hidden', 'true');
    expect(img).toHaveAttribute('alt', '');
  });
});
