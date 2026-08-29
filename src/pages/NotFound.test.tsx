import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import NotFound from './NotFound';

/**
 * A 404 só é alcançável com sessão válida (deslogado, a rota `*` cai no login),
 * então ela não dá para conferir no navegador sem credencial de verdade. Este
 * teste é o que garante que ela continua em português, com as duas saídas e com
 * a Teca — foi justamente por não ter ninguém olhando que ela ficou anos com o
 * "Oops! Page not found" do template.
 */
const renderPage = () =>
  render(
    <MemoryRouter initialEntries={['/rota-inexistente']}>
      <NotFound />
    </MemoryRouter>,
  );

describe('NotFound', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('fala português e não culpa quem chegou aqui', () => {
    renderPage();
    expect(screen.getByRole('heading', { name: /A Teca procurou com os oito braços/ })).toBeInTheDocument();
    expect(screen.getByText(/o erro é nosso/)).toBeInTheDocument();
    expect(screen.queryByText(/Page not found/i)).not.toBeInTheDocument();
  });

  it('oferece as duas saídas', () => {
    renderPage();
    expect(screen.getByRole('link', { name: /Voltar para o início/ })).toHaveAttribute('href', '/');
    expect(screen.getByRole('link', { name: /Explorar atividades/ })).toHaveAttribute('href', '/explore');
  });

  it('mostra a Teca e o selo 404', () => {
    const { container } = renderPage();
    expect(screen.getByText('404')).toBeInTheDocument();
    // A Teca é decorativa aqui: o texto já diz tudo, e o leitor de tela não
    // deve anunciar o mascote antes do título.
    expect(container.querySelector('img[aria-hidden="true"]')).toBeInTheDocument();
  });

  it('registra a rota quebrada no console para dar rastro', () => {
    renderPage();
    expect(console.error).toHaveBeenCalledWith('404: rota inexistente —', '/rota-inexistente');
  });
});
