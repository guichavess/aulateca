import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { authService, type AuthUser } from '@/services/auth.service';
import { favoritesService } from '@/services/favorites.service';

interface AppState {
  isLoggedIn: boolean;
  user: AuthUser | null;
  userName: string;
  favorites: Set<string>;
  login: (token: string, user: AuthUser) => void;
  logout: () => void;
  toggleFavorite: (id: string) => void;
  isFavorite: (id: string) => boolean;
}

const AppContext = createContext<AppState | null>(null);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Estado inicial otimista a partir do localStorage para evitar flash de tela de login;
  // a validação real acontece no useEffect abaixo e corrige se a sessão estiver inválida.
  const [user, setUser] = useState<AuthUser | null>(() => authService.loadUser());
  const [isLoggedIn, setIsLoggedIn] = useState(() => !!localStorage.getItem('token'));
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  // Confirma a sessão com o Supabase e mantém o token local em sync com refreshes.
  useEffect(() => {
    let cancelled = false;

    supabase.auth.getSession().then(({ data }) => {
      if (cancelled) return;
      const session = data.session;
      if (!session) {
        // Tinha token cached mas o Supabase não reconhece mais — limpa.
        if (localStorage.getItem('token')) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
        setUser(null);
        setIsLoggedIn(false);
      } else {
        // Supabase pode ter refrescado o token entre sessões; sincroniza.
        localStorage.setItem('token', session.access_token);
        setIsLoggedIn(true);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        setIsLoggedIn(false);
        setFavorites(new Set());
        return;
      }
      if (session && (event === 'TOKEN_REFRESHED' || event === 'SIGNED_IN' || event === 'USER_UPDATED')) {
        localStorage.setItem('token', session.access_token);
        setIsLoggedIn(true);
      }
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, []);

  // Carrega favoritos do backend quando o usuário estiver autenticado
  useEffect(() => {
    if (!isLoggedIn) return;
    favoritesService.fetchAll()
      .then((ids) => setFavorites(new Set(ids)))
      .catch(() => {/* token expirado ou backend offline — ignora */});
  }, [isLoggedIn]);

  const login = useCallback((token: string, userData: AuthUser) => {
    authService.saveSession(token, userData);
    setUser(userData);
    setIsLoggedIn(true);
  }, []);

  const logout = useCallback(() => {
    // clearSession chama supabase.auth.signOut() → listener acima reage com SIGNED_OUT.
    authService.clearSession();
    setUser(null);
    setIsLoggedIn(false);
    setFavorites(new Set());
  }, []);

  // Heurística: UUID v4 tem 36 chars com hifens. IDs mockados de src/lib/data.ts
  // são strings curtas tipo '1', '2'. Para a demo, IDs mock NÃO vão para o
  // Supabase (a FK falharia) — ficam apenas no estado local.
  const isPersistableId = (id: string) => id.length >= 32 && id.includes('-');

  const toggleFavorite = useCallback((id: string) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      const wasFavorite = next.has(id);
      if (wasFavorite) {
        next.delete(id);
        if (isPersistableId(id)) {
          favoritesService.remove(id).catch((err) => {
            console.error(err);
            // Reverte o otimismo se o servidor recusou.
            setFavorites((cur) => new Set(cur).add(id));
          });
        }
      } else {
        next.add(id);
        if (isPersistableId(id)) {
          favoritesService.add(id).catch((err) => {
            console.error(err);
            setFavorites((cur) => {
              const reverted = new Set(cur);
              reverted.delete(id);
              return reverted;
            });
          });
        }
      }
      return next;
    });
  }, []);

  const isFavorite = useCallback((id: string) => favorites.has(id), [favorites]);

  const userName = user?.name ?? '';

  return (
    <AppContext.Provider value={{ isLoggedIn, user, userName, favorites, login, logout, toggleFavorite, isFavorite }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
};
