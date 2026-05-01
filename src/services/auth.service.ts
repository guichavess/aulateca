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

    const profile = await authService.fetchProfile(data.user.id);
    return {
      token: data.session!.access_token,
      user: profile,
    };
  },

  async register(name: string, email: string, password: string, roleKey: string): Promise<{ token: string; user: AuthUser }> {
    const role = ROLE_MAP[roleKey] ?? 'PROFESSOR';
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name, role } },
    });
    if (error) throw new Error(error.message);
    if (!data.session) throw new Error('Verifique seu e-mail para confirmar o cadastro.');

    const profile = await authService.fetchProfile(data.user!.id);
    return {
      token: data.session.access_token,
      user: profile,
    };
  },

  async fetchProfile(userId: string): Promise<AuthUser> {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, name, role, avatar_url')
      .eq('id', userId)
      .single();

    if (error || !data) throw new Error('Perfil não encontrado');

    return {
      id: data.id,
      name: data.name,
      email: '',
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
