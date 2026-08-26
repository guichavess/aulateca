import { describe, it, expect, vi, beforeEach } from 'vitest';

let rows: unknown[] = [];
let queryError: { message: string } | null = null;
const selectSpy = vi.fn();

// Query builder mínimo: .select().order() resolve a promise.
const from = vi.fn((_table: string) => ({
  select: (cols: string) => {
    selectSpy(cols);
    return {
      order: () => Promise.resolve({ data: rows, error: queryError }),
    };
  },
}));

const rpc = vi.fn(() => Promise.resolve({ data: 2, error: null }));

vi.mock('@/integrations/supabase/client', () => ({
  supabase: { from: (t: string) => from(t), rpc: (...args: unknown[]) => rpc(...(args as [])) },
}));

import {
  accessService,
  isEntitlementActive,
  summarize,
  toEntitlement,
  type Entitlement,
} from '@/services/access.service';

const AGORA = new Date('2026-08-26T12:00:00Z');
const ONTEM = '2026-08-25T12:00:00Z';
const AMANHA = '2026-08-27T12:00:00Z';

const ent = (over: Partial<Entitlement> = {}): Entitlement => ({
  id: 'e1',
  kind: 'unique',
  status: 'active',
  grantedAt: '2026-08-01T12:00:00Z',
  ...over,
});

beforeEach(() => {
  rows = [];
  queryError = null;
  from.mockClear();
  selectSpy.mockClear();
  rpc.mockClear();
});

describe('isEntitlementActive', () => {
  it('pagamento único sem validade vale para sempre', () => {
    expect(isEntitlementActive(ent(), AGORA)).toBe(true);
  });

  it('assinatura vale até a data de fim', () => {
    expect(isEntitlementActive(ent({ kind: 'subscription', expiresAt: AMANHA }), AGORA)).toBe(true);
    expect(isEntitlementActive(ent({ kind: 'subscription', expiresAt: ONTEM }), AGORA)).toBe(false);
  });

  it('cancelada mantém o acesso até o fim do período já pago', () => {
    expect(isEntitlementActive(ent({ status: 'canceled', expiresAt: AMANHA }), AGORA)).toBe(true);
    expect(isEntitlementActive(ent({ status: 'canceled', expiresAt: ONTEM }), AGORA)).toBe(false);
  });

  it('cancelada sem data de fim NÃO dá acesso vitalício', () => {
    // Sem esta regra, cancelar uma assinatura que nunca renovou viraria
    // acesso para sempre — o caso oposto do pretendido.
    expect(isEntitlementActive(ent({ status: 'canceled' }), AGORA)).toBe(false);
  });

  it('reembolso e chargeback derrubam mesmo sem data de fim', () => {
    expect(isEntitlementActive(ent({ status: 'revoked' }), AGORA)).toBe(false);
    expect(isEntitlementActive(ent({ status: 'revoked', expiresAt: AMANHA }), AGORA)).toBe(false);
    expect(isEntitlementActive(ent({ status: 'expired' }), AGORA)).toBe(false);
  });
});

describe('summarize', () => {
  it('sem acessos, sem liberação', () => {
    expect(summarize([], AGORA)).toEqual({ hasAccess: false, entitlements: [], expiresAt: undefined });
  });

  it('um acesso revogado e outro válido ainda liberam', () => {
    const lista = [ent({ id: 'a', status: 'revoked' }), ent({ id: 'b', expiresAt: AMANHA })];
    expect(summarize(lista, AGORA).hasAccess).toBe(true);
  });

  it('mostra o vencimento mais distante entre os válidos', () => {
    const longe = '2026-12-01T12:00:00Z';
    const lista = [ent({ id: 'a', expiresAt: AMANHA }), ent({ id: 'b', expiresAt: longe })];
    expect(summarize(lista, AGORA).expiresAt).toBe(longe);
  });

  it('acesso vitalício não mostra data de vencimento', () => {
    const lista = [ent({ id: 'a', expiresAt: AMANHA }), ent({ id: 'b' })];
    expect(summarize(lista, AGORA).expiresAt).toBeUndefined();
  });

  it('vencido não gera data de vencimento futura', () => {
    expect(summarize([ent({ expiresAt: ONTEM })], AGORA)).toMatchObject({
      hasAccess: false,
      expiresAt: undefined,
    });
  });
});

describe('toEntitlement', () => {
  it('converte nulos do banco em ausência', () => {
    const e = toEntitlement({
      id: 'x',
      kind: 'subscription',
      status: 'active',
      product_name: null,
      ref_id: null,
      granted_at: '2026-08-01T12:00:00Z',
      expires_at: null,
      revoke_reason: null,
    });
    expect(e.productName).toBeUndefined();
    expect(e.expiresAt).toBeUndefined();
    expect(e.refId).toBeUndefined();
  });
});

describe('accessService.fetchStatus', () => {
  it('lê os acessos do usuário e resume', async () => {
    rows = [
      {
        id: 'x',
        kind: 'unique',
        status: 'active',
        product_name: 'Aulateca',
        ref_id: 'AUAe5xK',
        granted_at: '2026-08-01T12:00:00Z',
        expires_at: null,
        revoke_reason: null,
      },
    ];
    const status = await accessService.fetchStatus();
    expect(from).toHaveBeenCalledWith('cakto_entitlements');
    expect(status.hasAccess).toBe(true);
    expect(status.entitlements[0].productName).toBe('Aulateca');
  });

  it('não pede o payload cru nem o e-mail — a tela não precisa', () => {
    void accessService.fetchStatus();
    const cols = selectSpy.mock.calls[0][0] as string;
    expect(cols).not.toContain('payload');
    expect(cols).not.toContain('email');
  });

  it('propaga erro do banco em vez de fingir que não há acesso', async () => {
    queryError = { message: 'permission denied' };
    await expect(accessService.fetchStatus()).rejects.toThrow('permission denied');
  });
});

describe('accessService.claim', () => {
  it('chama a função do banco e devolve quantos acessos vinculou', async () => {
    await expect(accessService.claim()).resolves.toBe(2);
    expect(rpc).toHaveBeenCalledWith('claim_cakto_entitlements');
  });
});
