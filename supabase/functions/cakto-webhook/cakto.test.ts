import { describe, it, expect } from 'vitest';
import {
  decide,
  dedupeKeyFor,
  expiresAtFor,
  normalize,
  parseSecrets,
  secretMatches,
  sourceKeyFor,
  RENEWAL_GRACE_DAYS,
} from './cakto.ts';

// Payloads copiados da documentação da Cakto (mintlify). Se a Cakto mudar o
// formato, é aqui que o teste avisa antes da venda quebrar em produção.

const pagamentoUnico = {
  secret: '123',
  event: 'purchase_approved',
  data: {
    id: '81b408ee-2a91-427d-80bd-226cbeae1fa0',
    refId: 'AUAe5xK',
    customer: {
      name: 'Example',
      birthDate: '2000-04-09',
      email: 'Comprador@Example.com',
      phone: '34999999999',
    },
    offer: { id: 'B8BcHrY', name: 'Offer Example', price: 5.55 },
    product: {
      name: 'Webhook Example',
      id: 'cd287b31-d4b7-4e94-858a-96e05ce2f4a2',
      short_id: '49bruPi',
      type: 'unique',
    },
    status: 'paid',
    amount: 5.55,
    fees: 2.49,
    paymentMethod: 'pix',
    paidAt: '2024-08-22T11:39:57.113068-03:00',
  },
};

const recorrente = {
  secret: '8402b43f',
  event: 'purchase_approved',
  data: {
    id: '1f1c81d2-088a-412d-8bb7-3d5269d64f58',
    refId: '6HngVo6',
    customer: { name: 'Tulio', email: 'tokipi8246@gamebcs.com', phone: '5534991462388' },
    offer: { id: 'jbwjmis', name: 'Subscription [Stg]', price: 5 },
    product: {
      name: 'Subscription [Stg]',
      id: 'f947c21c-d8f0-41a1-a0a6-fede9f27b3b7',
      type: 'subscription',
    },
    subscription: {
      id: 'd464132a-fcfa-4693-a6aa-a99483f06740',
      status: 'active',
      next_payment_date: '2025-04-08T14:43:39.724743-03:00',
    },
    status: 'paid',
    amount: 5,
    paymentMethod: 'credit_card',
  },
};

const cancelamento = {
  secret: '76a41004',
  event: 'subscription_canceled',
  data: {
    id: '2a348a25-2c26-4c1e-a905-436d52f8e29e',
    refId: '6JPuFrA',
    customer: { name: 'Teste', email: 'teste@gmail.com' },
    offer: { id: '7oYLwWh', name: 'Novo produto', price: 25 },
    product: { name: 'Novo produto123', id: 'fe46d976', type: 'subscription' },
    subscription: {
      id: '21401964-7dd5-4f24-a5d1-22ce473968c7',
      status: 'canceled',
      next_payment_date: null,
      canceledAt: '2025-05-15T16:19:33.336005-03:00',
    },
    status: 'scheduled',
    amount: 25,
    paymentMethod: 'credit_card',
  },
};

const abandono = {
  secret: '123',
  event: 'checkout_abandonment',
  data: {
    offer: { id: 'B8BcHrY', name: 'Example', price: 5.55 },
    product: { name: 'Example', id: 'cd287b31', type: 'unique' },
    customerName: 'Webhook Example',
    customerEmail: 'Lead@Teste.com',
    customerCellphone: '34999999999',
    createdAt: '2024-08-22T11:37:31.083758-03:00',
  },
};

describe('secretMatches', () => {
  it('aceita o segredo configurado e recusa o resto', () => {
    expect(secretMatches('abc123', ['abc123'])).toBe(true);
    expect(secretMatches('abc124', ['abc123'])).toBe(false);
    expect(secretMatches('abc', ['abc123'])).toBe(false);
    expect(secretMatches('abc123extra', ['abc123'])).toBe(false);
  });

  it('recusa valor ausente, vazio ou de outro tipo', () => {
    expect(secretMatches(undefined, ['abc123'])).toBe(false);
    expect(secretMatches('', ['abc123'])).toBe(false);
    expect(secretMatches(123, ['123'])).toBe(false);
    expect(secretMatches('abc123', [])).toBe(false);
  });

  it('aceita qualquer segredo da lista (janela de rotação)', () => {
    expect(secretMatches('novo', ['antigo', 'novo'])).toBe(true);
    expect(secretMatches('antigo', ['antigo', 'novo'])).toBe(true);
  });

  it('não é enganado por repetição do prefixo', () => {
    // Proteção contra a comparação módulo-comprimento usada no laço.
    expect(secretMatches('abab', ['ab'])).toBe(false);
  });
});

describe('parseSecrets', () => {
  it('separa por vírgula e ignora vazios', () => {
    expect(parseSecrets(' a , b ,, ')).toEqual(['a', 'b']);
    expect(parseSecrets(undefined)).toEqual([]);
    expect(parseSecrets('')).toEqual([]);
  });
});

describe('normalize', () => {
  it('achata o payload de pagamento único', () => {
    const evt = normalize(pagamentoUnico);
    expect(evt.event).toBe('purchase_approved');
    expect(evt.orderId).toBe('81b408ee-2a91-427d-80bd-226cbeae1fa0');
    expect(evt.refId).toBe('AUAe5xK');
    expect(evt.productType).toBe('unique');
    expect(evt.status).toBe('paid');
    expect(evt.amount).toBe(5.55);
    expect(evt.paymentMethod).toBe('pix');
    expect(evt.subscriptionId).toBeNull();
  });

  it('minúscula o e-mail — é a chave que amarra a venda à conta', () => {
    expect(normalize(pagamentoUnico).customerEmail).toBe('comprador@example.com');
  });

  it('lê o e-mail do abandono, que vem em campo diferente', () => {
    const evt = normalize(abandono);
    expect(evt.customerEmail).toBe('lead@teste.com');
    expect(evt.customerName).toBe('Webhook Example');
  });

  it('extrai a assinatura do recorrente', () => {
    const evt = normalize(recorrente);
    expect(evt.subscriptionId).toBe('d464132a-fcfa-4693-a6aa-a99483f06740');
    expect(evt.nextPaymentDate).toBe('2025-04-08T14:43:39.724743-03:00');
  });

  it('não quebra com payload vazio ou lixo', () => {
    expect(normalize({}).event).toBe('unknown');
    expect(normalize(null).customerEmail).toBeNull();
    expect(normalize('texto').orderId).toBeNull();
  });
});

describe('dedupeKeyFor', () => {
  it('deduplica reenvio do mesmo evento', () => {
    expect(normalize(pagamentoUnico).dedupeKey).toBe(
      'purchase_approved|paid|81b408ee-2a91-427d-80bd-226cbeae1fa0',
    );
  });

  it('distingue transições de status do mesmo pedido', () => {
    expect(dedupeKeyFor('pix_gerado', 'X1', 'waiting_payment')).not.toBe(
      dedupeKeyFor('purchase_approved', 'X1', 'paid'),
    );
  });

  it('deixa o abandono de checkout sem chave (a doc diz que repete)', () => {
    expect(normalize(abandono).dedupeKey).toBeNull();
  });
});

describe('sourceKeyFor', () => {
  it('prefere a assinatura ao pedido — a renovação troca o pedido', () => {
    expect(sourceKeyFor(normalize(recorrente))).toBe('sub:d464132a-fcfa-4693-a6aa-a99483f06740');
  });

  it('usa o pedido no pagamento único', () => {
    expect(sourceKeyFor(normalize(pagamentoUnico))).toBe(
      'order:81b408ee-2a91-427d-80bd-226cbeae1fa0',
    );
  });
});

describe('expiresAtFor', () => {
  it('pagamento único não expira', () => {
    expect(expiresAtFor('unique', '2025-04-08T14:43:39-03:00')).toBeNull();
  });

  it('assinatura vale até a próxima cobrança mais a tolerância', () => {
    const expires = expiresAtFor('subscription', '2025-04-08T14:43:39.724743-03:00');
    const esperado = new Date('2025-04-08T14:43:39.724743-03:00');
    esperado.setUTCDate(esperado.getUTCDate() + RENEWAL_GRACE_DAYS);
    expect(expires).toBe(esperado.toISOString());
  });

  it('sem próxima cobrança, não expira (não tranca assinante adimplente)', () => {
    expect(expiresAtFor('subscription', null)).toBeNull();
    expect(expiresAtFor('subscription', 'data-quebrada')).toBeNull();
  });
});

describe('decide', () => {
  it('venda única aprovada libera acesso vitalício', () => {
    const d = decide(normalize(pagamentoUnico));
    expect(d.action).toBe('grant');
    if (d.action !== 'grant') return;
    expect(d.entitlement.email).toBe('comprador@example.com');
    expect(d.entitlement.kind).toBe('unique');
    expect(d.entitlement.expiresAt).toBeNull();
    expect(d.entitlement.sourceKey).toBe('order:81b408ee-2a91-427d-80bd-226cbeae1fa0');
  });

  it('cobrança de assinatura libera acesso com prazo', () => {
    const d = decide(normalize(recorrente));
    expect(d.action).toBe('grant');
    if (d.action !== 'grant') return;
    expect(d.entitlement.kind).toBe('subscription');
    expect(d.entitlement.expiresAt).not.toBeNull();
  });

  it('renovação usa a MESMA source_key da compra inicial', () => {
    const inicial = decide(normalize(recorrente));
    const renovacao = decide(
      normalize({
        ...recorrente,
        event: 'subscription_renewed',
        data: {
          ...recorrente.data,
          id: 'pedido-novo-da-renovacao',
          subscription: {
            ...recorrente.data.subscription,
            next_payment_date: '2025-05-08T14:43:39.724743-03:00',
          },
        },
      }),
    );
    expect(inicial.action).toBe('grant');
    expect(renovacao.action).toBe('grant');
    if (inicial.action !== 'grant' || renovacao.action !== 'grant') return;
    // Chaves iguais = a renovação estende a linha existente em vez de criar outra.
    expect(renovacao.entitlement.sourceKey).toBe(inicial.entitlement.sourceKey);
    expect(renovacao.entitlement.expiresAt! > inicial.entitlement.expiresAt!).toBe(true);
  });

  it('cancelamento não revoga — mantém o período já pago', () => {
    const d = decide(normalize(cancelamento));
    expect(d.action).toBe('cancel');
    if (d.action !== 'cancel') return;
    expect(d.sourceKey).toBe('sub:21401964-7dd5-4f24-a5d1-22ce473968c7');
  });

  it('reembolso e chargeback derrubam o acesso', () => {
    for (const event of ['refund', 'chargeback']) {
      const d = decide(normalize({ ...pagamentoUnico, event }));
      expect(d.action).toBe('revoke');
    }
  });

  it('eventos de cobrança pendente e recusa não liberam nada', () => {
    for (const event of ['pix_gerado', 'boleto_gerado', 'picpay_gerado', 'purchase_refused']) {
      expect(decide(normalize({ ...pagamentoUnico, event })).action).toBe('log');
    }
    expect(decide(normalize(abandono)).action).toBe('log');
  });

  it('evento desconhecido é apenas registrado, sem quebrar', () => {
    const d = decide(normalize({ ...pagamentoUnico, event: 'evento_novo_da_cakto' }));
    expect(d.action).toBe('log');
  });

  it('status que desmente a aprovação não libera', () => {
    const d = decide(
      normalize({ ...pagamentoUnico, data: { ...pagamentoUnico.data, status: 'refused' } }),
    );
    expect(d.action).toBe('log');
  });

  it('status desconhecido em compra aprovada ainda libera (o evento já é a aprovação)', () => {
    const d = decide(
      normalize({ ...pagamentoUnico, data: { ...pagamentoUnico.data, status: 'status_novo' } }),
    );
    expect(d.action).toBe('grant');
  });

  it('venda sem e-mail não vira acesso — não haveria a quem entregar', () => {
    const d = decide(
      normalize({
        ...pagamentoUnico,
        data: { ...pagamentoUnico.data, customer: { name: 'Sem email' } },
      }),
    );
    expect(d.action).toBe('log');
  });

  it('com lista de produtos, ignora venda de produto alheio', () => {
    const evt = normalize(pagamentoUnico);
    expect(decide(evt, ['cd287b31-d4b7-4e94-858a-96e05ce2f4a2']).action).toBe('grant');
    expect(decide(evt, ['outro-produto']).action).toBe('log');
  });
});
