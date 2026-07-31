import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, Compass, Heart, MessageCircle, BookOpen, PenLine, BookOpenCheck, Gamepad2, Search, CalendarHeart } from 'lucide-react';
import { toast } from 'sonner';
import { categories } from '@/lib/data';
import { CategoryId } from '@/lib/types';
import { useApp } from '@/lib/context';
import mascot from '@/assets/mascot.png';

interface AppSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

const navItems = [
  { path: '/', label: 'Início', icon: Home },
  { path: '/explore', label: 'Explorar', icon: Compass },
  { path: '/favorites', label: 'Favoritos', icon: Heart, badge: true },
  { path: '/catalog', label: 'Catálogo', icon: BookOpen },
  { path: '/community', label: 'Comunidade', icon: MessageCircle },
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
      className={`flex flex-col border-r border-border/40 transition-all duration-300 ease-out ${collapsed ? 'w-[72px]' : 'w-[260px]'} h-screen sticky top-0`}
      style={{ background: 'hsl(var(--sidebar-background))' }}
    >
      {/* Logo */}
      <div className={`flex items-center gap-2.5 px-5 h-14 shrink-0 ${collapsed ? 'justify-center' : ''}`}>
        <img src={mascot} alt="Aulateca mascot" className="w-8 h-8 rounded-lg object-cover shrink-0" />
        {!collapsed && <span className="font-fredoka text-lg font-bold text-foreground tracking-tight">Aulateca</span>}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 space-y-0.5 mt-1 overflow-y-auto">
        {navItems.map((item) => {
          const active = location.pathname === item.path;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2 text-[13px] font-medium transition-all duration-200 ${
                active
                  ? 'border-l-4 border-primary bg-primary/8 text-primary font-semibold rounded-none rounded-r-lg'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary/70 rounded-xl'
              } ${collapsed ? 'justify-center px-2' : ''}`}
            >
              <item.icon className="w-[18px] h-[18px] shrink-0" />
              {!collapsed && (
                <span className="flex-1 truncate">{item.label}</span>
              )}
              {!collapsed && item.badge && favorites.size > 0 && (
                <span className="min-w-[20px] h-5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center px-1.5">
                  {favorites.size}
                </span>
              )}
            </NavLink>
          );
        })}

        {/* Categorias */}
        <div className="mt-5 pt-4 border-t border-border/30 space-y-0.5">
          {!collapsed && <p className="section-label px-3 mb-2">Categorias</p>}
          {categoryNavItems.map((cat) => {
            const Icon = categoryIconMap[cat.id as Exclude<CategoryId, 'all'>];
            const active = location.pathname === cat.path;
            return (
              <NavLink
                key={cat.id}
                to={cat.path!}
                className={`flex items-center gap-3 px-3 py-2 text-[13px] font-medium transition-all duration-200 ${
                  active
                    ? 'border-l-4 border-primary bg-primary/8 text-primary font-semibold rounded-none rounded-r-lg'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary/70 rounded-xl'
                } ${collapsed ? 'justify-center px-2' : ''}`}
              >
                {Icon && <Icon className="w-[18px] h-[18px] shrink-0" />}
                {!collapsed && <span className="flex-1 truncate">{cat.label}</span>}
              </NavLink>
            );
          })}
        </div>
      </nav>

      {/* PRO Card */}
      {!collapsed && (
        <div className="mx-3 mb-3 p-4 rounded-2xl" style={{ background: 'linear-gradient(135deg, hsla(249, 76%, 64%, 0.1), hsla(249, 92%, 74%, 0.05))', border: '1px solid hsla(249, 76%, 64%, 0.12)' }}>
          <div className="font-fredoka font-bold text-sm text-foreground mb-0.5">✨ Aulateca PRO</div>
          <p className="text-[11px] text-muted-foreground mb-3 leading-relaxed">Recursos ilimitados e IA avançada</p>
          <button
            onClick={() => toast.info('Plano PRO em breve', { description: 'Recursos ilimitados e IA avançada.' })}
            className="w-full py-2 rounded-xl text-xs font-bold btn-primary-glow text-primary-foreground"
          >
            Upgrade
          </button>
        </div>
      )}
    </aside>
  );
};

export default AppSidebar;
