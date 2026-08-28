import { supabase } from '@/integrations/supabase/client';
import { isPasswordAcceptable, passwordProblems } from '@/lib/password';
import { AuthErrorPtBr, CreateAccessError, traduzErroAuth } from '@/lib/authErrors';

export type UserRole = 'PROFESSOR' | 'PAI_MAE' | 'TERAPEUTA' | 'ADMIN';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
}

const AVATAR_MIME = ['image/jpeg', 'image/png', 'image/webp'];
const AVATAR_MAX_BYTES = 2 * 1024 * 1024;

export const authService = {
  async login(email: string, password: string): Promise<{ token: string; user: AuthUser }> {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw traduzErroAuth(error);

    const profile = await authService.fetchProfile(data.user.id, data.user.email ?? '');
    return {
      token: data.session!.access_token,
      user: profile,
    };
  },

  /**
   * Cria a conta de quem já comprou na Cakto e entra com ela.
   *
   * Não existe mais `register()`: o signup público do Supabase está desligado e
   * a única porta é a Edge Function `criar-acesso`, que confere o entitlement
   * antes de criar o usuário. Chamar `supabase.auth.signUp` daqui voltaria a
   * dar conta grátis para qualquer um — foi o buraco que esta leva fechou.
   *
   * A senha é validada aqui também, e não só na tela: o serviço é o último
   * ponto nosso antes da rede, e a Edge Function repete a mesma política do
   * outro lado (ver `supabase/functions/criar-acesso/conta.ts`).
   */
  async createAccess(input: {
    name: string;
    email: string;
    password: string;
    roleKey: string;
  }): Promise<{ token: string; user: AuthUser }> {
    const { name, email, password, roleKey } = input;
    if (!isPasswordAcceptable(password, { email, name })) {
      throw new Error('Escolha uma senha mais forte, seguindo os requisitos indicados.');
    }

    // Sem o try/catch, queda de rede aqui chega na tela como
    // "TypeError: Failed to fetch" — em inglês e sem dizer o que fazer.
    let resposta: Response;
    try {
      resposta = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/criar-acesso`, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          // A função é pública (`--no-verify-jwt`), mas o gateway das Edge
          // Functions exige a anon key no header para deixar a chamada passar.
          apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ name, email, password, role: roleKey }),
      });
    } catch {
      throw new AuthErrorPtBr('sem_conexao');
    }

    const corpo = await resposta.json().catch(() => ({}));

    if (!resposta.ok) {
      throw new CreateAccessError(corpo?.code ?? 'erro_interno', corpo?.problems ?? []);
    }

    // A conta nasce confirmada (`email_confirm: true` na função), então dá para
    // entrar direto — a titularidade do e-mail já foi provada no pagamento.
    const { token, user } = await authService.login(email, password);
    return { token, user };
  },

  /**
   * Dispara o e-mail de recuperação.
   *
   * A UI responde igual para e-mail que existe e para e-mail que não existe.
   * Aqui a proteção contra enumeração é barata e não custa UX — diferente do
   * `sem_compra` da criação de acesso, onde a resposta genérica deixaria o
   * comprador travado sem entender o motivo.
   */
  async requestPasswordReset(email: string): Promise<void> {
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/redefinir-senha`,
    });
    // Erro é logado, não mostrado: a tela precisa dizer a mesma coisa nos dois
    // casos, senão a mensagem de erro vira o oráculo que tentamos evitar.
    if (error) console.error('resetPasswordForEmail falhou', error);
  },

  /**
   * Grava a senha nova. Só funciona com a sessão que o link de recuperação
   * criou — é ela que prova que a pessoa tem acesso à caixa de e-mail.
   */
  async completePasswordReset(newPassword: string, email?: string): Promise<void> {
    const problems = passwordProblems(newPassword, { email });
    if (problems.length > 0) {
      throw new Error(`A senha precisa atender: ${problems.join('; ').toLowerCase()}`);
    }
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) throw traduzErroAuth(error);
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

  // Atualiza os campos editáveis do perfil. Email e role NÃO entram aqui:
  // email mora em auth.users e tem fluxo próprio (changeEmail), e role é
  // escalação de privilégio — a migration 006 bloqueia isso no banco.
  async updateProfile(
    userId: string,
    changes: { name?: string; avatarUrl?: string | null },
  ): Promise<void> {
    // Tipado a partir do schema gerado: `Record<string, ...>` é recusado pelo
    // update() do supabase-js (índice de string vira `never` no Insert type).
    const payload: { name?: string; avatar_url?: string | null } = {};
    if (changes.name !== undefined) payload.name = changes.name;
    if (changes.avatarUrl !== undefined) payload.avatar_url = changes.avatarUrl;
    if (Object.keys(payload).length === 0) return;

    const { error } = await supabase.from('profiles').update(payload).eq('id', userId);
    if (error) throw traduzErroAuth(error);
  },

  /**
   * Confere a senha atual antes de uma operação sensível.
   *
   * O Supabase permite trocar e-mail e senha só com a sessão válida — ou seja,
   * quem pegasse um notebook destravado assumiria a conta em dois cliques.
   * Reautenticar fecha essa janela. `signInWithPassword` com o próprio e-mail
   * apenas revalida a credencial; a sessão corrente segue a mesma.
   */
  async verifyPassword(email: string, password: string): Promise<void> {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw new AuthErrorPtBr('senha_atual_incorreta');
  },

  /**
   * Troca de e-mail. Com "Secure email change" ligado no projeto (padrão), o
   * Supabase envia confirmação para o endereço ANTIGO e para o NOVO, e só
   * efetiva com os dois cliques — por isso a troca não aparece na hora.
   * É a proteção contra sequestro de conta por e-mail.
   */
  async changeEmail(currentPassword: string, currentEmail: string, newEmail: string): Promise<void> {
    await authService.verifyPassword(currentEmail, currentPassword);
    const { error } = await supabase.auth.updateUser({ email: newEmail });
    if (error) throw traduzErroAuth(error);
  },

  async changePassword(currentPassword: string, email: string, newPassword: string): Promise<void> {
    // A política é conferida aqui também, e não só na tela: o serviço é o
    // último ponto nosso antes do Supabase, e é o que garante a regra caso
    // outra tela passe a chamar isto.
    const problems = passwordProblems(newPassword, { email });
    if (problems.length > 0) {
      throw new Error(`A senha precisa atender: ${problems.join('; ').toLowerCase()}`);
    }
    await authService.verifyPassword(email, currentPassword);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) throw traduzErroAuth(error);
  },

  /**
   * Envia a foto para o bucket `avatars` e devolve a URL pública.
   *
   * O caminho começa com o uid porque as policies da migration 007 amarram a
   * pasta raiz ao auth.uid() — é o que impede sobrescrever a foto de outro.
   * As validações abaixo são de conveniência: o limite que vale é o do bucket.
   */
  async uploadAvatar(userId: string, file: File): Promise<string> {
    if (!AVATAR_MIME.includes(file.type)) {
      throw new Error('Formato não aceito. Use JPG, PNG ou WebP.');
    }
    if (file.size > AVATAR_MAX_BYTES) {
      throw new Error('A imagem precisa ter até 2 MB.');
    }

    const ext = file.type === 'image/png' ? 'png' : file.type === 'image/webp' ? 'webp' : 'jpg';
    // Nome novo a cada envio: sobrescrever o mesmo arquivo deixaria a foto
    // antiga presa no cache do navegador e da CDN.
    const path = `${userId}/${Date.now()}.${ext}`;

    const { error } = await supabase.storage
      .from('avatars')
      .upload(path, file, { contentType: file.type, upsert: false });
    if (error) throw traduzErroAuth(error);

    const { data } = supabase.storage.from('avatars').getPublicUrl(path);
    return data.publicUrl;
  },

  /** Remove o arquivo anterior, se ele for nosso. Falha aqui não é fatal. */
  async removeAvatarFile(url: string | undefined, userId: string): Promise<void> {
    if (!url || !url.includes('/avatars/')) return;
    const path = url.split('/avatars/')[1]?.split('?')[0];
    if (!path || !path.startsWith(`${userId}/`)) return;
    await supabase.storage.from('avatars').remove([path]);
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
