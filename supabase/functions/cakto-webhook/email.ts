/**
 * O e-mail que avisa o comprador — regras puras, sem I/O.
 *
 * Por que isto existe: até aqui a Cakto liberava o acesso no banco e o
 * comprador não ficava sabendo de nada. Ele pagava e não recebia nem o link
 * nem a instrução de que precisa criar a senha com o MESMO e-mail da compra.
 * Sem este aviso, a venda vira um chamado de suporte.
 *
 * Separado do `index.ts` pelo mesmo motivo do `cakto.ts`: o que decide fica
 * aqui e é testado pelo vitest; lá só sobra a chamada HTTP.
 *
 * `crypto.subtle` é padrão da plataforma (Deno e Node ≥ 18), então continua
 * sendo código puro no sentido que importa: nenhuma dependência do runtime do
 * Supabase, nenhuma rede.
 */

/** Template escolhido para o comprador. */
export type EmailTemplate =
  /** Comprou e ainda não tem conta: precisa criar a senha. */
  | 'criar_acesso'
  /** Já tem conta (o trigger amarrou o user_id): só avisamos que liberou. */
  | 'acesso_liberado';

export interface EntitlementEmailState {
  /** Null = a conta ainda não existe (ou não foi vinculada a este e-mail). */
  user_id: string | null;
  /** Não nulo = este comprador já foi avisado; não reenviar. */
  access_email_sent_at: string | null;
}

export type EmailDecision =
  | { send: true; template: EmailTemplate }
  | { send: false; reason: string };

/**
 * Decide SE o e-mail sai e QUAL sai.
 *
 * Duas garantias:
 *
 *  - Só `grant` avisa. Reembolso, chargeback e cancelamento mudam o acesso, mas
 *    quem comunica isso é a Cakto (é ela que tem a relação financeira); um
 *    e-mail nosso em cima seria ruído no pior momento.
 *  - `access_email_sent_at` corta o reenvio. Assinatura mensal dispara
 *    `subscription_renewed` todo mês, e mandar "crie seu acesso" para quem já
 *    entrou há seis meses é o tipo de detalhe que faz o produto parecer amador.
 */
export function decideEmail(
  entitlement: EntitlementEmailState | null,
  action: 'grant' | 'cancel' | 'revoke' | 'log',
): EmailDecision {
  if (action !== 'grant') return { send: false, reason: `ação sem e-mail: ${action}` };
  if (!entitlement) return { send: false, reason: 'acesso não encontrado após a gravação' };
  if (entitlement.access_email_sent_at) return { send: false, reason: 'comprador já avisado' };

  return {
    send: true,
    template: entitlement.user_id ? 'acesso_liberado' : 'criar_acesso',
  };
}

// ── link de acesso ─────────────────────────────────────────────────────────

export function base64url(bytes: Uint8Array): string {
  let bin = '';
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export function encodeEmailParam(email: string): string {
  return base64url(new TextEncoder().encode(email.trim().toLowerCase()));
}

/**
 * Assinatura do e-mail no link.
 *
 * O token NÃO é credencial e não libera nada: quem decide é o entitlement
 * conferido pela função `criar-acesso`. Ele existe para a página poder
 * pré-preencher o campo de e-mail com confiança — sem ele, qualquer um manda
 * ao comprador um link com o e-mail trocado e a pessoa cria a conta no e-mail
 * errado, ficando sem o acesso que pagou.
 */
export async function accessLinkToken(email: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const mac = await crypto.subtle.sign(
    'HMAC',
    key,
    new TextEncoder().encode(email.trim().toLowerCase()),
  );
  return base64url(new Uint8Array(mac));
}

/**
 * Confere o token. Comparação em tempo constante pelo mesmo motivo do
 * `secretMatches` do webhook: um verificador é um oráculo público.
 * Ainda não é chamado por ninguém — fica pronto para a página `/criar-acesso`
 * decidir se confia no e-mail que veio na URL.
 */
export async function verifyAccessLinkToken(
  email: string,
  token: string,
  secret: string,
): Promise<boolean> {
  const expected = await accessLinkToken(email, secret);
  if (token.length !== expected.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) {
    diff |= token.charCodeAt(i) ^ expected.charCodeAt(i);
  }
  return diff === 0;
}

export async function buildAccessLink(
  appUrl: string,
  email: string,
  secret: string,
): Promise<string> {
  const base = appUrl.replace(/\/+$/, '');
  const e = encodeEmailParam(email);
  // Sem segredo configurado o link ainda funciona: a página aceita o e-mail
  // digitado à mão. Melhor um link sem assinatura do que nenhum e-mail.
  if (!secret) return `${base}/criar-acesso?e=${e}`;
  const t = await accessLinkToken(email, secret);
  return `${base}/criar-acesso?e=${e}&t=${encodeURIComponent(t)}`;
}

// ── conteúdo ───────────────────────────────────────────────────────────────

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** Primeiro nome, para o e-mail não soar como formulário. */
export function firstName(name: string | null | undefined): string {
  const first = (name ?? '').trim().split(/\s+/)[0];
  return first.length >= 2 ? first : '';
}

export interface EmailContent {
  subject: string;
  html: string;
  text: string;
}

export interface RenderInput {
  template: EmailTemplate;
  /** Link para `/criar-acesso` (ou para o login, no template de renovação). */
  link: string;
  loginUrl: string;
  customerName?: string | null;
  productName?: string | null;
  supportEmail?: string | null;
}

/**
 * Texto e HTML na mesma função para não existir a chance de um dizer uma coisa
 * e o outro dizer outra. Toda a diagramação é inline: cliente de e-mail ignora
 * `<style>` com frequência, e este e-mail chega logo depois de a pessoa pagar —
 * não é hora de parecer quebrado.
 */
export function renderAccessEmail(input: RenderInput): EmailContent {
  const nome = firstName(input.customerName);
  const saudacao = nome ? `Oi, ${nome}!` : 'Oi!';
  const produto = (input.productName ?? 'Aulateca').trim() || 'Aulateca';
  const suporte = input.supportEmail?.trim() || '';

  const criar = input.template === 'criar_acesso';
  const subject = criar
    ? 'Seu acesso ao Aulateca: crie sua senha'
    : 'Seu acesso ao Aulateca está liberado';

  const destino = criar ? input.link : input.loginUrl;
  const botao = criar ? 'Criar minha senha' : 'Entrar no Aulateca';

  const corpo = criar
    ? [
        `Sua compra de ${produto} foi confirmada — obrigado!`,
        'Falta só um passo: criar a senha da sua conta. Use o botão abaixo; o e-mail já vem preenchido com o mesmo que você usou na compra.',
      ]
    : [
        `Sua compra de ${produto} foi confirmada e o acesso já está liberado na conta deste e-mail.`,
        'É só entrar com a senha que você já usa.',
      ];

  const rodape = criar
    ? 'Importante: use o mesmo e-mail da compra. É por ele que o acesso é reconhecido.'
    : 'Se você não lembra a senha, use a opção "Esqueceu a senha?" na tela de entrada.';

  const linhasTexto = [
    saudacao,
    '',
    ...corpo.flatMap((p) => [p, '']),
    `${botao}: ${destino}`,
    '',
    rodape,
    ...(suporte ? ['', `Precisa de ajuda? Responda este e-mail ou escreva para ${suporte}.`] : []),
    '',
    'Equipe Aulateca',
  ];

  const paragrafos = corpo
    .map(
      (p) =>
        `<p style="margin:0 0 16px;font-size:16px;line-height:1.6;color:#334155;">${escapeHtml(p)}</p>`,
    )
    .join('');

  const html = `<!doctype html>
<html lang="pt-BR"><body style="margin:0;padding:24px;background:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:16px;padding:32px;">
    <tr><td>
      <p style="margin:0 0 24px;font-size:20px;font-weight:700;color:#0f172a;">${escapeHtml(saudacao)}</p>
      ${paragrafos}
      <p style="margin:24px 0;">
        <a href="${escapeHtml(destino)}" style="display:inline-block;background:#7c3aed;color:#ffffff;text-decoration:none;padding:14px 28px;border-radius:10px;font-size:16px;font-weight:600;">${escapeHtml(botao)}</a>
      </p>
      <p style="margin:0 0 16px;font-size:14px;line-height:1.6;color:#64748b;">${escapeHtml(rodape)}</p>
      <p style="margin:0 0 16px;font-size:13px;line-height:1.6;color:#94a3b8;">Se o botão não funcionar, copie e cole este endereço no navegador:<br><span style="color:#7c3aed;word-break:break-all;">${escapeHtml(destino)}</span></p>
      ${
        suporte
          ? `<p style="margin:24px 0 0;font-size:14px;line-height:1.6;color:#64748b;">Precisa de ajuda? Responda este e-mail ou escreva para <a href="mailto:${escapeHtml(suporte)}" style="color:#7c3aed;">${escapeHtml(suporte)}</a>.</p>`
          : ''
      }
      <p style="margin:24px 0 0;font-size:14px;color:#64748b;">Equipe Aulateca</p>
    </td></tr>
  </table>
</body></html>`;

  return { subject, html, text: linhasTexto.join('\n') };
}
