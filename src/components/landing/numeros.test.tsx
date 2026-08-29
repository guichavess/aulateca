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

/**
 * Este arquivo já travou o oposto do que trava hoje, e a história importa para
 * quem vier depois:
 *
 *   1. A landing anunciava "226+ atividades / 37 jogos / 47 exercícios" e "mais
 *      de 8.500 professoras" — números inventados, nenhum deles sustentado pelo
 *      acervo. Viraram a contagem real, lida de `acervo.stats.ts`.
 *   2. Em 29/08/2026 o gestor decidiu que a página **não anuncia contagem
 *      nenhuma**: dizer o total exato entrega ao concorrente o tamanho do
 *      catálogo e ancora a compra num número em vez do que o material faz.
 *
 * O que se preserva das duas fases é a mesma regra: **a página não pode
 * afirmar uma quantidade**. Antes ela mentia o número; agora ela não o diz. Um
 * número inventado voltar seria tão reprovável quanto antes — por isso os
 * guardas dos valores antigos continuam aqui.
 */

const renderComRotas = (ui: React.ReactElement) =>
  render(<MemoryRouter>{ui}</MemoryRouter>);

/** Todo o texto visível da seção, sem depender de onde a copy quebrou a frase. */
const textoDe = (container: HTMLElement) =>
  (container.textContent ?? '').replace(/\s+/g, ' ');

/**
 * "54 atividades", "30 jogos", "24 exercícios", "São 54 fichas" — qualquer
 * forma de dizer quanto o acervo tem. Não pega "do 1° ao 9° ano" nem "7 dias de
 * garantia", que são datas e faixas, não contagem de material.
 */
const CONTAGEM = /\d+\s*(atividades|fichas|jogos|exercícios)/i;

describe('a landing não anuncia o tamanho do acervo', () => {
  it('o Hero não diz quantas atividades existem', () => {
    const { container } = renderComRotas(<HeroSection />);
    expect(textoDe(container)).not.toMatch(CONTAGEM);
  });

  it('o CTA final não diz quantas fichas existem', () => {
    const { container } = renderComRotas(<FinalCTASection />);
    expect(textoDe(container)).not.toMatch(CONTAGEM);
  });

  it('o Hero continua dizendo o que a plataforma tem, sem número', () => {
    const { container } = renderComRotas(<HeroSection />);
    const texto = textoDe(container);
    // A promessa qualitativa é o que sobrou no lugar da contagem: se ela também
    // sumir, a seção deixou de dizer o que se está comprando.
    expect(texto).toMatch(/atividades/i);
    expect(texto).toMatch(/jogos lúdicos/i);
    expect(texto).toMatch(/exercícios complementares/i);
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
 * Esta varredura fecha a classe inteira: ela lê o código-fonte, não o render, e
 * por isso alcança telas que nenhum teste daqui monta.
 */
const RAIZ_SRC = resolve(import.meta.dirname, '..', '..');

const arquivosDeInterface = (dir = RAIZ_SRC): string[] => {
  const encontrados: string[] = [];
  for (const entrada of readdirSync(dir, { withFileTypes: true })) {
    const caminho = join(dir, entrada.name);
    if (entrada.isDirectory()) encontrados.push(...arquivosDeInterface(caminho));
    else if (/\.tsx?$/.test(entrada.name) && !/\.test\.tsx?$/.test(entrada.name)) {
      encontrados.push(caminho);
    }
  }
  return encontrados;
};

const curto = (caminho: string) => relative(RAIZ_SRC, caminho).replace(/\\/g, '/');

describe('as promessas antigas não sobreviveram em canto nenhum do código', () => {
  const promessasMortas = [
    { texto: '226', motivo: 'total de atividades inflado' },
    { texto: '8.500', motivo: 'professoras que nunca existiram' },
    { texto: '37 jogos', motivo: 'contagem de jogos inflada' },
    { texto: '47 exercícios', motivo: 'contagem de exercícios inflada' },
  ];

  it.each(promessasMortas)('nenhuma tela diz "$texto" ($motivo)', ({ texto }) => {
    const culpados = arquivosDeInterface()
      .filter((caminho) => readFileSync(caminho, 'utf8').includes(texto))
      .map(curto);

    expect(culpados).toEqual([]);
  });

  /**
   * `acervo.stats.ts` é a contagem real do acervo. Ela tem uso legítimo dentro
   * do produto (ex.: um painel interno), mas em tela pública é justamente o que
   * o gestor não quer expor. Proibir o import é mais confiável que caçar a
   * string do número: pega antes de virar texto.
   */
  it('nenhuma tela pública importa a contagem do acervo', () => {
    const publicas = arquivosDeInterface().filter((caminho) => {
      const rel = curto(caminho);
      return rel.startsWith('components/landing/') || rel.startsWith('pages/auth/');
    });

    const culpados = publicas
      .filter((caminho) => readFileSync(caminho, 'utf8').includes('acervo.stats'))
      .map(curto);

    expect(culpados).toEqual([]);
  });
});
