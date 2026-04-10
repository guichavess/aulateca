import React, { createContext, useContext, useState, useCallback } from 'react';

interface AppState {
  isLoggedIn: boolean;
  userName: string;
  favorites: Set<string>;
  login: (name?: string) => void;
  logout: () => void;
  toggleFavorite: (id: string) => void;
  isFavorite: (id: string) => boolean;
}

const AppContext = createContext<AppState | null>(null);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(() => !!localStorage.getItem('userName'));
  const [userName, setUserName] = useState(() => localStorage.getItem('userName') || '');
  const [favorites, setFavorites] = useState<Set<string>>(new Set(['2', '4', '8']));

  const login = useCallback((name?: string) => {
    const n = name || '';
    setUserName(n);
    if (n) localStorage.setItem('userName', n);
    setIsLoggedIn(true);
  }, []);
  const logout = useCallback(() => {
    setIsLoggedIn(false);
    setUserName('');
    localStorage.removeItem('userName');
  }, []);
  const toggleFavorite = useCallback((id: string) => {
    setFavorites(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }, []);
  const isFavorite = useCallback((id: string) => favorites.has(id), [favorites]);

  return (
    <AppContext.Provider value={{ isLoggedIn, userName, favorites, login, logout, toggleFavorite, isFavorite }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
};
