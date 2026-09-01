import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import HeroPhone from './HeroPhone';
import { tabs } from '@/components/layout/navTabs';
import { atividades } from '@/lib/atividades.data';
import { AGES, categories } from '@/lib/data';
import { chipsDeAno, chipsDeCategoria, fichasDestaque, fichasFavoritas } from './phoneFichas';

/**
 * O celular do hero desenha o app em HTML, e por isso pode divergir do app sem
 * que nada quebre. Foi o que aconteceu: ele anunciava quatro abas — incluindo
 * uma "Catálogo" que tinha saído da navegação — e sete fichas inventadas
 * ("Bingo do Nome", "Aeroporto da Leitura") que ninguém encontraria depois de
 * pagar. A landing prometia uma coisa e o produto entregava outra.
 *
 * Estes testes comparam o celular com as fontes de verdade do app. Não são
 * sobre pixel: são sobre a página de vendas não voltar a mostrar um produto
 * que não existe.
 */
describe('o celular do hero mostra o app que existe', () => {
  it('tem exatamente as abas da barra de navegação real', () => {
    render(<HeroPhone />);
    const barra = screen.getByTestId('phone-tabs');

    expect(barra.textContent).toBe(tabs.map((t) => t.label).join(''));
    // A aba que sumiu da navegação e sobreviveu meses na landing.
    expect(barra.textContent).not.toContain('Catálogo');
  });

  it('todo título de ficha exibido existe no acervo', () => {
    const doAcervo = new Set(atividades.map((a) => a.title));
    const exibidos = [...fichasDestaque, ...fichasFavoritas].map((f) => f.titulo);

    expect(exibidos.length).toBeGreaterThan(0);
    expect(exibidos.filter((t) => !doAcervo.has(t))).toEqual([]);
  });

  it('cada ficha aponta para a capa e o ano que o acervo registra', () => {
    const doAcervo = new Map(atividades.map((a) => [a.title, a]));
    const rotuloDoAno = new Map(AGES.map((a) => [a.id, a.label]));

    for (const ficha of [...fichasDestaque, ...fichasFavoritas]) {
      const real = doAcervo.get(ficha.titulo);
      // Se a ficha não existe no acervo, o teste precisa gritar aqui — sem isto,
      // `real?.imageUrl` seria undefined dos dois lados e a asserção passaria
      // exatamente no caso que ela deveria pegar.
      expect(real, `ficha "${ficha.titulo}" não existe no acervo`).toBeDefined();
      expect(ficha.capa).toBe(real!.imageUrl);
      expect(ficha.ano).toBe(rotuloDoAno.get(real!.ageRange));
    }
  });

  it('os chips são os filtros que a Home realmente oferece', () => {
    expect(chipsDeCategoria.map((c) => `${c.icon} ${c.label}`)).toEqual(
      categories.map((c) => `${c.icon} ${c.label}`),
    );
    expect(chipsDeAno.map((a) => a.label)).toEqual(AGES.map((a) => a.label));
  });

  it('a grade da primeira tela renderiza as fichas com capa', () => {
    const { container } = render(<HeroPhone />);

    for (const ficha of fichasDestaque) {
      expect(screen.getByText(ficha.titulo)).toBeInTheDocument();
    }
    const capas = [...container.querySelectorAll('img')].map((img) => img.getAttribute('src'));
    expect(capas).toEqual(expect.arrayContaining(fichasDestaque.map((f) => f.capa)));
  });

  it('não repete a contagem do acervo que a Home imprime', () => {
    const { container } = render(<HeroPhone />);
    // "54 recursos disponíveis" é a linha da Home que este celular espelharia
    // se ninguém segurasse. Ver `numeros.test.tsx`.
    expect(container.textContent ?? '').not.toMatch(/\d+\s*(recursos|atividades|fichas)/i);
  });
});
