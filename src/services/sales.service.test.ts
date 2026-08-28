import { describe, it, expect, vi, beforeEach } from 'vitest';

// Query builder mínimo: encadeia e resolve no await do PostgREST.
const captura = { table: '', filtros: [] as Array<[string, unknown]>, limit: 0 };
let linhas: unknown[] = [];
let erro: { message: string } | null = null;

const builder = () => {
  const self = {
    select: () => self,
    order: () => self,
    limit: (n: number) => {
      captura.limit = n;
      return self;
    },
    eq: (col: string, val: unknown) => {
      captura.filtros.push([col, val]);
      return self;
    },
    ilike: (col: string, val: unknown) => {
      captura.filtros.push([col, val]);
      return self;
    },
    then: (resolve: (r: unknown) => void) => resolve({ data: linhas, error: erro }),
  };
  return self;
};

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: (t: string) => {
      captura.table = t;
      return builder();
    },
  },
}));

import {
  salesService,
  toSale,
  situacaoDoAcesso,
  situacaoDaConta,
  precisaDeAtencao,
  type Sale,
} from '@/services/sales.service';

const row = (over: Record<string, unknown> = {}) => ({
  id: 'e1',
  email: 'joana@escola.com',
  user_id: null,
  user_name: null,
  kind: 'unique',
  status: 'active',
  product_name: 'Aulateca',
  order_id: 'o1',
  ref_id: 'ABC123',
  subscription_id: null,
  granted_at: '2026-08-01T12:00:00Z',
  expires_at: null,
  revoked_at: null,
  revoke_reason: null,
  last_event: 'purchase_approved',
  last_event_at: '2026-08-01T12:00:00Z',
  is_active: true,
  access_email_sent_at: null,
  access_email_error: null,
  created_at: '2026-08-01T12:00:00Z',
  ...over,
});

const venda = (over: Record<string, unknown> = {}): Sale => toSale(row(over));

beforeEach(() => {
  captura.table = '';
  captura.filtros = [];
  captura.limit = 0;
  linhas = [];
  erro = null;
});

describe('situacaoDoAcesso', () => {
  it('separa reembolso de chargeback — o atendimento é diferente', () => {
    expect(
      situacaoDoAcesso(venda({ status: 'revoked', is_active: false, revoke_reason: 'refund' })).label,
    ).toBe('Reembolsada');
    expect(
      situacaoDoAcesso(venda({ status: 'revoked', is_active: false, revoke_reason: 'chargeback' }))
        .label,
    ).toBe('Chargeback');
  });

  it('assinatura cancelada que ainda vale aparece como acesso até a data', () => {
    // O cliente pagou o período corrente. Mostrar "encerrada" aqui faria o
    // suporte negar acesso a quem ainda tem direito.
    const s = situacaoDoAcesso(
      venda({ status: 'canceled', kind: 'subscription', is_active: true, expires_at: '2026-09-30T00:00:00Z' }),
    );
    expect(s.tom).toBe('atencao');
    expect(s.detalhe).toContain('acesso até');
  });

  it('confia no is_active do banco em vez de recalcular', () => {
    // A view usa a mesma regra da policy. Se a tela fizesse a conta de novo,
    // haveria duas verdades e uma delas mentiria em algum caso de borda.
    expect(situacaoDoAcesso(venda({ status: 'active', is_active: false })).label).toBe('Expirada');
    expect(situacaoDoAcesso(venda({ status: 'active', is_active: true })).tom).toBe('ok');
  });
});

describe('situacaoDaConta', () => {
  it('conta criada ganha o nome do perfil', () => {
    const s = situacaoDaConta(venda({ user_id: 'u1', user_name: 'Joana' }));
    expect(s.label).toBe('Conta criada');
    expect(s.detalhe).toBe('Joana');
  });

  it('erro de envio vence a ausência de envio — é a informação acionável', () => {
    const s = situacaoDaConta(venda({ access_email_error: 'RESEND_API_KEY não configurado' }));
    expect(s.label).toBe('E-mail falhou');
    expect(s.detalhe).toContain('RESEND_API_KEY');
  });

  it('link enviado sem senha criada fica em atenção, não em erro', () => {
    const s = situacaoDaConta(venda({ access_email_sent_at: '2026-08-02T09:00:00Z' }));
    expect(s.label).toBe('Link enviado');
    expect(s.tom).toBe('atencao');
  });
});

describe('precisaDeAtencao', () => {
  it('marca quem pagou, tem acesso e não recebeu o link', () => {
    expect(precisaDeAtencao(venda())).toBe(true);
  });

  it('marca quem recebeu um e-mail que falhou', () => {
    expect(
      precisaDeAtencao(venda({ access_email_sent_at: null, access_email_error: 'bounce' })),
    ).toBe(true);
  });

  it('não marca quem já criou a conta', () => {
    expect(precisaDeAtencao(venda({ user_id: 'u1' }))).toBe(false);
  });

  it('não marca venda revogada — não há o que entregar', () => {
    expect(precisaDeAtencao(venda({ status: 'revoked', is_active: false }))).toBe(false);
  });
});

describe('salesService.list', () => {
  it('lê a view consolidada, não a tabela de entitlements', async () => {
    await salesService.list();
    expect(captura.table).toBe('cakto_access_overview');
  });

  it('filtra ativas no banco', async () => {
    await salesService.list('ativas');
    expect(captura.filtros).toContainEqual(['is_active', true]);
  });

  it('resolve "travadas" em memória, sobre as ativas', async () => {
    linhas = [row(), row({ id: 'e2', user_id: 'u1' })];
    const r = await salesService.list('atencao');
    expect(captura.filtros).toContainEqual(['is_active', true]);
    expect(r.map((v) => v.id)).toEqual(['e1']);
  });

  it('busca por e-mail sem deixar o usuário injetar curinga do ILIKE', async () => {
    await salesService.list('todas', '  %JOANA_  ');
    expect(captura.filtros).toContainEqual(['email', '%joana%']);
  });

  it('propaga o erro do PostgREST em vez de devolver lista vazia', async () => {
    // Silenciar aqui faria a tela dizer "nenhuma venda" quando o que houve foi
    // uma falha de permissão — a pior mentira possível nesta página.
    erro = { message: 'permission denied for view cakto_access_overview' };
    await expect(salesService.list()).rejects.toThrow('permission denied');
  });
});

describe('salesService.summary', () => {
  it('conta a base inteira, sem o limite da listagem', async () => {
    linhas = [
      row(),                                            // ativa, travada
      row({ id: 'e2', user_id: 'u1' }),                 // ativa, com conta
      row({ id: 'e3', is_active: false, status: 'revoked' }),
    ];
    const r = await salesService.summary();
    expect(r).toEqual({ total: 3, ativas: 2, atencao: 1, semConta: 1 });
    expect(captura.limit).toBe(0);
  });
});
