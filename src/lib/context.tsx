import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { authService, type AuthUser } from '@/services/auth.service';
import { favoritesService } from '@/services/favorites.service';

interface AppState {
  isLoggedIn: boolean;
  user: AuthUser | null;
  userName: string;
  favorites: Set<string>;
  /**
   * Ligada enquanto a sessão veio de um link de recuperação de senha.
   *
   * Com `flowType: 'pkce'` e `detectSessionInUrl`, abrir o link do e-mail
   * LOGA a pessoa antes de ela digitar qualquer coisa. Sem esta flag, ela cairia
   * no app com a senha antiga e nunca veria o formulário que foi buscar.
   */
  isRecoveringPassword: boolean;
  /** Chamada pela tela de redefinição depois de trocar a senha com sucesso. */
  finishPasswordRecovery: () => void;
  login: (token: string, user: AuthUser) => void;
  logout: () => void;
  toggleFavorite: (id: string) => void;
  isFavorite: (id: string) => boolean;
  /** Persiste alterações do perfil e sincroniza estado + localStorage. */
  updateProfile: (changes: { name?: string; avatarUrl?: string | null }) => Promise<void>;
}

const AppContext = createContext<AppState | null>(null);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Estado inicial otimista a partir do localStorage para evitar flash de tela de login;
  // a validação real acontece no useEffect abaixo e corrige se a sessão estiver inválida.
  const [user, setUser] = useState<AuthUser | null>(() => authService.loadUser());
  const [isLoggedIn, setIsLoggedIn] = useState(() => !!localStorage.getItem('token'));
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [isRecoveringPassword, setIsRecoveringPassword] = useState(false);

  // login() já resolve o perfil e seta o user de forma síncrona antes do evento
  // SIGNED_IN correspondente chegar; esta flag evita refetch duplicado nesse caso.
  // Sessões que nascem fora do formulário (link de confirmação de e-mail, link
  // mágico de recuperação) não passam por login(), então precisam que o
  // listener abaixo busque o perfil sozinho.
  const suppressNextSignInFetch = useRef(false);

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
        setIsRecoveringPassword(false);
        return;
      }

      // O link de recuperação já criou a sessão. A flag segura a pessoa em
      // /redefinir-senha até a senha nova ser gravada — quem chegou aqui não
      // lembra a senha antiga, e jogá-la no app resolveria nada.
      if (event === 'PASSWORD_RECOVERY') {
        setIsRecoveringPassword(true);
        // A sessão do link é a credencial que autoriza o updateUser da tela
        // seguinte; sem guardar o token aqui, o app dependeria da corrida com o
        // getSession() do boot para reconhecer que existe sessão.
        if (session) {
          localStorage.setItem('token', session.access_token);
          setIsLoggedIn(true);
        }
      }
      if (session && (event === 'TOKEN_REFRESHED' || event === 'SIGNED_IN' || event === 'USER_UPDATED')) {
        localStorage.setItem('token', session.access_token);
        setIsLoggedIn(true);

        if (event === 'SIGNED_IN') {
          if (suppressNextSignInFetch.current) {
            suppressNextSignInFetch.current = false;
          } else {
            // Sessão criada por link (confirmação de e-mail, recuperação) —
            // login() não foi chamado, então o perfil ainda não está no estado.
            authService
              .fetchProfile(session.user.id, session.user.email ?? undefined)
              .then((profile) => {
                authService.saveSession(session.access_token, profile);
                setUser(profile);
              })
              .catch(() => {/* trigger do banco pode não ter criado o profile ainda */});
          }
        }
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
    suppressNextSignInFetch.current = true;
    authService.saveSession(token, userData);
    setUser(userData);
    setIsLoggedIn(true);
  }, []);

  const finishPasswordRecovery = useCallback(() => setIsRecoveringPassword(false), []);

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

  const updateProfile = useCallback(async (changes: { name?: string; avatarUrl?: string | null }) => {
    if (!user) throw new Error('Sem sessão ativa');
    await authService.updateProfile(user.id, changes);
    const next: AuthUser = {
      ...user,
      ...(changes.name !== undefined ? { name: changes.name } : {}),
      // null = "remover foto"; o AuthUser usa undefined para ausência.
      ...(changes.avatarUrl !== undefined ? { avatarUrl: changes.avatarUrl ?? undefined } : {}),
    };
    setUser(next);
    // O user cacheado alimenta o estado otimista no boot; sem isto o nome
    // antigo voltaria ao recarregar a página.
    const token = localStorage.getItem('token');
    if (token) authService.saveSession(token, next);
  }, [user]);

  const userName = user?.name ?? '';

  return (
    <AppContext.Provider value={{ isLoggedIn, user, userName, favorites, isRecoveringPassword, finishPasswordRecovery, login, logout, toggleFavorite, isFavorite, updateProfile }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
};
