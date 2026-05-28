import { supabase } from '@/integrations/supabase/client';

const NESTJS_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
const FASTAPI_URL = import.meta.env.VITE_AI_URL || 'http://localhost:8000';

// Lê o access_token da sessão corrente do Supabase — sempre fresco,
// inclusive após refresh automático.
async function getToken(): Promise<string | null> {
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token ?? null;
}

async function authHeaders(): Promise<HeadersInit> {
  const token = await getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request<T>(url: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(await authHeaders()),
      ...options.headers,
    },
  });

  // 401: sessão inválida — derruba a sessão; o listener do AppProvider
  // reage a SIGNED_OUT e limpa estado/localStorage.
  if (res.status === 401) {
    await supabase.auth.signOut();
    throw new Error('Sessão expirada. Faça login novamente.');
  }

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: 'Erro inesperado' }));
    throw new Error(error.message || `HTTP ${res.status}`);
  }

  return res.json();
}

export const api = {
  get: <T>(path: string) => request<T>(`${NESTJS_URL}${path}`),
  post: <T>(path: string, body: unknown) =>
    request<T>(`${NESTJS_URL}${path}`, { method: 'POST', body: JSON.stringify(body) }),
  patch: <T>(path: string, body: unknown) =>
    request<T>(`${NESTJS_URL}${path}`, { method: 'PATCH', body: JSON.stringify(body) }),
  delete: <T>(path: string) =>
    request<T>(`${NESTJS_URL}${path}`, { method: 'DELETE' }),
};

export { FASTAPI_URL, getToken, authHeaders };
