/**
 * Política de senha do Aulateca — fonte única.
 *
 * Antes a regra estava espalhada e incoerente: o cadastro exigia `minLength=6`
 * no HTML e a troca de senha exigia 8 + composição. Regra dura só na troca não
 * protege nada, porque a conta nasce fraca e continua assim.
 *
 * O que o servidor garante (Supabase → Authentication → Password): comprimento
 * mínimo e checagem contra vazamentos (HaveIBeenPwned). O que está aqui é a
 * camada de UX — explica o motivo antes do usuário apanhar do erro. As duas
 * precisam existir: só o cliente qualquer um contorna chamando a API direto.
 *
 * ⚠️  ESPELHO DE `supabase/functions/criar-acesso/conta.ts`.
 * A criação de conta passou a ser feita por Edge Function (Deno), que não
 * consegue importar deste arquivo. A cópia de lá repete COMMON, SEQUENCES e as
 * cinco regras; mexeu aqui, mexa lá. `conta.test.ts` compara as duas saídas nos
 * mesmos casos e quebra se saírem de sincronia — o cenário ruim é o servidor
 * recusar a senha que esta tela acabou de aprovar com todos os checkmarks verdes.
 */

export const PASSWORD_MIN_LENGTH = 10;

export interface PasswordRule {
  id: string;
  label: string;
  ok: boolean;
}

/**
 * Senhas que aparecem no topo de qualquer vazamento, mais as variações
 * brasileiras que listas em inglês não pegam. É uma rede de segurança curta:
 * a checagem séria é a do HaveIBeenPwned, no servidor.
 */
const COMMON = new Set([
  '123456', '1234567', '12345678', '123456789', '1234567890',
  'senha123', 'senha1234', 'password', 'password1', 'password123',
  'qwerty', 'qwerty123', 'abc123456', 'iloveyou', 'admin123',
  'professor', 'professor123', 'aulateca', 'aulateca123', 'escola123',
  'brasil123', 'flamengo', 'corinthians', 'palmeiras', 'saopaulo',
]);

/** Sequências de teclado e de alfabeto usadas como recheio ("qwerty", "abcd"). */
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

/**
 * Trechos pessoais que não podem virar senha: o nome, e a parte do e-mail antes
 * do @. São o primeiro palpite de quem conhece a vítima — e numa escola, todo
 * mundo conhece.
 */
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

export interface PasswordContext {
  email?: string;
  name?: string;
}

/** Avalia a senha e devolve todas as regras, aprovadas ou não, na ordem de exibição. */
export function checkPassword(password: string, context?: PasswordContext): PasswordRule[] {
  const normalized = password.trim();

  return [
    {
      id: 'length',
      label: `Pelo menos ${PASSWORD_MIN_LENGTH} caracteres`,
      ok: normalized.length >= PASSWORD_MIN_LENGTH,
    },
    {
      id: 'letters',
      label: 'Letras maiúsculas e minúsculas',
      ok: /[a-z]/.test(normalized) && /[A-Z]/.test(normalized),
    },
    {
      id: 'number-or-symbol',
      label: 'Um número ou símbolo',
      ok: /[0-9]/.test(normalized) || /[^A-Za-z0-9]/.test(normalized),
    },
    {
      id: 'not-common',
      label: 'Não é uma senha óbvia ou sequência de teclado',
      ok:
        normalized.length > 0 &&
        !COMMON.has(normalized.toLowerCase()) &&
        !hasLongSequence(normalized) &&
        !hasRepetition(normalized),
    },
    {
      id: 'not-personal',
      label: 'Não contém seu nome nem seu e-mail',
      ok: normalized.length > 0 && !containsPersonalData(normalized, context),
    },
  ];
}

/** Rótulos das regras que ainda falham. Vazio = senha aceita. */
export function passwordProblems(password: string, context?: PasswordContext): string[] {
  return checkPassword(password, context)
    .filter((rule) => !rule.ok)
    .map((rule) => rule.label);
}

export function isPasswordAcceptable(password: string, context?: PasswordContext): boolean {
  return passwordProblems(password, context).length === 0;
}

/**
 * Força de 0 a 4, só para o medidor visual. Passar em todas as regras já
 * garante 3; o 4 exige comprimento real, que é o que de fato encarece o
 * ataque — mais do que qualquer exigência de composição.
 */
export function passwordStrength(password: string, context?: PasswordContext): {
  score: 0 | 1 | 2 | 3 | 4;
  label: string;
} {
  const passed = checkPassword(password, context).filter((r) => r.ok).length;

  if (!password) return { score: 0, label: '' };
  if (passed < 3) return { score: 1, label: 'Fraca' };
  if (passed < 5) return { score: 2, label: 'Razoável' };
  if (password.length >= 16) return { score: 4, label: 'Excelente' };
  return { score: 3, label: 'Boa' };
}
