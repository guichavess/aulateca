/**
 * Freio de abuso compartilhado pelas Edge Functions públicas.
 *
 * As três portas abertas ao mundo — `criar-acesso`, `recuperar-senha` e
 * `entrar` — contam tentativas da mesma forma, na mesma tabela
 * (`public.access_attempts`, migration 015) e com a mesma janela. Este arquivo
 * é o dono dessa regra; antes ela morava só em `criar-acesso/conta.ts` e teria
 * sido copiada duas vezes.
 *
 * `_shared/` é a convenção do Supabase para código usado por mais de uma
 * function: o deploy de cada function carrega os arquivos que ela importa, e
 * `_shared` não vira uma function por si só (o underline é o que a exclui).
 *
 * Só regras puras aqui, como em `conta.ts`: nada de Deno, nada de Supabase. É
 * o que permite o vitest do projeto testar isto sem runtime Deno nenhum.
 */

/** Máximo de tentativas por janela. Ver `access_attempts` na migration 015. */
export const RATE_LIMIT_PER_IP = 10;
export const RATE_LIMIT_PER_EMAIL = 5;
export const RATE_LIMIT_WINDOW_MINUTES = 60;

export function rateLimitExceeded(counts: { byIp: number; byEmail: number }): boolean {
  return counts.byIp >= RATE_LIMIT_PER_IP || counts.byEmail >= RATE_LIMIT_PER_EMAIL;
}

/** Início da janela do rate limit, em ISO, para a query em `access_attempts`. */
export function rateLimitWindowStart(now: Date = new Date()): string {
  return new Date(now.getTime() - RATE_LIMIT_WINDOW_MINUTES * 60_000).toISOString();
}

/** Mesmo tratamento do trigger `cakto_normalize_entitlement` (011:130). */
export function normalizeEmail(value: unknown): string {
  return typeof value === 'string' ? value.trim().toLowerCase() : '';
}

/** Validação de formato suficiente para o que fazemos: barra lixo antes de a
 *  tentativa custar uma consulta ao banco. */
export function isEmailShaped(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
}

/**
 * Hash do IP para `access_attempts`. O IP em claro é dado pessoal (LGPD, art.
 * 5º, I) e não acrescenta nada: para contar tentativas, o hash serve igual.
 */
export async function hashIp(ip: string, salt: string): Promise<string> {
  const data = new TextEncoder().encode(`${salt}:${ip}`);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * O IP do cliente segundo a borda do Supabase. O primeiro item de
 * `x-forwarded-for` é quem chamou; o resto são os proxies do caminho.
 */
export function clientIp(headers: Headers): string {
  return (headers.get('x-forwarded-for') ?? '').split(',')[0].trim() || 'desconhecido';
}
