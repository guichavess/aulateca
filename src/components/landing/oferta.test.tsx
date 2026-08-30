import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import OfertaCard from './OfertaCard';
import {
  emReais,
  taxaServicoCentavos,
  totalMensalCentavos,
  valorAnteriorCentavos,
  valorMensalCentavos,
} from '@/lib/oferta';

/**
 * O bloco de preço nasceu de uma referência visual de **outro produto** — uma
 * captura de tela que prometia "+300 páginas", "acesso vitalício", "somente
 * hoje" e um preço riscado. Nada daquilo descrevia o AulaTeca, que vende
 * assinatura mensal.
 *
 * Copiar layout é legítimo; copiar promessa é o que estes testes impedem. Eles
 * existem porque a tentação é sempre a mesma: a referência converte bem, e as
 * frases dela são fáceis de colar sem reparar que viraram mentira aqui.
 */

const renderCard = () => render(<MemoryRouter><OfertaCard /></MemoryRouter>);

/**
 * `toLocaleString('pt-BR')` separa "R$" do número com espaço **inquebrável**
 * (U+00A0) — o certo tipograficamente, e o motivo de a comparação ingênua
 * falhar: `\s+` normaliza o NBSP do DOM para espaço comum, e aí o valor
 * esperado (ainda com NBSP) deixa de bater. Os dois lados passam pela mesma
 * normalização.
 */
const normaliza = (texto: string) => texto.replace(/\s+/g, ' ');

const textoDe = (container: HTMLElement) => normaliza(container.textContent ?? '');

/** O preço como ele aparece depois da normalização acima. */
const precoEsperado = (centavos: number) => normaliza(emReais(centavos));

describe('o card de oferta diz a verdade sobre a cobrança', () => {
  it('mostra o preço que está em oferta.ts, não um número digitado à mão', () => {
    const { container } = renderCard();
    expect(textoDe(container)).toContain(precoEsperado(valorMensalCentavos));
  });

  it('avisa que a cobrança é mensal — nunca só o valor solto', () => {
    const { container } = renderCard();
    const texto = textoDe(container);
    // Assinatura anunciada como compra única é o estorno mais comum que existe.
    expect(texto).toMatch(/\/mês|por mês/i);
    expect(texto).toMatch(/renovação automática/i);
  });

  it('declara a taxa de serviço e o total antes do clique', () => {
    const { container } = renderCard();
    const texto = textoDe(container);
    // Quem chega ao checkout não pode descobrir um valor novo lá.
    expect(texto).toContain(precoEsperado(taxaServicoCentavos));
    expect(texto).toContain(precoEsperado(totalMensalCentavos));
  });

  it('não promete acesso vitalício, que é o oposto de assinatura', () => {
    const { container } = renderCard();
    expect(textoDe(container)).not.toMatch(/vital[íi]cio|para sempre|de uma vez/i);
  });

  it('não inventa urgência que se repete todo dia', () => {
    const { container } = renderCard();
    expect(textoDe(container)).not.toMatch(
      /somente hoje|s[óo] hoje|[úu]ltimas? (vagas|horas)|acaba em/i,
    );
  });

  it('não anuncia o tamanho do acervo', () => {
    const { container } = renderCard();
    // Mesma regra do resto da landing (ver numeros.test.tsx). "páginas" entra
    // aqui de propósito: era o termo da referência, e o guarda de lá não o pega.
    expect(textoDe(container)).not.toMatch(
      /\d+\s*(atividades|fichas|jogos|exercícios|recursos|páginas)/i,
    );
  });

  it('só risca um preço anterior quando existe um preço anterior', () => {
    const { container } = renderCard();
    const riscado = container.querySelector('.line-through');

    if (valorAnteriorCentavos === null) {
      // Preço-âncora inventado é publicidade enganosa (CDC art. 37).
      expect(riscado).toBeNull();
      expect(textoDe(container)).not.toMatch(/\bde R\$/i);
    } else {
      expect(normaliza(riscado?.textContent ?? '')).toContain(
        precoEsperado(valorAnteriorCentavos),
      );
    }
  });

  it('o botão continua levando ao checkout', () => {
    renderCard();
    const destinos = screen.getAllByRole('link').map((a) => a.getAttribute('href'));
    expect(destinos.length).toBeGreaterThan(0);
    // A raiz é protegida: apontar para '/' despeja quem quer comprar no login.
    expect(destinos).not.toContain('/');
  });
});
