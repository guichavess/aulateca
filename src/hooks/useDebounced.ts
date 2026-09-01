import { useEffect, useState } from 'react';

/**
 * Segura um valor até ele parar de mudar.
 *
 * Na busca isso é a diferença entre uma consulta ao Supabase e onze: sem freio,
 * digitar "produção textual" dispara uma requisição por tecla, e as respostas
 * ainda chegam fora de ordem — a grade pisca resultados de termos já apagados.
 */
export function useDebounced<T>(valor: T, ms = 300): T {
  const [atrasado, setAtrasado] = useState(valor);

  useEffect(() => {
    const t = setTimeout(() => setAtrasado(valor), ms);
    return () => clearTimeout(t);
  }, [valor, ms]);

  return atrasado;
}
