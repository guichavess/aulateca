import { Home, Heart, CircleUser } from 'lucide-react';

/**
 * As abas do app — fonte única.
 *
 * Mora fora do `BottomTabBar` porque o celular da landing (`HeroPhone`) desenha
 * esta mesma barra em HTML e precisa da lista: enquanto ele tinha a própria
 * cópia, ficou anunciando uma aba "Catálogo" que já tinha saído da navegação —
 * a página de vendas prometendo uma tela que o produto não tem. Importando
 * daqui, a próxima mudança de navegação chega sozinha à landing.
 */
export const tabs = [
  { path: '/', label: 'Início', icon: Home },
  { path: '/favorites', label: 'Favoritos', icon: Heart },
  { path: '/profile', label: 'Perfil', icon: CircleUser },
];
