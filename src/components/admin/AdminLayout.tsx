import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, BookOpen, ClipboardList, Sparkles, MessageSquare, Users, LogOut, ArrowLeft,
} from 'lucide-react';
import { useApp } from '@/lib/context';

const navItems = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/recursos', label: 'Recursos', icon: BookOpen },
  { to: '/admin/adesoes', label: 'Adesões', icon: ClipboardList },
  { to: '/admin/catalogo', label: 'Catálogo público', icon: Sparkles },
  { to: '/admin/comunidade', label: 'Comunidade', icon: MessageSquare },
  { to: '/admin/usuarios', label: 'Usuários', icon: Users },
];

const AdminLayout: React.FC = () => {
  const { userName, logout } = useApp();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex w-full bg-background">
      <aside className="w-60 shrink-0 border-r border-border bg-card/40 backdrop-blur-sm flex flex-col">
        <div className="px-5 py-5 border-b border-border">
          <p className="text-[10px] font-semibold tracking-[0.25em] uppercase text-muted-foreground">Admin</p>
          <h2 className="font-fredoka text-lg font-bold gradient-text">Aulateca</h2>
        </div>

        <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-secondary/60 hover:text-foreground'
                }`
              }
            >
              <item.icon className="w-4 h-4 shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="px-3 py-3 border-t border-border space-y-1">
          <button
            onClick={() => navigate('/')}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-muted-foreground hover:bg-secondary/60 hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Voltar ao app
          </button>
          <button
            onClick={logout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-muted-foreground hover:bg-rose-500/10 hover:text-rose-500 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sair
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 border-b border-border bg-background/80 backdrop-blur-sm flex items-center justify-between px-6 sticky top-0 z-10">
          <div>
            <p className="text-xs text-muted-foreground">Painel administrativo</p>
          </div>
          <div className="text-xs text-muted-foreground">
            Olá, <span className="font-semibold text-foreground">{userName || 'Admin'}</span>
          </div>
        </header>
        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
