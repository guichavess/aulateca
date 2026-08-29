import React, { useState } from 'react';
import { Menu, Search, X, Compass, Heart, PenLine, BookOpenCheck, Gamepad2, Shield } from 'lucide-react';
import { useApp } from '@/lib/context';
import NotificationBell from '@/components/layout/NotificationBell';
import UserMenu from '@/components/layout/UserMenu';
import TecaMascot from '@/components/brand/TecaMascot';
import { NavLink, useNavigate } from 'react-router-dom';

interface AppHeaderProps {
  onToggleSidebar: () => void;
  isMobile?: boolean;
}

const mobileMenuItems = [
  { path: '/', label: 'Início', icon: Compass },
  { path: '/explore', label: 'Explorar', icon: Compass },
  { path: '/favorites', label: 'Favoritos', icon: Heart },
  { path: '/categoria/producao-texto', label: 'Produção de Texto', icon: PenLine },
  { path: '/categoria/interpretacao-texto', label: 'Interpretação de Texto', icon: BookOpenCheck },
  { path: '/categoria/ludica', label: 'Atividades Lúdicas', icon: Gamepad2 },
];

const AppHeader: React.FC<AppHeaderProps> = ({ onToggleSidebar, isMobile }) => {
  const { user } = useApp();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isAdmin = user?.role === 'ADMIN';


  if (isMobile) {
    return (
      <>
        <header
          className="surface-chrome h-14 flex items-center justify-between px-4 sticky top-0 z-30 border-b-2"
        >
          {/* Left: hamburger + logo */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Abrir menu"
              aria-expanded={mobileMenuOpen}
              className="flex h-10 w-10 items-center justify-center rounded-button text-muted-foreground transition-colors hover:bg-secondary hover:text-ink"
            >
              <Menu className="w-5 h-5" />
            </button>
            <TecaMascot size="xs" alt="Aulateca" />
            <span className="font-fredoka text-base font-bold text-foreground tracking-tight">Aulateca</span>
          </div>

          {/* Right: bell + avatar */}
          <div className="flex items-center gap-2">
            <NotificationBell
              className="flex h-10 w-10 items-center justify-center rounded-button text-muted-foreground transition-colors hover:bg-secondary hover:text-ink"
              iconClassName="w-5 h-5"
              badgeClassName="top-1 right-1"
            />
            <UserMenu />
          </div>
        </header>

        {/* Mobile slide-down menu */}
        {mobileMenuOpen && (
          <>
            <div className="fixed inset-0 bg-black/40 z-40" onClick={() => setMobileMenuOpen(false)} />
            <div
              className="surface-chrome fixed top-0 left-0 w-[280px] h-full z-50 border-r-2 animate-slide-up overflow-y-auto"
            >
              <div className="flex items-center justify-between px-4 h-14 border-b-2 border-border">
                <div className="flex items-center gap-2">
                  <TecaMascot size="xs" alt="Aulateca" />
                  <span className="font-fredoka text-base font-bold text-foreground tracking-tight">Aulateca</span>
                </div>
                <button onClick={() => setMobileMenuOpen(false)} aria-label="Fechar menu" className="flex h-10 w-10 items-center justify-center rounded-button text-muted-foreground transition-colors hover:bg-secondary hover:text-ink">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <nav className="p-3 space-y-1.5">
                {mobileMenuItems.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={({ isActive }) =>
                      `nav-item ${isActive ? 'nav-item-active' : ''}`
                    }
                  >
                    <item.icon className="w-[18px] h-[18px] shrink-0" />
                    <span>{item.label}</span>
                  </NavLink>
                ))}
              </nav>
            </div>
          </>
        )}
      </>
    );
  }

  return (
    <header
      className="surface-chrome h-16 flex items-center gap-3 px-4 sm:px-6 lg:px-8 border-b-2 sticky top-0 z-30"
    >
      <button
        onClick={onToggleSidebar}
        aria-label="Recolher ou expandir o menu lateral"
        className="flex h-10 w-10 items-center justify-center rounded-button text-muted-foreground transition-colors hover:bg-secondary hover:text-ink"
      >
        <Menu className="w-5 h-5" />
      </button>

      <div className="flex-1 max-w-sm">
        <div className="field-sticker flex items-center gap-2 h-11 px-3.5">
          <Search className="w-4 h-4 text-muted-foreground shrink-0" />
          <input
            type="text"
            placeholder="Buscar recursos..."
            className="bg-transparent text-sm text-foreground placeholder:text-muted-foreground/70 outline-none w-full"
            aria-label="Buscar recursos"
          />
        </div>
      </div>

      <div className="flex items-center gap-1.5">
        {isAdmin && (
          <button
            onClick={() => navigate('/admin')}
            title="Painel administrativo"
            className="flex items-center gap-1.5 h-10 px-3 rounded-button border-2 border-transparent font-fredoka text-xs font-bold text-primary transition-colors hover:bg-accent hover:border-primary/35"
          >
            <Shield className="w-[14px] h-[14px]" />
            Admin
          </button>
        )}
        <NotificationBell
          className="flex h-10 w-10 items-center justify-center rounded-button text-muted-foreground transition-colors hover:bg-secondary hover:text-ink"
          iconClassName="w-[18px] h-[18px]"
          badgeClassName="top-1.5 right-1.5"
        />
        <UserMenu className="ml-1" />
      </div>
    </header>
  );
};

export default AppHeader;
