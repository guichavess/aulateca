import { supabase } from '@/integrations/supabase/client';

export type UserRole = 'PROFESSOR' | 'PAI_MAE' | 'TERAPEUTA';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
}

const ROLE_MAP: Record<string, UserRole> = {
  teacher: 'PROFESSOR',
  parent: 'PAI_MAE',
  therapist: 'TERAPEUTA',
};

export const authService = {
  async login(email: string, password: string): Promise<{ token: string; user: AuthUser }> {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw new Error(error.message);

    const profile = await authService.fetchProfile(data.user.id, data.user.email ?? '');
    return {
      token: data.session!.access_token,
      user: profile,
    };
  },

  async register(name: string, email: string, password: string, roleKey: string): Promise<
    | { status: 'signed-in'; token: string; user: AuthUser }
    | { status: 'needs-confirmation'; email: string }
  > {
    const role = ROLE_MAP[roleKey] ?? 'PROFESSOR';
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name, role } },
    });
    if (error) throw new Error(error.message);

    // Sem sessão = o projeto exige confirmação por e-mail. O cadastro foi feito;
    // sinaliza o estado para a UI tratar sem mostrar erro vermelho.
    if (!data.session || !data.user) {
      return { status: 'needs-confirmation', email };
    }

    const profile = await authService.fetchProfile(data.user.id, data.user.email ?? email);
    return {
      status: 'signed-in',
      token: data.session.access_token,
      user: profile,
    };
  },

  // O email mora em auth.users (gerenciado pelo Supabase), não em public.profiles.
  // Aceita o email explícito (de signIn/signUp) ou cai no getUser() como fallback.
  async fetchProfile(userId: string, email?: string): Promise<AuthUser> {
    let resolvedEmail = email;
    if (resolvedEmail === undefined) {
      const { data: authData } = await supabase.auth.getUser();
      resolvedEmail = authData.user?.email ?? '';
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('id, name, role, avatar_url')
      .eq('id', userId)
      .single();

    if (error || !data) throw new Error('Perfil não encontrado');

    return {
      id: data.id,
      name: data.name,
      email: resolvedEmail,
      role: data.role as UserRole,
      avatarUrl: data.avatar_url ?? undefined,
    };
  },

  saveSession(token: string, user: AuthUser) {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
  },

  clearSession() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    supabase.auth.signOut();
  },

  loadUser(): AuthUser | null {
    const raw = localStorage.getItem('user');
    if (!raw) return null;
    try { return JSON.parse(raw) as AuthUser; } catch { return null; }
  },
};
