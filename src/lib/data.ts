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
  { id: 'sondagem', label: 'Atividades de Sondagem', icon: '🔍', color: 'brand-blue', count: countFor('sondagem'), path: '/categoria/sondagem' },
  { id: 'datas-comemorativas', label: 'Datas Comemorativas', icon: '🎉', color: 'brand-yellow', count: countFor('datas-comemorativas'), path: '/categoria/datas-comemorativas' },
];

// Alinhado à paleta da Teca (ver :root em src/index.css). Fica em hex porque
// os consumidores compõem opacidade por string (`${color}1F`), o que o formato
// HSL sem função dos tokens não permite.
export const categoryColorMap: Record<string, string> = {
  'producao-texto': '#5B47E0',   // Teca Violeta — --primary
  'interpretacao-texto': '#2BA89E',
  'ludica': '#E63F87',
  'sondagem': '#22A7F0',         // Teca Céu — --sky
  'datas-comemorativas': '#FFC800', // Sol — --sun
  'all': '#5B47E0',
};

