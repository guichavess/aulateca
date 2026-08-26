import { useQuery } from '@tanstack/react-query';
import { useApp } from '@/lib/context';
import { accessService, NO_ACCESS, type AccessStatus } from '@/services/access.service';

export const ACCESS_QUERY_KEY = 'access-status';

export interface UseAccessResult extends AccessStatus {
  /**
   * Enquanto true, `hasAccess` ainda não significa nada. Quem for barrar tela
   * precisa esperar: renderizar o paywall durante o carregamento acusaria de
   * caloteiro justamente quem acabou de pagar.
   */
  isLoading: boolean;
  isError: boolean;
  refetch: () => void;
}

/**
 * Acesso pago do usuário logado, alimentado pelo webhook da Cakto.
 *
 * ADMIN entra sem compra — a regra é a mesma do `public.has_active_access()`
 * no banco, e está nos dois lugares porque o gate visual não pode divergir da
 * policy que protege os dados.
 */
export function useAccess(): UseAccessResult {
  const { isLoggedIn, user } = useApp();

  const query = useQuery({
    queryKey: [ACCESS_QUERY_KEY, user?.id ?? null],
    queryFn: () => accessService.fetchStatus(),
    enabled: isLoggedIn,
    // A liberação vem de um webhook externo: se a pessoa está esperando o Pix
    // cair, o dado envelhece rápido. 30s é curto o bastante para o acesso
    // aparecer sozinho e longo o bastante para não virar polling.
    staleTime: 30_000,
  });

  const status = query.data ?? NO_ACCESS;
  const isAdmin = user?.role === 'ADMIN';

  return {
    ...status,
    hasAccess: isAdmin || status.hasAccess,
    isLoading: isLoggedIn && query.isPending,
    isError: query.isError,
    refetch: () => void query.refetch(),
  };
}
