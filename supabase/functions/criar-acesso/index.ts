/**
 * Cria a conta de quem já comprou o Aulateca na Cakto.
 *
 * O signup público do Supabase fica DESLIGADO (painel → Authentication →
 * "Allow new users to sign up"). Esta função é a única porta de entrada, e ela
 * só abre para e-mail com compra ativa: é o que transforma "qualquer um cria
 * conta e vê tudo" em produto pago de verdade.
 *
 * Por que a conta nasce com `email_confirm: true`: a titularidade do e-mail já
 * foi provada no pagamento. Exigir confirmação de novo acrescentaria uma etapa
 * — e uma chance de e-mail na caixa de spam — logo depois de a pessoa pagar.
 *
 * Enumeração de e-mails: responder `403 sem_compra` revela que aquele e-mail
 * não comprou. É um trade-off consciente — a resposta genérica deixaria o
 * comprador legítimo travado sem entender o motivo, e "esta pessoa comprou o
 * Aulateca" é dado de baixo valor. O que mitiga é o rate limit do passo 1, que
 * por isso não é opcional.
 *
 * Deploy:
 *   supabase secrets set ACCESS_LINK_SECRET='<segredo longo>'
 *   supabase functions deploy criar-acesso --no-verify-jwt
 */
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.4';
import {
  hasActiveEntitlement,
  hashIp,
  isAlreadyRegistered,
  parseRequest,
  rateLimitExceeded,
  rateLimitWindowStart,
} from './conta.ts';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
// Sal do hash de IP. Reaproveita o segredo do link de acesso: é a mesma classe
// de dado (segredo do servidor) e evita mais uma variável para esquecer.
const IP_SALT = Deno.env.get('ACCESS_LINK_SECRET') ?? '';

// A página `/criar-acesso` é pública e chamada pelo navegador do comprador.
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

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });
  if (req.method !== 'POST') return json(405, { ok: false, error: 'use POST' });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return json(400, { ok: false, code: 'dados_invalidos', error: 'corpo não é JSON' });
  }

  const parsed = parseRequest(body);
  if (!parsed.ok) {
    const status = parsed.code === 'senha_fraca' ? 422 : 400;
    return json(status, { ok: false, code: parsed.code, problems: parsed.problems });
  }
  const { email, password, name, role } = parsed.value;

  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  // ── 1. Rate limit ────────────────────────────────────────────────────────
  // x-forwarded-for vem da borda do Supabase; o primeiro item é o cliente.
  const ip = (req.headers.get('x-forwarded-for') ?? '').split(',')[0].trim() || 'desconhecido';
  const ipHash = IP_SALT ? await hashIp(ip, IP_SALT) : null;
  const desde = rateLimitWindowStart();

  const [porIp, porEmail] = await Promise.all([
    ipHash
      ? supabase
          .from('access_attempts')
          .select('id', { count: 'exact', head: true })
          .eq('ip_hash', ipHash)
          .gte('created_at', desde)
      : Promise.resolve({ count: 0, error: null }),
    supabase
      .from('access_attempts')
      .select('id', { count: 'exact', head: true })
      .eq('email', email)
      .gte('created_at', desde),
  ]);

  // Falha ao CONTAR não pode barrar um comprador legítimo: registra e segue.
  // O freio é uma defesa contra abuso, não um pré-requisito da venda.
  if (porIp.error) console.error('rate limit por IP falhou', porIp.error);
  if (porEmail.error) console.error('rate limit por e-mail falhou', porEmail.error);

  if (rateLimitExceeded({ byIp: porIp.count ?? 0, byEmail: porEmail.count ?? 0 })) {
    return json(429, { ok: false, code: 'muitas_tentativas' });
  }

  // A tentativa é registrada ANTES do resultado: o que interessa ao freio é
  // quantas vezes bateram na porta, não quantas vezes acertaram.
  const { error: attemptError } = await supabase
    .from('access_attempts')
    .insert({ kind: 'criar_acesso', email, ip_hash: ipHash });
  if (attemptError) console.error('falha ao registrar tentativa', attemptError);

  // ── 2. A compra existe? ──────────────────────────────────────────────────
  const { data: entitlements, error: entitlementError } = await supabase
    .from('cakto_entitlements')
    .select('status, expires_at')
    .eq('email', email);

  if (entitlementError) {
    console.error('consulta de acesso falhou', entitlementError);
    return json(500, { ok: false, code: 'erro_interno' });
  }

  if (!hasActiveEntitlement(entitlements ?? [])) {
    return json(403, { ok: false, code: 'sem_compra' });
  }

  // ── 3. Cria a conta ──────────────────────────────────────────────────────
  // O trigger `handle_new_user` (011:166) cria o profile e vincula sozinho os
  // entitlements órfãos deste e-mail. Nada a fazer depois daqui.
  const { error: createError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { name: name || undefined, role },
  });

  if (createError) {
    if (isAlreadyRegistered(createError.message)) {
      // A UI manda para o login ou para a recuperação de senha — a pessoa já
      // tem conta e, com a compra ativa, já tem acesso.
      return json(409, { ok: false, code: 'conta_existe' });
    }
    console.error('createUser falhou', createError);
    return json(500, { ok: false, code: 'erro_interno' });
  }

  return json(201, { ok: true });
});
