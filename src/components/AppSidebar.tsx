import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, Compass, Heart, Sparkles, MessageCircle, Gamepad2, FileEdit, BookOpen } from 'lucide-react';
import { categories } from '@/lib/data';
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
  { path: '/ludic-activities', label: 'Atividades Lúdicas', icon: Gamepad2 },
  { path: '/other-activities', label: 'Outras Atividades', icon: FileEdit },
  { path: '/catalog', label: 'Catálogo', icon: BookOpen },
  { path: '/ai-plan', label: 'Teca', icon: Sparkles },
  { path: '/community', label: 'Comunidade', icon: MessageCircle },
];

const AppSidebar: React.FC<AppSidebarProps> = ({ collapsed }) => {
  const location = useLocation();
  const { favorites } = useApp();
  const showCategories = ['/', '/explore', '/favorites'].includes(location.pathname);

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

        {/* Categories */}
        {showCategories && !collapsed && (
          <div className="mt-5 pt-4 border-t border-border/30">
            <p className="section-label px-3 mb-2">Categorias</p>
            {categories.map((cat) => (
              <div key={cat.id} className="flex items-center gap-2.5 px-3 py-1.5 text-[13px] text-muted-foreground rounded-lg hover:bg-secondary/60 hover:text-foreground transition-all duration-200 cursor-pointer">
                <span className="text-sm">{cat.icon}</span>
                <span className="flex-1 truncate">{cat.label}</span>
                <span className="text-[10px] text-muted-foreground/50 tabular-nums">{cat.count}</span>
              </div>
            ))}
          </div>
        )}
      </nav>

      {/* PRO Card */}
      {!collapsed && (
        <div className="mx-3 mb-3 p-4 rounded-2xl" style={{ background: 'linear-gradient(135deg, hsla(249, 76%, 64%, 0.1), hsla(249, 92%, 74%, 0.05))', border: '1px solid hsla(249, 76%, 64%, 0.12)' }}>
          <div className="font-fredoka font-bold text-sm text-foreground mb-0.5">✨ Aulateca PRO</div>
          <p className="text-[11px] text-muted-foreground mb-3 leading-relaxed">Recursos ilimitados e IA avançada</p>
          <button className="w-full py-2 rounded-xl text-xs font-bold btn-primary-glow text-primary-foreground">
            Upgrade
          </button>
        </div>
      )}
    </aside>
  );
};

export default AppSidebar;
