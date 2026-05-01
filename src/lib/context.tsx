import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
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
  const [user, setUser] = useState<AuthUser | null>(() => authService.loadUser());
  const [isLoggedIn, setIsLoggedIn] = useState(() => !!localStorage.getItem('token'));
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

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
    authService.clearSession();
    setUser(null);
    setIsLoggedIn(false);
    setFavorites(new Set());
  }, []);

  const toggleFavorite = useCallback((id: string) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
        favoritesService.remove(id).catch(console.error);
      } else {
        next.add(id);
        favoritesService.add(id).catch(console.error);
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
