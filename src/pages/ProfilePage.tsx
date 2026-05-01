import React, { useState } from 'react';
import { useApp } from '@/lib/context';
import { Settings, Info, LogOut, ChevronRight, User, Moon, Sun, BookOpen, Heart, FileText } from 'lucide-react';

const ProfilePage: React.FC = () => {
  const { userName, logout, favorites } = useApp();
  const [darkMode, setDarkMode] = useState(false);

  const initials = userName
    ? userName.split(' ').filter(Boolean).map(w => w[0]).slice(0, 2).join('').toUpperCase()
    : 'PT';

  const stats = [
    { value: '8', label: 'Recursos Criados', icon: FileText, color: 'hsl(262, 83%, 58%)' },
    { value: String(favorites.size), label: 'Favoritos', icon: Heart, color: 'hsl(340, 82%, 65%)' },
    { value: '3', label: 'Turmas', icon: BookOpen, color: 'hsl(199, 65%, 48%)' },
  ];

  const menuItems = [
    { icon: User, label: 'Editar Perfil', color: 'hsl(262, 83%, 58%)' },
    { icon: Settings, label: 'Configurações', color: 'hsl(228, 6%, 46%)' },
    { icon: Info, label: 'Sobre o Aulateca', color: 'hsl(199, 65%, 48%)' },
  ];

  return (
    <div className="px-4 py-6 max-w-lg mx-auto space-y-5 animate-slide-up">
      {/* Avatar + name */}
      <div className="flex flex-col items-center text-center pt-2">
        <div
          className="w-24 h-24 rounded-full flex items-center justify-center text-3xl font-bold text-white mb-3 shadow-lg"
          style={{
            background: 'linear-gradient(135deg, hsl(262, 83%, 58%), hsl(249, 76%, 48%))',
            boxShadow: '0 8px 24px hsla(262, 83%, 58%, 0.3)',
          }}
        >
          {initials}
        </div>
        <h2 className="font-fredoka text-xl font-bold text-foreground">{userName || 'Professor(a)'}</h2>
        <p className="text-sm text-muted-foreground mt-0.5">professor@aulateca.com</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-3 gap-3">
        {stats.map((s) => (
          <div key={s.label} className="glass-card p-3 flex flex-col items-center text-center">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center mb-2"
              style={{ background: s.color + '14' }}
            >
              <s.icon className="w-[18px] h-[18px]" style={{ color: s.color }} />
            </div>
            <div className="font-fredoka text-lg font-bold text-foreground leading-tight">{s.value}</div>
            <div className="text-[10px] text-muted-foreground mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Menu */}
      <div className="glass-card overflow-hidden divide-y divide-border/30">
        {menuItems.map((item) => (
          <button
            key={item.label}
            className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-secondary/50 active:scale-[0.99] transition-all duration-200"
          >
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: item.color + '14' }}
            >
              <item.icon className="w-[18px] h-[18px]" style={{ color: item.color }} />
            </div>
            <span className="flex-1 text-sm font-medium text-foreground">{item.label}</span>
            <ChevronRight className="w-4 h-4 text-muted-foreground/50" />
          </button>
        ))}

        {/* Dark mode toggle row */}
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-secondary/50 active:scale-[0.99] transition-all duration-200"
        >
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: 'hsl(43, 96%, 52%)' + '14' }}
          >
            {darkMode ? (
              <Sun className="w-[18px] h-[18px]" style={{ color: 'hsl(43, 96%, 52%)' }} />
            ) : (
              <Moon className="w-[18px] h-[18px]" style={{ color: 'hsl(43, 96%, 52%)' }} />
            )}
          </div>
          <span className="flex-1 text-sm font-medium text-foreground">Modo Escuro</span>
          {/* Toggle switch */}
          <div
            className="w-10 h-[22px] rounded-full p-0.5 transition-colors duration-200 cursor-pointer"
            style={{ background: darkMode ? 'hsl(262, 83%, 58%)' : 'hsl(228, 12%, 85%)' }}
          >
            <div
              className="w-[18px] h-[18px] rounded-full bg-white shadow-sm transition-transform duration-200"
              style={{ transform: darkMode ? 'translateX(18px)' : 'translateX(0)' }}
            />
          </div>
        </button>
      </div>

      {/* Logout */}
      <button
        onClick={logout}
        className="w-full glass-card flex items-center gap-3 px-4 py-3.5 hover:bg-destructive/5 active:scale-[0.99] transition-all duration-200"
      >
        <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-destructive/10">
          <LogOut className="w-[18px] h-[18px] text-destructive" />
        </div>
        <span className="text-sm font-medium text-destructive">Sair</span>
      </button>
    </div>
  );
};

export default ProfilePage;
