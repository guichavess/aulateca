import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import HeroSection from './HeroSection';
import FinalCTASection from './FinalCTASection';
import HowItWorksSection from './HowItWorksSection';
import { atividades } from '@/lib/atividades.data';

/**
 * Com a venda no ar, número na landing deixou de ser texto desatualizado e
 * virou promessa: o visitante paga esperando encontrar o que a página anunciou.
 *
 * Estes testes não travam a copy — travam a honestidade dela. A contagem vem do
 * acervo de verdade (`atividades.data.ts`, gerado pelo manifesto), e a landing
 * lê o mesmo acervo por `acervo.stats.ts`. Se a próxima leva de fichas mudar o
 * total e alguém esquecer a página de vendas, é aqui que aparece.
 */

const total = atividades.length;
const ludicas = atividades.filter((a) => a.category === 'ludica').length;
const exercicios = atividades.filter(
  (a) => a.category === 'producao-texto' || a.category === 'interpretacao-texto',
).length;

const renderComRotas = (ui: React.ReactElement) =>
  render(<MemoryRouter>{ui}</MemoryRouter>);

/** Todo o texto visível da seção, sem depender de onde a copy quebrou a frase. */
const textoDe = (container: HTMLElement) =>
  (container.textContent ?? '').replace(/\s+/g, ' ');

describe('os números que a landing anuncia', () => {
  it('o Hero anuncia o total real do acervo, não um número inventado', () => {
    const { container } = renderComRotas(<HeroSection />);
    const texto = textoDe(container);

    expect(texto).toContain(`${total} atividades`);
    expect(texto).toContain(`${ludicas} jogos lúdicos`);
    expect(texto).toContain(`${exercicios} exercícios`);
  });

  it('o Hero não carrega mais os números antigos', () => {
    const { container } = renderComRotas(<HeroSection />);
    const texto = textoDe(container);

    expect(texto).not.toContain('226+');
    expect(texto).not.toContain('37 jogos');
    expect(texto).not.toContain('47 exercícios');
  });

  it('o CTA final chama pelo total real', () => {
    const { container } = renderComRotas(<FinalCTASection />);
    const texto = textoDe(container);

    expect(texto).toContain(String(total));
    expect(texto).not.toContain('226+');
  });

  it('nenhuma seção alega clientes que não existem', () => {
    for (const secao of [<FinalCTASection />, <HowItWorksSection />]) {
      const { container, unmount } = renderComRotas(secao);
      expect(textoDe(container)).not.toContain('8.500');
      unmount();
    }
  });

  it('o botão de compra continua levando a algum lugar', () => {
    renderComRotas(<HeroSection />);
    expect(screen.getAllByRole('link').length).toBeGreaterThan(0);
  });
});
