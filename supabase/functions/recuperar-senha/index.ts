/**
 * Dispara o e-mail de "esqueci minha senha" — com freio de abuso nosso.
 *
 * Antes, `authService.requestPasswordReset` chamava
 * `supabase.auth.resetPasswordForEmail` direto do navegador. O único freio era
 * o do GoTrue: existe, mas não é nosso, não é configurável e não deixa
 * registro que a gente consiga consultar. A migration 015 já tinha previsto o
 * tipo `recuperar_senha` em `access_attempts` — e ninguém gravava nele.
 *
 * ── A resposta é SEMPRE 200 ────────────────────────────────────────────────
 * Inclusive quando o freio barra, e inclusive quando dá erro. É a diferença
 * proposital para `criar-acesso`, que responde `403 sem_compra`: lá o oráculo
 * de enumeração é um trade-off aceito para não travar o comprador legítimo;
 * aqui a tela já responde igual para e-mail que existe e que não existe, e um
 * 429 visível entregaria de graça o mapa do próprio freio (quantas tentativas
 * cabem, e quando a janela vira).
 *
 * O freio age reduzindo o ENVIO, não a resposta: barrado, o e-mail não sai, e
 * quem está do outro lado não tem como distinguir isso de um envio feito.
 *
 * Deploy:
 *   supabase secrets set ACCESS_LINK_SECRET='<segredo longo>'
 *   supabase functions deploy recuperar-senha --no-verify-jwt
 */
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.4';
import {
  clientIp,
  hashIp,
  isEmailShaped,
  normalizeEmail,
  rateLimitExceeded,
  rateLimitWindowStart,
} from '../_shared/rateLimit.ts';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!;
// Mesmo sal de `criar-acesso`: as tentativas dos dois fluxos convivem na mesma
// tabela, e hash com sal diferente seria a mesma pessoa contada duas vezes.
const IP_SALT = Deno.env.get('ACCESS_LINK_SECRET') ?? '';

// A página `/recuperar-senha` é pública e chamada pelo navegador.
const CORS = {
  'access-control-allow-origin': '*',
  'access-control-allow-headers': 'authorization, x-client-info, apikey, content-type',
  'access-control-allow-methods': 'POST, OPTIONS',
};

const json = (status: number, body: Record<string, unknown>) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json', ...CORS },
  });

/** A resposta única. Existe como constante para ninguém, mexendo aqui depois,
 *  inventar um caso especial e reabrir o oráculo sem perceber. */
const RESPOSTA_UNICA = () => json(200, { ok: true });

/**
 * Só deixa passar um destino que seja a nossa própria tela de redefinição.
 *
 * A lista de URLs permitidas do projeto (Authentication → URL Configuration) é
 * quem realmente decide — o GoTrue recusa o resto. Isto aqui é o cinto por
 * cima do suspensório, e mantém o dev local funcionando sem precisar de uma
 * variável de ambiente por origem.
 */
function redirecionamentoAceito(valor: unknown): string | undefined {
  if (typeof valor !== 'string' || valor === '') return undefined;
  try {
    const url = new URL(valor);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return undefined;
    if (url.pathname !== '/redefinir-senha') return undefined;
    return url.toString();
  } catch {
    return undefined;
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });
  if (req.method !== 'POST') return json(405, { ok: false, error: 'use POST' });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    // Nem o corpo inválido ganha resposta própria: qualquer diferença de
    // tratamento vira sinal para quem está sondando.
    return RESPOSTA_UNICA();
  }

  const raw = (body ?? {}) as Record<string, unknown>;
  const email = normalizeEmail(raw.email);
  const redirectTo = redirecionamentoAceito(raw.redirectTo);
  if (!isEmailShaped(email)) return RESPOSTA_UNICA();

  const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  // ── 1. Rate limit ────────────────────────────────────────────────────────
  const ipHash = IP_SALT ? await hashIp(clientIp(req.headers), IP_SALT) : null;
  const desde = rateLimitWindowStart();

  const [porIp, porEmail] = await Promise.all([
    ipHash
      ? admin
          .from('access_attempts')
          .select('id', { count: 'exact', head: true })
          .eq('ip_hash', ipHash)
          .eq('kind', 'recuperar_senha')
          .gte('created_at', desde)
      : Promise.resolve({ count: 0, error: null }),
    admin
      .from('access_attempts')
      .select('id', { count: 'exact', head: true })
      .eq('email', email)
      .eq('kind', 'recuperar_senha')
      .gte('created_at', desde),
  ]);

  // Falha ao CONTAR não pode travar quem esqueceu a senha de verdade: registra
  // e segue, como em `criar-acesso`. O freio é defesa contra abuso, não
  // pré-requisito do suporte.
  if (porIp.error) console.error('rate limit por IP falhou', porIp.error);
  if (porEmail.error) console.error('rate limit por e-mail falhou', porEmail.error);

  const barrado = rateLimitExceeded({ byIp: porIp.count ?? 0, byEmail: porEmail.count ?? 0 });

  // A tentativa entra ANTES do resultado, barrada ou não: o que interessa ao
  // freio é quantas vezes bateram na porta.
  const { error: attemptError } = await admin
    .from('access_attempts')
    .insert({ kind: 'recuperar_senha', email, ip_hash: ipHash });
  if (attemptError) console.error('falha ao registrar tentativa', attemptError);

  if (barrado) return RESPOSTA_UNICA();

  // ── 2. Quem manda o e-mail é o GoTrue ────────────────────────────────────
  // Com a anon key, e não com a service_role: esta chamada é exatamente a que
  // o navegador fazia antes, e não precisa de mais privilégio do que tinha.
  const publico = createClient(SUPABASE_URL, ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { error } = await publico.auth.resetPasswordForEmail(
    email,
    redirectTo ? { redirectTo } : undefined,
  );
  if (error) console.error('resetPasswordForEmail falhou', error);

  return RESPOSTA_UNICA();
});
