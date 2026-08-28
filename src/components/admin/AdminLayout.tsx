import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, BookOpen, ClipboardList, Sparkles, Users, LogOut, ArrowLeft,
  Receipt,
} from 'lucide-react';
import { useApp } from '@/lib/context';

const navItems = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/vendas', label: 'Vendas e acessos', icon: Receipt },
  { to: '/admin/recursos', label: 'Recursos', icon: BookOpen },
  { to: '/admin/adesoes', label: 'Adesões', icon: ClipboardList },
  { to: '/admin/catalogo', label: 'Catálogo público', icon: Sparkles },
  { to: '/admin/usuarios', label: 'Usuários', icon: Users },
];

const AdminLayout: React.FC = () => {
  const { userName, logout } = useApp();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex w-full bg-background">
      <aside className="surface-chrome w-60 shrink-0 border-r-2 flex flex-col">
        <div className="px-5 py-5 border-b-2 border-border">
          <p className="text-[10px] font-semibold tracking-[0.25em] uppercase text-muted-foreground">Admin</p>
          <h2 className="font-fredoka text-h3 font-bold text-ink">Aulateca</h2>
        </div>

        <nav className="flex-1 px-3 py-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `nav-item ${isActive ? 'nav-item-active' : ''}`
              }
            >
              <item.icon className="w-4 h-4 shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="px-3 py-3 border-t-2 border-border space-y-1">
          <button
            onClick={() => navigate('/')}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-button text-xs font-semibold text-muted-foreground hover:bg-secondary hover:text-ink transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Voltar ao app
          </button>
          <button
            onClick={logout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-button text-xs font-semibold text-muted-foreground hover:bg-danger/10 hover:text-danger-deep transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sair
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="surface-chrome h-16 border-b-2 flex items-center justify-between px-6 sticky top-0 z-10">
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
