import { supabase } from '@/integrations/supabase/client';

/**
 * Acesso pago do usuário — a ponta do funil que começa na Cakto.
 *
 * As linhas de `cakto_entitlements` são escritas EXCLUSIVAMENTE pela Edge
 * Function `cakto-webhook` com a service_role. Daqui só se lê: não existe
 * policy de escrita para o usuário, então nem um cliente adulterado libera
 * acesso sem venda.
 */

export type EntitlementKind = 'unique' | 'subscription';
export type EntitlementStatus = 'active' | 'canceled' | 'revoked' | 'expired';

export interface Entitlement {
  id: string;
  kind: EntitlementKind;
  status: EntitlementStatus;
  productName?: string;
  /** Referência curta do pedido na Cakto — é o que o suporte pede ao cliente. */
  refId?: string;
  grantedAt: string;
  /** Ausente = não expira (pagamento único). */
  expiresAt?: string;
  revokeReason?: string;
}

export interface AccessStatus {
  hasAccess: boolean;
  entitlements: Entitlement[];
  /** Vencimento mais distante entre os acessos válidos. Ausente = vitalício. */
  expiresAt?: string;
}

export const NO_ACCESS: AccessStatus = { hasAccess: false, entitlements: [] };

/**
 * Mesma regra do `public.has_active_access()` da migration 011, repetida aqui
 * só para a UI não precisar de um roundtrip extra. A decisão que VALE é a do
 * banco — quando um recurso pago existir, a policy dele chama a função SQL.
 *
 * `canceled` continua valendo até a data de fim: o cliente pagou o período
 * corrente e cancelou a renovação.
 */
export function isEntitlementActive(e: Entitlement, now: Date = new Date()): boolean {
  const naoVenceu = !e.expiresAt || new Date(e.expiresAt) > now;
  if (e.status === 'active') return naoVenceu;
  if (e.status === 'canceled') return !!e.expiresAt && new Date(e.expiresAt) > now;
  return false;
}

type Row = {
  id: string;
  kind: string;
  status: string;
  product_name: string | null;
  ref_id: string | null;
  granted_at: string;
  expires_at: string | null;
  revoke_reason: string | null;
};

export function toEntitlement(row: Row): Entitlement {
  return {
    id: row.id,
    kind: row.kind as EntitlementKind,
    status: row.status as EntitlementStatus,
    productName: row.product_name ?? undefined,
    refId: row.ref_id ?? undefined,
    grantedAt: row.granted_at,
    expiresAt: row.expires_at ?? undefined,
    revokeReason: row.revoke_reason ?? undefined,
  };
}

export function summarize(entitlements: Entitlement[], now: Date = new Date()): AccessStatus {
  const ativos = entitlements.filter((e) => isEntitlementActive(e, now));

  // Vitalício vence qualquer data: se um dos acessos válidos não expira, o
  // usuário não tem prazo — mostrar uma data neste caso seria mentira.
  const vitalicio = ativos.some((e) => !e.expiresAt);
  const maisDistante = ativos
    .map((e) => e.expiresAt)
    .filter((d): d is string => !!d)
    .sort()
    .pop();

  return {
    hasAccess: ativos.length > 0,
    entitlements,
    expiresAt: vitalicio ? undefined : maisDistante,
  };
}

export const accessService = {
  /**
   * Acessos do usuário logado. A RLS já filtra por user_id OU pelo e-mail do
   * JWT — o segundo caso cobre a compra feita antes de a conta existir, quando
   * o vínculo com o user_id ainda não aconteceu.
   */
  async fetchStatus(): Promise<AccessStatus> {
    const { data, error } = await supabase
      .from('cakto_entitlements')
      .select('id, kind, status, product_name, ref_id, granted_at, expires_at, revoke_reason')
      .order('granted_at', { ascending: false });

    if (error) throw new Error(error.message);
    return summarize((data ?? []).map(toEntitlement));
  },

  /**
   * Amarra ao usuário logado os acessos que estavam soltos no e-mail dele.
   * Os triggers da 011 já fazem isso nos dois fluxos normais; isto aqui é a
   * saída para o caso de borda (troca de e-mail da conta depois da compra) e
   * para um botão "já comprei, liberar meu acesso" no suporte.
   * Devolve quantos acessos foram vinculados.
   */
  async claim(): Promise<number> {
    const { data, error } = await supabase.rpc('claim_cakto_entitlements');
    if (error) throw new Error(error.message);
    return data ?? 0;
  },
};
