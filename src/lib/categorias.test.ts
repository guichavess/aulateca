import { describe, it, expect } from 'vitest';
import { categories, categoryColorMap, resources } from './data';

/**
 * "Atividades de Sondagem" e "Datas Comemorativas" ficaram meses no menu sem
 * uma ficha sequer: quem clicava caía numa tela vazia. Um caminho que o produto
 * oferece e não cumpre custa mais caro do que um caminho que não existe.
 *
 * O teste não proíbe categoria nova — proíbe categoria *anunciada e vazia*.
 * Produza a primeira ficha e ela pode voltar à navegação no mesmo commit.
 */
describe('as categorias que a navegação oferece', () => {
  const oferecidas = categories.filter((c) => c.id !== 'all');

  it('nenhuma leva a uma tela vazia', () => {
    const vazias = oferecidas
      .filter((c) => resources.every((r) => r.category !== c.id))
      .map((c) => c.label);

    expect(vazias).toEqual([]);
  });

  it('a contagem exibida é a do acervo, não um número escrito à mão', () => {
    for (const cat of oferecidas) {
      const real = resources.filter((r) => r.category === cat.id).length;
      expect(cat.count).toBe(real);
    }
    expect(categories.find((c) => c.id === 'all')?.count).toBe(resources.length);
  });

  it('toda categoria oferecida tem cor — senão o card sai sem identidade', () => {
    for (const cat of oferecidas) {
      expect(categoryColorMap[cat.id]).toBeTruthy();
    }
  });
});
