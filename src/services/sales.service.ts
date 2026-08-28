import { supabase } from '@/integrations/supabase/client';

/**
 * Vendas da Cakto para o painel admin.
 *
 * Lê `cakto_access_overview` (migrations 011 e 017), que é `security_invoker`:
 * a RLS de quem consulta é que decide o que aparece. Sem a policy "admin vê
 * todos os acessos", esta consulta devolve só as linhas do próprio usuário —
 * não existe caminho por aqui para vazar a base de compradores.
 *
 * Só leitura. Conceder ou revogar acesso é trabalho do webhook com a
 * service_role; um acesso criado fora da venda seria fraude e não deve ter
 * botão.
 */

export type SaleKind = 'unique' | 'subscription';
export type SaleStatus = 'active' | 'canceled' | 'revoked' | 'expired';

export interface Sale {
  id: string;
  email: string;
  /** Preenchido quando a pessoa já criou a senha em /criar-acesso. */
  userId: string | null;
  userName: string | null;
  kind: SaleKind;
  status: SaleStatus;
  productName: string | null;
  orderId: string | null;
  /** Referência curta do pedido — é o que o suporte pede ao cliente. */
  refId: string | null;
  subscriptionId: string | null;
  grantedAt: string;
  expiresAt: string | null;
  revokedAt: string | null;
  revokeReason: string | null;
  lastEvent: string | null;
  lastEventAt: string | null;
  /** Calculado no banco: é a mesma regra de `has_active_access()`. */
  isActive: boolean;
  accessEmailSentAt: string | null;
  accessEmailError: string | null;
  createdAt: string;
}

type SaleRow = {
  id: string;
  email: string;
  user_id: string | null;
  user_name: string | null;
  kind: string;
  status: string;
  product_name: string | null;
  order_id: string | null;
  ref_id: string | null;
  subscription_id: string | null;
  granted_at: string;
  expires_at: string | null;
  revoked_at: string | null;
  revoke_reason: string | null;
  last_event: string | null;
  last_event_at: string | null;
  is_active: boolean;
  access_email_sent_at: string | null;
  access_email_error: string | null;
  created_at: string;
};

export function toSale(row: SaleRow): Sale {
  return {
    id: row.id,
    email: row.email,
    userId: row.user_id,
    userName: row.user_name,
    kind: row.kind as SaleKind,
    status: row.status as SaleStatus,
    productName: row.product_name,
    orderId: row.order_id,
    refId: row.ref_id,
    subscriptionId: row.subscription_id,
    grantedAt: row.granted_at,
    expiresAt: row.expires_at,
    revokedAt: row.revoked_at,
    revokeReason: row.revoke_reason,
    lastEvent: row.last_event,
    lastEventAt: row.last_event_at,
    isActive: row.is_active,
    accessEmailSentAt: row.access_email_sent_at,
    accessEmailError: row.access_email_error,
    createdAt: row.created_at,
  };
}

// ════════════════════════════════════════════════════════════════════════════
// Leitura da venda — as duas perguntas que o suporte faz
// ════════════════════════════════════════════════════════════════════════════

export type SituacaoTom = 'ok' | 'atencao' | 'ruim' | 'neutro';

export interface Situacao {
  label: string;
  detalhe?: string;
  tom: SituacaoTom;
}

const data = (iso: string) => new Date(iso).toLocaleDateString('pt-BR');

/**
 * "Esta pessoa tem acesso agora, e se não tem, por quê?"
 *
 * `isActive` vem calculado do banco pela mesma regra da policy, então a tela
 * nunca diz "ativo" para quem o Postgres barra — repetir a conta aqui seria
 * criar uma segunda verdade.
 */
export function situacaoDoAcesso(sale: Sale): Situacao {
  if (sale.status === 'revoked') {
    // A distinção importa no atendimento: chargeback costuma vir com disputa
    // aberta no cartão, reembolso é decisão nossa e o cliente sabe dela.
    const motivo = (sale.revokeReason ?? '').toLowerCase();
    if (motivo.includes('chargeback')) {
      return { label: 'Chargeback', detalhe: 'contestação no cartão', tom: 'ruim' };
    }
    if (motivo.includes('refund') || motivo.includes('reembol')) {
      return { label: 'Reembolsada', tom: 'ruim' };
    }
    return { label: 'Revogada', detalhe: sale.revokeReason ?? undefined, tom: 'ruim' };
  }

  if (sale.status === 'canceled') {
    return sale.isActive
      ? {
          label: 'Cancelada',
          // Já pagou este período: cortar antes do fim seria calote nosso.
          detalhe: sale.expiresAt ? `acesso até ${data(sale.expiresAt)}` : undefined,
          tom: 'atencao',
        }
      : { label: 'Cancelada', detalhe: 'acesso encerrado', tom: 'neutro' };
  }

  if (!sale.isActive) {
    return {
      label: 'Expirada',
      detalhe: sale.expiresAt ? `venceu em ${data(sale.expiresAt)}` : undefined,
      tom: 'neutro',
    };
  }

  if (sale.kind === 'subscription') {
    return {
      label: 'Assinatura ativa',
      detalhe: sale.expiresAt ? `renova em ${data(sale.expiresAt)}` : undefined,
      tom: 'ok',
    };
  }

  return { label: 'Ativa', detalhe: 'pagamento único', tom: 'ok' };
}

/**
 * "A pessoa consegue entrar?" — que é outra pergunta. Acesso pago e conta são
 * coisas separadas: quem pagou e nunca criou a senha tem entitlement ativo e
 * mesmo assim não entra no produto.
 */
export function situacaoDaConta(sale: Sale): Situacao {
  if (sale.userId) {
    return { label: 'Conta criada', detalhe: sale.userName ?? undefined, tom: 'ok' };
  }
  if (sale.accessEmailError) {
    return { label: 'E-mail falhou', detalhe: sale.accessEmailError, tom: 'ruim' };
  }
  if (!sale.accessEmailSentAt) {
    return { label: 'E-mail não enviado', tom: 'ruim' };
  }
  return {
    label: 'Link enviado',
    detalhe: `em ${data(sale.accessEmailSentAt)}, senha ainda não criada`,
    tom: 'atencao',
  };
}

/**
 * A fila de trabalho do suporte: vendas válidas em que a pessoa ainda não
 * conseguiu entrar. É dinheiro recebido sem produto entregue — o pior estado
 * possível, e o único que justifica alguém abrir esta tela todo dia.
 */
export function precisaDeAtencao(sale: Sale): boolean {
  return sale.isActive && !sale.userId && (!sale.accessEmailSentAt || !!sale.accessEmailError);
}

export type SalesFilter = 'todas' | 'ativas' | 'atencao' | 'sem_conta' | 'encerradas';

const VIEW = 'cakto_access_overview';
const PAGE_SIZE = 50;

export interface SalesSummary {
  total: number;
  ativas: number;
  atencao: number;
  semConta: number;
}

export const salesService = {
  /**
   * `atencao` e `semConta` não têm coluna própria no banco: são combinações de
   * três colunas. Filtrar isso no PostgREST viraria um `.or()` ilegível e
   * frágil, então esses dois casos são resolvidos em memória — e a página
   * avisa quando o filtro trabalhou só sobre a página carregada.
   */
  async list(filter: SalesFilter = 'todas', search = ''): Promise<Sale[]> {
    let query = supabase
      .from(VIEW)
      .select('*')
      .order('granted_at', { ascending: false })
      .limit(PAGE_SIZE);

    if (filter === 'ativas' || filter === 'atencao' || filter === 'sem_conta') {
      query = query.eq('is_active', true);
    }
    if (filter === 'encerradas') {
      query = query.eq('is_active', false);
    }

    const termo = search.trim().toLowerCase();
    if (termo) {
      // Só e-mail: é o que o cliente informa no atendimento, e a busca por
      // nome exigiria varrer o join de profiles sem índice.
      query = query.ilike('email', `%${termo.replace(/[%_]/g, '')}%`);
    }

    const { data: rows, error } = await query;
    if (error) throw new Error(error.message);

    const vendas = (rows ?? []).map(toSale);

    if (filter === 'atencao') return vendas.filter(precisaDeAtencao);
    if (filter === 'sem_conta') return vendas.filter((v) => !v.userId);
    return vendas;
  },

  async summary(): Promise<SalesSummary> {
    // A base de compradores é pequena no começo e estas contas precisam ser
    // verdadeiras, não amostrais: uma venda travada que não aparece no contador
    // é uma pessoa que pagou e ficou sem produto sem ninguém saber.
    const { data: rows, error } = await supabase
      .from(VIEW)
      .select('id, user_id, is_active, access_email_sent_at, access_email_error');

    if (error) throw new Error(error.message);

    const vendas = (rows ?? []) as Array<
      Pick<SaleRow, 'id' | 'user_id' | 'is_active' | 'access_email_sent_at' | 'access_email_error'>
    >;

    return {
      total: vendas.length,
      ativas: vendas.filter((v) => v.is_active).length,
      atencao: vendas.filter(
        (v) => v.is_active && !v.user_id && (!v.access_email_sent_at || !!v.access_email_error),
      ).length,
      semConta: vendas.filter((v) => v.is_active && !v.user_id).length,
    };
  },
};
