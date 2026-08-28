import { describe, expect, it } from 'vitest';
import { AuthErrorPtBr, traduzErroAuth } from './authErrors';

/** Imita o AuthApiError do supabase-js: code + status + message. */
const erroSupabase = (partes: { code?: string; status?: number; message?: string }) =>
  Object.assign(new Error(partes.message ?? 'boom'), partes);

describe('traduzErroAuth', () => {
  it('traduz pelo code do AuthApiError', () => {
    const casos: Array<[string, string]> = [
      ['invalid_credentials', 'credenciais_invalidas'],
      ['email_not_confirmed', 'email_nao_confirmado'],
      ['over_request_rate_limit', 'muitas_tentativas'],
      ['same_password', 'senha_igual_a_anterior'],
      ['weak_password', 'senha_fraca'],
      ['email_exists', 'email_ja_usado'],
      ['email_address_invalid', 'email_invalido'],
      ['session_not_found', 'sessao_expirada'],
    ];
    for (const [code, esperado] of casos) {
      expect(traduzErroAuth(erroSupabase({ code })).code).toBe(esperado);
    }
  });

  // Nem toda rota do GoTrue devolve `code` — o fallback por mensagem é o que
  // impede o inglês de vazar nessas versões.
  it('traduz pela mensagem quando não há code', () => {
    const casos: Array<[string, string]> = [
      ['Invalid login credentials', 'credenciais_invalidas'],
      ['Email not confirmed', 'email_nao_confirmado'],
      ['Email rate limit exceeded', 'muitas_tentativas'],
      ['New password should be different from the old password', 'senha_igual_a_anterior'],
      ['Password is too weak', 'senha_fraca'],
      ['User already registered', 'email_ja_usado'],
      ['Unable to validate email address', 'email_invalido'],
      ['JWT expired', 'sessao_expirada'],
      ['Failed to fetch', 'sem_conexao'],
    ];
    for (const [message, esperado] of casos) {
      expect(traduzErroAuth(erroSupabase({ message })).code).toBe(esperado);
    }
  });

  it('usa o status como último recurso', () => {
    expect(traduzErroAuth(erroSupabase({ status: 429, message: 'nope' })).code).toBe(
      'muitas_tentativas',
    );
    expect(traduzErroAuth(erroSupabase({ status: 401, message: 'nope' })).code).toBe(
      'sessao_expirada',
    );
  });

  it('cai em erro_interno no desconhecido, ainda em português', () => {
    const erro = traduzErroAuth(erroSupabase({ message: 'Something odd happened' }));
    expect(erro.code).toBe('erro_interno');
    expect(erro.message).toMatch(/Tente de novo/);
  });

  it('preserva um AuthErrorPtBr já traduzido', () => {
    const original = new AuthErrorPtBr('senha_atual_incorreta');
    expect(traduzErroAuth(original)).toBe(original);
  });

  // Anti-enumeração: a mensagem não pode dizer se o e-mail existe.
  it('não revela existência de conta em credenciais_invalidas', () => {
    const { message } = new AuthErrorPtBr('credenciais_invalidas');
    expect(message).not.toMatch(/não existe|não encontrad|cadastrad/i);
    expect(message).toContain('E-mail ou senha não conferem');
  });

  it('oferece a recuperação de senha como saída do login errado', () => {
    expect(new AuthErrorPtBr('credenciais_invalidas').sugestao).toBe('recuperar_senha');
  });
});
