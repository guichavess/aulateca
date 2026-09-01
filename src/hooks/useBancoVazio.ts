import { useQuery } from '@tanstack/react-query';
import { resourcesService } from '@/services/resources.service';

/**
 * Sonda sem filtro nenhum: "o banco está vazio?" — e não "este filtro não
 * achou nada?".
 *
 * A distinção é a diferença entre um acervo de demonstração e uma mentira. As
 * telas decidiam o fallback pelo resultado **filtrado**, então qualquer
 * combinação de categoria e faixa sem resultado no banco real fazia os recursos
 * fictícios reaparecerem: a pessoa filtrava e via material que não existe.
 *
 * A HomePage já tinha corrigido isso sozinha; Explorar, Categoria e Favoritos
 * herdaram o bug. Agora a correção mora em um lugar só.
 */
export function useBancoVazio() {
  const { data, isLoading } = useQuery({
    queryKey: ['resources', 'probe'],
    queryFn: () => resourcesService.fetchAll({ limit: 1 }),
    staleTime: 5 * 60 * 1000,
  });

  return {
    // `false` enquanto carrega: na dúvida, NÃO mostrar o acervo fictício.
    bancoVazio: !isLoading && data?.total === 0,
    sondando: isLoading,
  };
}
