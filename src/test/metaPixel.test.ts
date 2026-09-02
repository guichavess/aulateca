import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { resolve } from 'node:path';

/**
 * O pixel da Meta vive solto no index.html, fora do alcance do TypeScript e do
 * lint — dois riscos ficam sem rede se ninguém os prender aqui.
 *
 * O primeiro é vazamento de dado pessoal. O pixel manda para a Meta a URL
 * completa da página, e três rotas carregam dado do comprador na própria URL:
 * `/criar-acesso?e=` traz o e-mail em base64 (codificação, não criptografia) e
 * as rotas de senha trazem o code do link do e-mail. Nenhuma delas tem valor de
 * marketing — quem chega nelas já comprou.
 *
 * O segundo é silencioso e pior: a CSP libera o script inline por hash sha256.
 * Mudar uma vírgula no bloco sem regerar o hash não quebra teste nenhum, não
 * quebra o build, e derruba o pixel só em produção — onde ninguém olha console.
 */

const raizDoProjeto = resolve(__dirname, '../..');

function lerScriptDoPixel(): string {
  const html = readFileSync(resolve(raizDoProjeto, 'index.html'), 'utf8');
  const achado = html.match(/<script>\n\(function \(\)[\s\S]*?<\/script>/);
  if (!achado) throw new Error('bloco inline do pixel não encontrado no index.html');
  return achado[0].slice('<script>'.length, -'</script>'.length);
}

function lerScriptDaUtmify(): string {
  const html = readFileSync(resolve(raizDoProjeto, 'index.html'), 'utf8');
  const achado = html.match(/<script>\n {6}\(function \(\)[\s\S]*?<\/script>/);
  if (!achado) throw new Error('bloco inline da Utmify não encontrado no index.html');
  return achado[0].slice('<script>'.length, -'</script>'.length);
}

function hashesDaCSP(): string[] {
  const vercel = JSON.parse(readFileSync(resolve(raizDoProjeto, 'vercel.json'), 'utf8'));
  const csp = vercel.headers[0].headers.find(
    (h: { key: string }) => h.key === 'Content-Security-Policy',
  ).value as string;
  return Array.from(csp.matchAll(/'(sha256-[^']+)'/g)).map((m) => m[1]);
}

function hashDaCSP(): string {
  const vercel = JSON.parse(readFileSync(resolve(raizDoProjeto, 'vercel.json'), 'utf8'));
  const csp = vercel.headers[0].headers.find(
    (h: { key: string }) => h.key === 'Content-Security-Policy',
  ).value as string;
  const achado = csp.match(/'(sha256-[^']+)'/);
  if (!achado) throw new Error('nenhum hash sha256 na CSP do vercel.json');
  return achado[1];
}

/** Roda o bloco do pixel como o navegador rodaria, na rota pedida. */
function rodarPixelEm(caminho: string): void {
  window.history.replaceState({}, '', caminho);
  new Function(lerScriptDoPixel())();
}

const scriptDaMeta = () =>
  document.querySelector('script[src*="connect.facebook.net"]');

describe('o pixel da Meta no index.html', () => {
  beforeEach(() => {
    // O snippet da Meta se insere ao lado do primeiro <script> da página.
    document.head.appendChild(document.createElement('script'));
  });

  afterEach(() => {
    document.head.innerHTML = '';
    delete (window as unknown as Record<string, unknown>).fbq;
    delete (window as unknown as Record<string, unknown>)._fbq;
    window.history.replaceState({}, '', '/');
  });

  it('roda nas rotas públicas', () => {
    rodarPixelEm('/landing');

    expect(typeof (window as unknown as { fbq?: unknown }).fbq).toBe('function');
    expect(scriptDaMeta()).not.toBeNull();
  });

  it.each(['/criar-acesso', '/redefinir-senha', '/recuperar-senha'])(
    'não roda em %s, que leva dado do comprador na URL',
    (rota) => {
      rodarPixelEm(rota);

      expect((window as unknown as { fbq?: unknown }).fbq).toBeUndefined();
      expect(scriptDaMeta()).toBeNull();
    },
  );

  it('não roda nessas rotas nem com barra sobrando no fim', () => {
    rodarPixelEm('/criar-acesso/');

    expect(scriptDaMeta()).toBeNull();
  });

  it('a fila de eventos abre com PageView', () => {
    rodarPixelEm('/landing');
    const fbq = (window as unknown as { fbq: { queue: IArguments[] } }).fbq;
    // A fila guarda objetos `arguments`, não arrays — comparar direto falha.
    const chamadas = Array.from(fbq.queue).map((args) => Array.from(args));

    expect(chamadas).toEqual([
      ['init', '869796945790520'],
      ['track', 'PageView'],
    ]);
  });

  it('o hash na CSP do vercel.json é o do bloco que está no index.html', () => {
    const real = 'sha256-' + createHash('sha256').update(lerScriptDoPixel(), 'utf8').digest('base64');

    expect(hashDaCSP()).toBe(real);
  });
});

/**
 * A Utmify carrega ao lado da Meta e corre os mesmos dois riscos: mandar a URL
 * de /criar-acesso (com o e-mail do comprador) para um terceiro, e cair calada
 * em produção se o hash da CSP não acompanhar uma edição do bloco inline.
 */
describe('o pixel da Utmify no index.html', () => {
  const scriptsDaUtmify = () =>
    document.querySelectorAll('script[src*="cdn.utmify.com.br"]');

  afterEach(() => {
    document.head.innerHTML = '';
    delete (window as unknown as Record<string, unknown>).pixelId;
    window.history.replaceState({}, '', '/');
  });

  function rodarUtmifyEm(caminho: string): void {
    window.history.replaceState({}, '', caminho);
    new Function(lerScriptDaUtmify())();
  }

  it('carrega o pixel e o rastreador de UTM nas rotas públicas', () => {
    rodarUtmifyEm('/landing');

    const srcs = Array.from(scriptsDaUtmify()).map((s) => s.getAttribute('src'));
    expect(srcs).toEqual([
      'https://cdn.utmify.com.br/scripts/pixel/pixel.js',
      'https://cdn.utmify.com.br/scripts/utms/latest.js',
    ]);
    expect((window as unknown as { pixelId?: string }).pixelId).toBe(
      '6a977262fbf5cc13655ac28a',
    );
  });

  it.each(['/criar-acesso', '/redefinir-senha', '/recuperar-senha', '/criar-acesso/'])(
    'não roda em %s, que leva dado do comprador na URL',
    (rota) => {
      rodarUtmifyEm(rota);

      expect(scriptsDaUtmify()).toHaveLength(0);
      expect((window as unknown as { pixelId?: string }).pixelId).toBeUndefined();
    },
  );

  it('o hash do bloco está na CSP do vercel.json', () => {
    const real =
      'sha256-' +
      createHash('sha256').update(lerScriptDaUtmify(), 'utf8').digest('base64');

    expect(hashesDaCSP()).toContain(real);
  });
});
