/**
 * Regras puras da criação de acesso — sem I/O, sem Deno, sem Supabase.
 *
 * Mesma separação que já deu certo no webhook (`cakto-webhook/cakto.ts`): o que
 * decide fica aqui e é testado pelo vitest do projeto; o `index.ts` ao lado só
 * faz I/O.
 *
 * ⚠️  ESPELHO DE `src/lib/password.ts`.
 * A política de senha existe nos dois lugares de propósito: o cliente valida
 * para dar feedback enquanto a pessoa digita, o servidor valida porque é o que
 * vale (o cliente é contornável chamando a API direto). As duas listas —
 * COMMON e SEQUENCES — precisam ser mantidas em sincronia; é dívida assumida e
 * anotada nos dois arquivos, coberta pelos mesmos casos de teste dos dois lados.
 * Este arquivo roda em Deno e aquele em Vite: não dá para importar um do outro.
 */

import { isEmailShaped, normalizeEmail } from '../_shared/rateLimit.ts';

/**
 * O freio de abuso mudou de casa: agora mora em `../_shared/rateLimit.ts`,
 * porque `recuperar-senha` e `entrar` contam tentativas na mesma tabela e com
 * a mesma janela. Fica reexportado aqui para nenhum import existente quebrar —
 * o `index.ts` ao lado e os testes continuam pedindo tudo a `conta.ts`.
 */
export {
  hashIp,
  isEmailShaped,
  normalizeEmail,
  rateLimitExceeded,
  rateLimitWindowStart,
  RATE_LIMIT_PER_EMAIL,
  RATE_LIMIT_PER_IP,
  RATE_LIMIT_WINDOW_MINUTES,
} from '../_shared/rateLimit.ts';

export const PASSWORD_MIN_LENGTH = 10;

const COMMON = new Set([
  '123456', '1234567', '12345678', '123456789', '1234567890',
  'senha123', 'senha1234', 'password', 'password1', 'password123',
  'qwerty', 'qwerty123', 'abc123456', 'iloveyou', 'admin123',
  'professor', 'professor123', 'aulateca', 'aulateca123', 'escola123',
  'brasil123', 'flamengo', 'corinthians', 'palmeiras', 'saopaulo',
]);

const SEQUENCES = ['abcdefghijklmnopqrstuvwxyz', '01234567890', 'qwertyuiop', 'asdfghjkl', 'zxcvbnm'];

function hasLongSequence(value: string): boolean {
  const lower = value.toLowerCase();
  for (const seq of SEQUENCES) {
    const reversed = [...seq].reverse().join('');
    for (const source of [seq, reversed]) {
      for (let i = 0; i + 4 <= source.length; i++) {
        if (lower.includes(source.slice(i, i + 4))) return true;
      }
    }
  }
  return false;
}

function hasRepetition(value: string): boolean {
  return /(.)\1{3,}/.test(value);
}

export interface PasswordContext {
  email?: string;
  name?: string;
}

function containsPersonalData(password: string, context?: PasswordContext): boolean {
  const lower = password.toLowerCase();
  const candidates: string[] = [];

  if (context?.email) candidates.push(context.email.split('@')[0]);
  if (context?.name) candidates.push(...context.name.split(/\s+/));

  return candidates
    .map((c) => c.toLowerCase().replace(/[^a-z0-9]/g, ''))
    .filter((c) => c.length >= 4)
    .some((c) => lower.includes(c));
}

/**
 * Rótulos das regras que a senha ainda não cumpre. Vazio = aceita.
 * Os rótulos são idênticos aos do cliente para a UI poder repeti-los sem
 * traduzir nada.
 */
export function passwordProblems(password: string, context?: PasswordContext): string[] {
  const normalized = password.trim();
  const problems: string[] = [];

  if (normalized.length < PASSWORD_MIN_LENGTH) {
    problems.push(`Pelo menos ${PASSWORD_MIN_LENGTH} caracteres`);
  }
  if (!/[a-z]/.test(normalized) || !/[A-Z]/.test(normalized)) {
    problems.push('Letras maiúsculas e minúsculas');
  }
  if (!/[0-9]/.test(normalized) && !/[^A-Za-z0-9]/.test(normalized)) {
    problems.push('Um número ou símbolo');
  }
  if (
    normalized.length === 0 ||
    COMMON.has(normalized.toLowerCase()) ||
    hasLongSequence(normalized) ||
    hasRepetition(normalized)
  ) {
    problems.push('Não é uma senha óbvia ou sequência de teclado');
  }
  if (normalized.length === 0 || containsPersonalData(normalized, context)) {
    problems.push('Não contém seu nome nem seu e-mail');
  }

  return problems;
}

export type UserRole = 'PROFESSOR' | 'PAI_MAE' | 'TERAPEUTA';

/**
 * Mesmo mapa de `src/services/auth.service.ts:17`. Qualquer coisa fora dele
 * vira PROFESSOR — inclusive uma tentativa de mandar 'ADMIN'. A guarda do banco
 * (`self_assignable_role`, migration 006) continua sendo a rede de segurança;
 * esta é a primeira barreira.
 */
export function resolveRole(roleKey: unknown): UserRole {
  const map: Record<string, UserRole> = {
    teacher: 'PROFESSOR',
    parent: 'PAI_MAE',
    therapist: 'TERAPEUTA',
  };
  return (typeof roleKey === 'string' && map[roleKey]) || 'PROFESSOR';
}

export interface EntitlementRow {
  status: string;
  expires_at: string | null;
}

/**
 * Mesma regra de `isEntitlementActive` (src/services/access.service.ts:45) e de
 * `has_active_access()` (011:210). `canceled` com data futura ainda vale: o
 * período corrente foi pago, cortar antes seria calote nosso.
 */
export function isEntitlementActive(e: EntitlementRow, now: Date = new Date()): boolean {
  const naoVenceu = !e.expires_at || new Date(e.expires_at) > now;
  if (e.status === 'active') return naoVenceu;
  if (e.status === 'canceled') return !!e.expires_at && new Date(e.expires_at) > now;
  return false;
}

export function hasActiveEntitlement(rows: EntitlementRow[], now: Date = new Date()): boolean {
  return rows.some((e) => isEntitlementActive(e, now));
}

export interface ParsedRequest {
  email: string;
  password: string;
  name: string;
  role: UserRole;
}

export type ParseResult =
  | { ok: true; value: ParsedRequest }
  | { ok: false; code: 'dados_invalidos' | 'senha_fraca'; problems: string[] };

/**
 * Lê e valida o corpo do POST. O nome é opcional: se vier vazio, o trigger
 * `handle_new_user` (011:166) usa a parte do e-mail antes do @, então não vale
 * a pena travar a criação de acesso de quem acabou de pagar por causa disso.
 */
export function parseRequest(body: unknown, now: Date = new Date()): ParseResult {
  const raw = (body ?? {}) as Record<string, unknown>;
  const email = normalizeEmail(raw.email);
  const password = typeof raw.password === 'string' ? raw.password : '';
  const name = typeof raw.name === 'string' ? raw.name.trim() : '';

  if (!isEmailShaped(email)) {
    return { ok: false, code: 'dados_invalidos', problems: ['Informe o e-mail usado na compra.'] };
  }

  const problems = passwordProblems(password, { email, name });
  if (problems.length > 0) {
    return { ok: false, code: 'senha_fraca', problems };
  }

  void now; // assinatura estável para os testes; a validação não depende de tempo
  return { ok: true, value: { email, password, name, role: resolveRole(raw.role) } };
}

/**
 * Erro do `auth.admin.createUser` que significa "esse e-mail já tem conta".
 * O Supabase não expõe um código estável para isso, então a checagem é pela
 * mensagem — e por isso é uma função só, testável, em vez de um `includes`
 * solto no meio do fluxo.
 */
export function isAlreadyRegistered(message: string | undefined | null): boolean {
  if (!message) return false;
  const m = message.toLowerCase();
  return (
    m.includes('already registered') ||
    m.includes('already been registered') ||
    m.includes('user already exists') ||
    m.includes('email address is already')
  );
}
