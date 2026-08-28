import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, Compass, CircleUser, Heart, BookOpen, PenLine, BookOpenCheck, Gamepad2, Search, CalendarHeart } from 'lucide-react';
import { categories } from '@/lib/data';
import { CategoryId } from '@/lib/types';
import { useApp } from '@/lib/context';
import TecaMascot from '@/components/brand/TecaMascot';

interface AppSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

const navItems = [
  { path: '/', label: 'Início', icon: Home },
  { path: '/explore', label: 'Explorar', icon: Compass },
  { path: '/favorites', label: 'Favoritos', icon: Heart, badge: true },
  { path: '/catalog', label: 'Catálogo', icon: BookOpen },
  // No desktop o perfil só era alcançável pelo avatar do header — que até
  // agora deslogava direto. No mobile já existia via BottomTabBar.
  { path: '/profile', label: 'Meu perfil', icon: CircleUser },
];

const categoryIconMap: Record<Exclude<CategoryId, 'all'>, React.ComponentType<{ className?: string }>> = {
  'producao-texto': PenLine,
  'interpretacao-texto': BookOpenCheck,
  'ludica': Gamepad2,
  'sondagem': Search,
  'datas-comemorativas': CalendarHeart,
};

const AppSidebar: React.FC<AppSidebarProps> = ({ collapsed }) => {
  const location = useLocation();
  const { favorites } = useApp();

  const categoryNavItems = categories.filter((c) => c.id !== 'all' && c.path);

  return (
    <aside
      className={`surface-chrome flex flex-col border-r-2 transition-[width] duration-300 ease-out ${collapsed ? 'w-[72px]' : 'w-[260px]'} h-screen sticky top-0`}
    >
      {/* Logo */}
      <div className={`flex items-center gap-2.5 px-5 h-16 shrink-0 border-b-2 border-border ${collapsed ? 'justify-center' : ''}`}>
        <TecaMascot size="xs" alt="Aulateca" className="w-8 h-8 shrink-0" />
        {!collapsed && <span className="font-fredoka text-lg font-bold text-foreground tracking-tight">Aulateca</span>}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 space-y-1 pt-3 overflow-y-auto">
        {navItems.map((item) => {
          const active = location.pathname === item.path;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={`nav-item ${active ? 'nav-item-active' : ''} ${collapsed ? 'justify-center px-2' : ''}`}
            >
              <item.icon className="w-[18px] h-[18px] shrink-0" />
              {!collapsed && (
                <span className="flex-1 truncate">{item.label}</span>
              )}
              {!collapsed && item.badge && favorites.size > 0 && (
                <span className="min-w-[22px] h-[22px] rounded-pill border-2 border-primary bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center px-1.5 tabular-nums">
                  {favorites.size}
                </span>
              )}
            </NavLink>
          );
        })}

        {/* Categorias */}
        <div className="mt-5 pt-4 border-t-2 border-border space-y-0.5">
          {!collapsed && <p className="section-label px-3 mb-2">Categorias</p>}
          {categoryNavItems.map((cat) => {
            const Icon = categoryIconMap[cat.id as Exclude<CategoryId, 'all'>];
            const active = location.pathname === cat.path;
            return (
              <NavLink
                key={cat.id}
                to={cat.path!}
                className={`nav-item ${active ? 'nav-item-active' : ''} ${collapsed ? 'justify-center px-2' : ''}`}
              >
                {Icon && <Icon className="w-[18px] h-[18px] shrink-0" />}
                {!collapsed && <span className="flex-1 truncate">{cat.label}</span>}
              </NavLink>
            );
          })}
        </div>
      </nav>
    </aside>
  );
};

export default AppSidebar;
