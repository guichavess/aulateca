import { supabase } from '@/integrations/supabase/client';

// Único backend HTTP próprio: o microsserviço de IA (FastAPI). Todo o resto
// (auth, recursos, favoritos, comunidade, admin) fala direto com o Supabase.
const FASTAPI_URL = import.meta.env.VITE_AI_URL || 'http://localhost:8000';

// Lê o access_token da sessão corrente do Supabase — sempre fresco,
// inclusive após refresh automático.
async function getToken(): Promise<string | null> {
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token ?? null;
}

export { FASTAPI_URL, getToken };
