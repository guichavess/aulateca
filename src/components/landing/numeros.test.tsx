import React from 'react';
import { readdirSync, readFileSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import HeroSection from './HeroSection';
import FinalCTASection from './FinalCTASection';
import HowItWorksSection from './HowItWorksSection';
import LandingNavbar from './LandingNavbar';
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

  it('a navbar não promete um plano grátis que não existe', () => {
    const { container } = renderComRotas(<LandingNavbar />);
    expect(textoDe(container)).not.toMatch(/gr[áa]tis/i);
  });

  it('o CTA da navbar leva ao checkout, não à tela de login', () => {
    renderComRotas(<LandingNavbar />);
    const destinos = screen.getAllByRole('link').map((a) => a.getAttribute('href'));
    // A raiz é protegida: apontar para '/' despeja quem quer comprar no login.
    expect(destinos).not.toContain('/');
  });

  it('o botão de compra continua levando a algum lugar', () => {
    renderComRotas(<HeroSection />);
    expect(screen.getAllByRole('link').length).toBeGreaterThan(0);
  });
});

/**
 * Os testes acima renderizam componente por componente, e por isso só cobrem o
 * que alguém lembrou de listar. Foi assim que a tela de login passou batido: ela
 * não fica em `landing/`, e continuou anunciando "Mais de 226 atividades" por
 * quase um dia depois de a landing ser corrigida — quatro vezes o acervo real,
 * na primeira tela que o cliente vê.
 *
 * Esta varredura fecha a classe inteira: nenhum arquivo de interface pode
 * carregar os números velhos, esteja ele em `landing/` ou não. Quem escrever a
 * próxima tela não precisa saber que este arquivo existe para ser pego por ele.
 */
describe('as promessas antigas não sobreviveram em canto nenhum do código', () => {
  const promessasMortas = [
    { texto: '226', motivo: 'total de atividades inflado (o acervo tem 54)' },
    { texto: '8.500', motivo: 'professoras que nunca existiram' },
    { texto: '37 jogos', motivo: 'contagem de jogos inflada' },
    { texto: '47 exercícios', motivo: 'contagem de exercícios inflada' },
  ];

  const arquivosDeInterface = () => {
    const raiz = resolve(import.meta.dirname, '..', '..');
    const encontrados: string[] = [];
    const varrer = (dir: string) => {
      for (const entrada of readdirSync(dir, { withFileTypes: true })) {
        const caminho = join(dir, entrada.name);
        if (entrada.isDirectory()) varrer(caminho);
        else if (/\.tsx?$/.test(entrada.name) && !/\.test\.tsx?$/.test(entrada.name)) {
          encontrados.push(caminho);
        }
      }
    };
    varrer(raiz);
    return encontrados;
  };

  it.each(promessasMortas)('nenhuma tela diz "$texto" ($motivo)', ({ texto }) => {
    const culpados = arquivosDeInterface()
      .filter((caminho) => readFileSync(caminho, 'utf8').includes(texto))
      .map((caminho) => relative(resolve(import.meta.dirname, '..', '..'), caminho));

    expect(culpados).toEqual([]);
  });
});
