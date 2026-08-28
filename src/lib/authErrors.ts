/**
 * Cópia em português de todo erro de autenticação — dono único.
 *
 * O `supabase-js` devolve mensagem em inglês ("Invalid login credentials"), e
 * as telas mostravam o que chegasse. Traduzir em cada `catch` espalharia a
 * cópia por seis arquivos e faria o mesmo estrago do `authErrorClass`: uma
 * tela corrigida, as outras não. Aqui a tradução acontece na fronteira do
 * serviço e todas as telas herdam de graça.
 *
 * O padrão é o mesmo que a Edge Function `criar-acesso` já usa: o servidor
 * manda um CÓDIGO estável, o cliente é dono do texto.
 */

export type AuthErrorCode =
  | 'credenciais_invalidas'
  | 'email_nao_confirmado'
  | 'muitas_tentativas'
  | 'senha_igual_a_anterior'
  | 'senha_fraca'
  | 'email_ja_usado'
  | 'email_invalido'
  | 'senha_atual_incorreta'
  | 'sessao_expirada'
  | 'sem_conexao'
  | 'erro_interno';

/** Para onde a tela manda a pessoa depois do erro. */
export type AuthErrorSugestao = 'login' | 'recuperar_senha';

interface AuthErrorCopy {
  message: string;
  sugestao?: AuthErrorSugestao;
}

const AUTH_ERROR_COPY: Record<AuthErrorCode, AuthErrorCopy> = {
  // Deliberadamente genérico: NÃO dizer "este e-mail não existe". A mensagem
  // que distingue e-mail errado de senha errada vira um oráculo de quais
  // contas existem — a mesma postura documentada no requestPasswordReset.
  credenciais_invalidas: {
    message: 'E-mail ou senha não conferem. Confira e tente de novo.',
    sugestao: 'recuperar_senha',
  },
  email_nao_confirmado: {
    message: 'Falta confirmar seu e-mail. Procure a mensagem que enviamos — vale olhar no spam.',
  },
  muitas_tentativas: {
    message: 'Muitas tentativas seguidas. Espere um pouquinho e tente de novo.',
  },
  senha_igual_a_anterior: {
    message: 'Essa é a mesma senha de antes. Escolha uma diferente.',
  },
  senha_fraca: {
    message: 'Essa senha é fácil demais de adivinhar. Siga os requisitos indicados.',
  },
  email_ja_usado: {
    message: 'Este e-mail já está em uso por outra conta.',
    sugestao: 'login',
  },
  email_invalido: {
    message: 'Esse endereço parece incompleto. Confira o e-mail.',
  },
  senha_atual_incorreta: {
    message: 'A senha atual não confere.',
  },
  sessao_expirada: {
    message: 'Sua sessão expirou. Entre de novo para continuar.',
    sugestao: 'login',
  },
  sem_conexao: {
    message: 'Não conseguimos falar com o servidor. Confira sua internet e tente de novo.',
  },
  erro_interno: {
    message: 'Algo saiu do lugar por aqui. Tente de novo em instantes.',
  },
};

/** Erro tipado: a tela reage ao `code`/`sugestao`, nunca ao texto. */
export class AuthErrorPtBr extends Error {
  readonly code: AuthErrorCode;
  readonly sugestao?: AuthErrorSugestao;

  constructor(code: AuthErrorCode) {
    const copy = AUTH_ERROR_COPY[code] ?? AUTH_ERROR_COPY.erro_interno;
    super(copy.message);
    this.name = 'AuthErrorPtBr';
    this.code = code;
    this.sugestao = copy.sugestao;
  }
}

/** `error.code` do AuthApiError (supabase-js ^2.99) → nosso código. */
const POR_CODIGO: Record<string, AuthErrorCode> = {
  invalid_credentials: 'credenciais_invalidas',
  email_not_confirmed: 'email_nao_confirmado',
  over_request_rate_limit: 'muitas_tentativas',
  over_email_send_rate_limit: 'muitas_tentativas',
  same_password: 'senha_igual_a_anterior',
  weak_password: 'senha_fraca',
  email_exists: 'email_ja_usado',
  user_already_exists: 'email_ja_usado',
  validation_failed: 'email_invalido',
  email_address_invalid: 'email_invalido',
  session_expired: 'sessao_expirada',
  session_not_found: 'sessao_expirada',
};

/**
 * Fallback por mensagem.
 *
 * Nem toda versão/rota do GoTrue traz `code` — o mesmo motivo que obriga o
 * `isAlreadyRegistered` da Edge Function a olhar o texto. É frágil por
 * natureza, então fica isolado aqui e coberto por teste: se o Supabase mudar
 * a frase, cai em `erro_interno` (em português) e não em inglês na tela.
 */
const POR_MENSAGEM: Array<[RegExp, AuthErrorCode]> = [
  [/invalid login credentials/i, 'credenciais_invalidas'],
  [/email not confirmed/i, 'email_nao_confirmado'],
  [/rate limit|too many requests/i, 'muitas_tentativas'],
  [/should be different from the old password|same as the old password/i, 'senha_igual_a_anterior'],
  [/password.*(weak|pwned|breach)|weak password/i, 'senha_fraca'],
  [/already registered|already been registered|user already exists|email address is already|email exists/i, 'email_ja_usado'],
  [/invalid email|unable to validate email|email address.*invalid/i, 'email_invalido'],
  [/(jwt|session).*(expired|missing|not found)|invalid refresh token/i, 'sessao_expirada'],
  [/failed to fetch|network|networkerror|load failed/i, 'sem_conexao'],
];

/** Traduz qualquer coisa lançada pelo Supabase num `AuthErrorPtBr`. */
export function traduzErroAuth(error: unknown): AuthErrorPtBr {
  if (error instanceof AuthErrorPtBr) return error;

  const bruto = error as { code?: unknown; status?: unknown; message?: unknown } | null;

  const code = typeof bruto?.code === 'string' ? POR_CODIGO[bruto.code] : undefined;
  if (code) return new AuthErrorPtBr(code);

  const message = typeof bruto?.message === 'string' ? bruto.message : '';
  const porMensagem = POR_MENSAGEM.find(([re]) => re.test(message));
  if (porMensagem) return new AuthErrorPtBr(porMensagem[1]);

  // O status é menos específico que a mensagem, então vem depois dela.
  const status = typeof bruto?.status === 'number' ? bruto.status : undefined;
  if (status === 429) return new AuthErrorPtBr('muitas_tentativas');
  if (status === 401 || status === 403) return new AuthErrorPtBr('sessao_expirada');

  return new AuthErrorPtBr('erro_interno');
}

/**
 * Códigos que a Edge Function `criar-acesso` devolve. O mapa de `roleKey` para
 * `UserRole` vive lá (`conta.ts`), não aqui: quem grava o papel é o servidor, e
 * duplicar a tradução no cliente só criaria uma segunda verdade.
 */
export type CreateAccessCode =
  | 'sem_compra'
  | 'conta_existe'
  | 'senha_fraca'
  | 'muitas_tentativas'
  | 'dados_invalidos'
  | 'erro_interno';

export const CREATE_ACCESS_MESSAGE: Record<CreateAccessCode, string> = {
  sem_compra:
    'Não encontramos uma compra ativa para este e-mail. Use o mesmo e-mail que você usou no pagamento.',
  conta_existe: 'Você já tem uma conta com este e-mail. Entre normalmente ou recupere a senha.',
  senha_fraca: 'Escolha uma senha mais forte, seguindo os requisitos indicados.',
  muitas_tentativas: 'Muitas tentativas seguidas. Espere alguns minutos e tente de novo.',
  dados_invalidos: 'Confira o e-mail informado.',
  erro_interno: 'Não foi possível criar seu acesso agora. Tente novamente em instantes.',
};

/** Erro tipado para a tela poder reagir ao caso (ex.: oferecer o login no 409). */
export class CreateAccessError extends Error {
  constructor(
    readonly code: CreateAccessCode,
    readonly problems: string[] = [],
  ) {
    super(CREATE_ACCESS_MESSAGE[code] ?? CREATE_ACCESS_MESSAGE.erro_interno);
    this.name = 'CreateAccessError';
  }
}
