import React, { useState } from 'react';
import { Bell, Menu, Search, X, Compass, Gamepad2, FileEdit, BookOpen, MessageCircle, Heart } from 'lucide-react';
import { toast } from 'sonner';
import { useApp } from '@/lib/context';
import mascot from '@/assets/mascot.png';
import { NavLink } from 'react-router-dom';

interface AppHeaderProps {
  onToggleSidebar: () => void;
  isMobile?: boolean;
}

const mobileMenuItems = [
  { path: '/', label: 'Início', icon: Compass },
  { path: '/explore', label: 'Explorar', icon: Compass },
  { path: '/ludic-activities', label: 'Atividades Lúdicas', icon: Gamepad2 },
  { path: '/other-activities', label: 'Outras Atividades', icon: FileEdit },
  { path: '/catalog', label: 'Catálogo', icon: BookOpen },
  { path: '/favorites', label: 'Favoritos', icon: Heart },
  { path: '/community', label: 'Comunidade', icon: MessageCircle },
];

const AppHeader: React.FC<AppHeaderProps> = ({ onToggleSidebar, isMobile }) => {
  const { logout, userName } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const initials = userName
    ? userName.split(' ').filter(Boolean).map(w => w[0]).slice(0, 2).join('').toUpperCase()
    : 'PT';

  if (isMobile) {
    return (
      <>
        <header
          className="h-12 flex items-center justify-between px-4 sticky top-0 z-30 border-b border-border/30"
          style={{ background: 'hsla(var(--background), 0.92)', backdropFilter: 'blur(20px)' }}
        >
          {/* Left: hamburger + logo */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-muted-foreground hover:text-foreground p-1 transition-colors duration-200"
            >
              <Menu className="w-5 h-5" />
            </button>
            <img src={mascot} alt="Aulateca" className="w-7 h-7 rounded-lg object-cover" />
            <span className="font-fredoka text-base font-bold text-foreground tracking-tight">Aulateca</span>
          </div>

          {/* Right: bell + avatar */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => toast.info('Sem notificações novas')}
              className="relative text-muted-foreground hover:text-foreground p-1.5 transition-colors duration-200"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-destructive ring-2 ring-background" />
            </button>
            <button
              onClick={logout}
              className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/15 to-primary/8 flex items-center justify-center text-[11px] font-bold text-primary"
            >
              {initials}
            </button>
          </div>
        </header>

        {/* Mobile slide-down menu */}
        {mobileMenuOpen && (
          <>
            <div className="fixed inset-0 bg-black/40 z-40" onClick={() => setMobileMenuOpen(false)} />
            <div
              className="fixed top-0 left-0 w-[280px] h-full z-50 border-r border-border/30 animate-slide-up overflow-y-auto"
              style={{ background: 'hsl(var(--background))' }}
            >
              <div className="flex items-center justify-between px-4 h-12 border-b border-border/30">
                <div className="flex items-center gap-2">
                  <img src={mascot} alt="Aulateca" className="w-7 h-7 rounded-lg object-cover" />
                  <span className="font-fredoka text-base font-bold text-foreground tracking-tight">Aulateca</span>
                </div>
                <button onClick={() => setMobileMenuOpen(false)} className="text-muted-foreground hover:text-foreground p-1">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <nav className="p-3 space-y-1">
                {mobileMenuItems.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                        isActive
                          ? 'bg-primary/10 text-primary font-semibold'
                          : 'text-muted-foreground hover:text-foreground hover:bg-secondary/60'
                      }`
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
      className="h-14 flex items-center gap-3 px-4 sm:px-6 lg:px-8 border-b border-border/40 sticky top-0 z-30"
      style={{ background: 'hsla(var(--background), 0.88)', backdropFilter: 'blur(20px)' }}
    >
      <button
        onClick={onToggleSidebar}
        className="text-muted-foreground hover:text-foreground hover:bg-secondary/60 rounded-lg p-1.5 transition-all duration-200"
      >
        <Menu className="w-5 h-5" />
      </button>

      <div className="flex-1 max-w-sm">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-secondary/50 border border-border/30 transition-all duration-200 focus-within:ring-2 focus-within:ring-primary/25 focus-within:border-primary/25 focus-within:bg-card">
          <Search className="w-4 h-4 text-muted-foreground shrink-0" />
          <input
            type="text"
            placeholder="Buscar recursos..."
            className="bg-transparent text-sm text-foreground placeholder:text-muted-foreground/70 outline-none w-full"
          />
        </div>
      </div>

      <div className="flex items-center gap-1.5">
        <button
          onClick={() => toast.info('Sem notificações novas')}
          className="relative text-muted-foreground hover:text-foreground hover:bg-secondary/60 rounded-lg p-2 transition-all duration-200"
        >
          <Bell className="w-[18px] h-[18px]" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-destructive ring-2 ring-background" />
        </button>
        <button
          onClick={logout}
          className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/15 to-primary/8 flex items-center justify-center text-[11px] font-bold text-primary hover:from-primary/25 hover:to-primary/12 transition-all duration-200 ml-1"
        >
          {initials}
        </button>
      </div>
    </header>
  );
};

export default AppHeader;
