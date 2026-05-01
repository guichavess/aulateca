const NESTJS_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
const FASTAPI_URL = import.meta.env.VITE_AI_URL || 'http://localhost:8000';

function getToken(): string | null {
  return localStorage.getItem('token');
}

function authHeaders(): HeadersInit {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request<T>(url: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders(),
      ...options.headers,
    },
  });

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
