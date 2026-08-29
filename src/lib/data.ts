import { Category } from './types';
import { atividades } from './atividades.data';

export const resources = atividades;

const countFor = (category: string) =>
  category === 'all' ? resources.length : resources.filter((r) => r.category === category).length;

export const categories: Category[] = [
  { id: 'all', label: 'Todos', icon: '✦', color: 'brand-purple', count: countFor('all'), path: '/' },
  { id: 'producao-texto', label: 'Produção de Texto', icon: '✍️', color: 'brand-purple', count: countFor('producao-texto'), path: '/categoria/producao-texto' },
  { id: 'interpretacao-texto', label: 'Interpretação de Texto', icon: '📖', color: 'brand-teal', count: countFor('interpretacao-texto'), path: '/categoria/interpretacao-texto' },
  { id: 'ludica', label: 'Atividades Lúdicas', icon: '🎲', color: 'brand-pink', count: countFor('ludica'), path: '/categoria/ludica' },
  // "Atividades de Sondagem" e "Datas Comemorativas" saíram daqui: estavam no
  // menu sem uma ficha sequer, e quem clicava caía numa tela vazia. O banco
  // continua aceitando as duas (migration 009), então voltam à navegação no
  // mesmo commit em que a primeira ficha delas existir.
];

// Alinhado à paleta da Teca (ver :root em src/index.css). Fica em hex porque
// os consumidores compõem opacidade por string (`${color}1F`), o que o formato
// HSL sem função dos tokens não permite.
export const categoryColorMap: Record<string, string> = {
  'producao-texto': '#5B47E0',   // Teca Violeta — --primary
  'interpretacao-texto': '#2BA89E',
  'ludica': '#E63F87',
  'all': '#5B47E0',
};

