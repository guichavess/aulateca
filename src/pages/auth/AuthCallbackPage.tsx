import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/lib/context';
import FloatingOrbs from '@/components/layout/FloatingOrbs';

// Destino do redirectTo do OAuth (ver authService.loginWithGoogle). O SDK do
// Supabase troca o "code" da URL pela sessão automaticamente (PKCE,
// detectSessionInUrl: true) — esta tela só espera esse processo terminar e
// trata os dois desfechos possíveis: sucesso (AppProvider detecta a sessão) ou
// erro (o provedor devolve ?error_description= na querystring).
const TIMEOUT_MS = 8000;

const AuthCallbackPage: React.FC = () => {
  const { isLoggedIn } = useApp();
  const navigate = useNavigate();
  const [timedOut, setTimedOut] = useState(false);

  const params = new URLSearchParams(window.location.search);
  const oauthError = params.get('error_description') || params.get('error');

  useEffect(() => {
    if (isLoggedIn) {
      navigate('/', { replace: true });
    }
  }, [isLoggedIn, navigate]);

  useEffect(() => {
    if (oauthError) return;
    const timer = setTimeout(() => setTimedOut(true), TIMEOUT_MS);
    return () => clearTimeout(timer);
  }, [oauthError]);

  const failed = Boolean(oauthError) || timedOut;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden" style={{ background: '#0A0A12' }}>
      <FloatingOrbs />
      <div className="glass-card p-8 max-w-sm w-full text-center relative z-10 space-y-4">
        {failed ? (
          <>
            <h2 className="font-fredoka text-xl font-bold text-foreground">Não foi possível autenticar</h2>
            <p className="text-sm text-muted-foreground">
              {oauthError ?? 'A autenticação demorou mais que o esperado.'}
            </p>
            <button
              onClick={() => navigate('/', { replace: true })}
              className="w-full py-3 rounded-xl font-semibold text-primary-foreground btn-primary-glow"
            >
              Voltar para o login
            </button>
          </>
        ) : (
          <>
            <div className="mx-auto w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
            <p className="text-sm text-muted-foreground">Autenticando…</p>
          </>
        )}
      </div>
    </div>
  );
};

export default AuthCallbackPage;
