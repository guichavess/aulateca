import { describe, it, expect } from 'vitest';
import { normalize } from './cakto.ts';
import {
  configDoAmbiente,
  deveEnviar,
  enviarPurchase,
  hashear,
  montarEventoPurchase,
} from './meta.ts';

/**
 * O `Purchase` alimenta a otimização de anúncio da Meta e o ROAS que o gestor
 * lê. Os erros perigosos aqui são todos silenciosos: enviar em reembolso
 * (inventa receita), mandar e-mail sem hash (entrega dado pessoal a terceiro),
 * ou deixar o token vazar na URL. Nenhum deles quebra a venda — só aparece
 * tarde, no relatório ou no incidente.
 */

const compraAprovada = {
  secret: '123',
  event: 'purchase_approved',
  data: {
    id: '81b408ee-2a91-427d-80bd-226cbeae1fa0',
    status: 'paid',
    amount: 38.89,
    customer: { email: 'Professora@Escola.com.br ', name: 'Maria da Silva Souza' },
    product: { id: 'prod_1', name: 'AulaTeca' },
  },
};

const opcoes = { valorPadrao: 38.89, urlDaLoja: 'https://aulateca.com.br', agoraEmSegundos: 1000 };

describe('quando o Purchase deve ser enviado', () => {
  it('envia em compra aprovada', () => {
    expect(deveEnviar('grant')).toBe(true);
  });

  it.each(['revoke', 'cancel', 'log'])('não envia em %s — não é dinheiro entrando', (acao) => {
    expect(deveEnviar(acao)).toBe(false);
  });
});

describe('o evento montado', () => {
  it('manda o e-mail com hash, nunca em texto puro', async () => {
    const evento = await montarEventoPurchase(normalize(compraAprovada), opcoes);
    const serializado = JSON.stringify(evento);

    expect(serializado).not.toContain('professora@escola.com.br');
    expect(serializado).not.toContain('Professora@Escola.com.br');
    // Hash de 'professora@escola.com.br' — minúsculo e sem espaços em volta,
    // que é a normalização exigida pela Meta antes do SHA-256.
    expect(evento.user_data.em).toEqual([await hashear('professora@escola.com.br')]);
  });

  it('separa nome e sobrenome, com o nome do meio junto do sobrenome', async () => {
    const evento = await montarEventoPurchase(normalize(compraAprovada), opcoes);

    expect(evento.user_data.fn).toEqual([await hashear('maria')]);
    expect(evento.user_data.ln).toEqual([await hashear('da silva souza')]);
  });

  it('leva o valor que a Cakto cobrou, em reais', async () => {
    const evento = await montarEventoPurchase(normalize(compraAprovada), opcoes);

    expect(evento.custom_data.value).toBe(38.89);
    expect(evento.custom_data.currency).toBe('BRL');
  });

  it('cai no preço anunciado se a Cakto não mandar o valor', async () => {
    const semValor = { ...compraAprovada, data: { ...compraAprovada.data, amount: undefined } };
    const evento = await montarEventoPurchase(normalize(semValor), opcoes);

    // Zero faria a Meta tratar a conversão como sem receita e estragaria o ROAS.
    expect(evento.custom_data.value).toBe(38.89);
  });

  it('usa a chave de deduplicação como event_id, para a Meta descartar reenvio', async () => {
    const evento = await montarEventoPurchase(normalize(compraAprovada), opcoes);
    const mesmoEventoDeNovo = await montarEventoPurchase(normalize(compraAprovada), opcoes);

    expect(evento.event_id).toBe(normalize(compraAprovada).dedupeKey);
    expect(mesmoEventoDeNovo.event_id).toBe(evento.event_id);
  });

  it('é sempre Purchase — nunca InitiateCheckout, que é do clique', async () => {
    const evento = await montarEventoPurchase(normalize(compraAprovada), opcoes);

    expect(evento.event_name).toBe('Purchase');
  });
});

describe('a configuração do ambiente', () => {
  it('some quando falta pixel ou token — a venda funciona sem a Meta', () => {
    expect(configDoAmbiente(() => undefined)).toBeNull();
    expect(configDoAmbiente((k) => (k === 'META_PIXEL_ID' ? '123' : undefined))).toBeNull();
    expect(configDoAmbiente((k) => (k === 'META_CAPI_TOKEN' ? 'tok' : undefined))).toBeNull();
  });

  it('monta quando os dois existem', () => {
    const env: Record<string, string> = { META_PIXEL_ID: '123', META_CAPI_TOKEN: 'tok' };
    expect(configDoAmbiente((k) => env[k])).toEqual({ pixelId: '123', token: 'tok' });
  });
});

describe('o envio', () => {
  const config = { pixelId: '869796945790520', token: 'TOKEN-SECRETO' };

  it('não põe o token na URL — ela vaza em log de proxy e mensagem de erro', async () => {
    let urlChamada = '';
    let corpoEnviado = '';
    const fetchOriginal = globalThis.fetch;
    globalThis.fetch = (async (url: string, init: RequestInit) => {
      urlChamada = String(url);
      corpoEnviado = String(init.body);
      return new Response('{}', { status: 200 });
    }) as typeof fetch;

    const evento = await montarEventoPurchase(normalize(compraAprovada), opcoes);
    const resultado = await enviarPurchase(config, evento);
    globalThis.fetch = fetchOriginal;

    expect(resultado.ok).toBe(true);
    expect(urlChamada).not.toContain('TOKEN-SECRETO');
    expect(urlChamada).toContain('/869796945790520/events');
    expect(JSON.parse(corpoEnviado).access_token).toBe('TOKEN-SECRETO');
  });

  it('não lança quando a Meta responde erro — roda depois da resposta ao webhook', async () => {
    const fetchOriginal = globalThis.fetch;
    globalThis.fetch = (async () => new Response('erro', { status: 500 })) as typeof fetch;

    const evento = await montarEventoPurchase(normalize(compraAprovada), opcoes);
    const resultado = await enviarPurchase(config, evento);
    globalThis.fetch = fetchOriginal;

    expect(resultado.ok).toBe(false);
    expect(resultado.detalhe).toContain('500');
  });

  it('não lança quando a rede cai', async () => {
    const fetchOriginal = globalThis.fetch;
    globalThis.fetch = (async () => {
      throw new Error('conexão recusada');
    }) as typeof fetch;

    const evento = await montarEventoPurchase(normalize(compraAprovada), opcoes);
    const resultado = await enviarPurchase(config, evento);
    globalThis.fetch = fetchOriginal;

    expect(resultado.ok).toBe(false);
    expect(resultado.detalhe).toContain('conexão recusada');
  });
});
