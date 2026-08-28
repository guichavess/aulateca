import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '@/lib/context';
import { authService } from '@/services/auth.service';
import { AuthErrorPtBr, traduzErroAuth } from '@/lib/authErrors';
import AuthAlert from '@/components/auth/AuthAlert';
import { authButtonClass, authInputClass, authLabelClass } from '@/components/auth/authStyles';
import FloatingOrbs from '@/components/layout/FloatingOrbs';
import TecaMascot from '@/components/brand/TecaMascot';
import loginBg from '@/assets/login-bg.png';

// A view 'register' saiu junto com o signup público: quem ainda não tem conta
// passa por /criar-acesso, que confere a compra antes de criar o usuário.
type AuthView = 'welcome' | 'login';

// Throttle local de tentativas de login/cadastro: camada de UX/defesa em
// profundidade, não o controle de verdade (isso é o rate limit nativo do
// Supabase Auth no servidor). Bloqueia a força bruta ingênua feita pela UI e
// evita esgotar o limite do servidor com retries automáticos do usuário.
const RATE_LIMIT_KEY = 'auth_rate_limit';
const MAX_ATTEMPTS = 5;
const LOCKOUT_MS = 30_000;

interface RateLimitState { attempts: number; lockedUntil: number }

const readRateLimit = (): RateLimitState => {
  try {
    const raw = localStorage.getItem(RATE_LIMIT_KEY);
    if (!raw) return { attempts: 0, lockedUntil: 0 };
    const parsed = JSON.parse(raw);
    return { attempts: parsed.attempts ?? 0, lockedUntil: parsed.lockedUntil ?? 0 };
  } catch {
    return { attempts: 0, lockedUntil: 0 };
  }
};

const writeRateLimit = (state: RateLimitState) => {
  localStorage.setItem(RATE_LIMIT_KEY, JSON.stringify(state));
};

const LoginPage: React.FC = () => {
  const { login } = useApp();
  const [view, setView] = useState<AuthView>('welcome');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  // Guarda o erro TIPADO, não a string: é o `sugestao` dele que decide qual
  // saída a caixa oferece, sem ninguém fazer string-matching de mensagem.
  const [error, setError] = useState<AuthErrorPtBr | null>(null);
  const [info, setInfo] = useState('');
  const [loading, setLoading] = useState(false);
  const [rateLimit, setRateLimit] = useState<RateLimitState>(() => readRateLimit());
  const [now, setNow] = useState(() => Date.now());

  const isLocked = rateLimit.lockedUntil > now;
  const remainingSeconds = Math.max(0, Math.ceil((rateLimit.lockedUntil - now) / 1000));

  useEffect(() => {
    if (!isLocked) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [isLocked]);

  // A política de senha NÃO é aplicada aqui: no login a senha é a que a pessoa
  // já tem, e barrar por regra nova trancaria quem se cadastrou sob a antiga.
  // Onde ela vale é em /criar-acesso e /redefinir-senha.

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfo('');

    const current = readRateLimit();
    if (current.lockedUntil > Date.now()) {
      setRateLimit(current);
      return;
    }

    setLoading(true);
    try {
      const result = await authService.login(email, password);
      writeRateLimit({ attempts: 0, lockedUntil: 0 });
      setRateLimit({ attempts: 0, lockedUntil: 0 });
      login(result.token, result.user);
    } catch (err) {
      const attempts = current.attempts + 1;
      const lockedUntil = attempts >= MAX_ATTEMPTS ? Date.now() + LOCKOUT_MS : 0;
      const next: RateLimitState = { attempts: lockedUntil ? 0 : attempts, lockedUntil };
      writeRateLimit(next);
      setRateLimit(next);
      // No bloqueio o erro fica nulo de propósito: quem avisa é a caixa de
      // `isLocked`, com o contador vivo. Antes as duas apareciam juntas.
      setError(lockedUntil ? null : traduzErroAuth(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row relative overflow-hidden" style={{ background: '#0A0A12' }}>
      <div className="absolute inset-0 z-0">
        <img src={loginBg} alt="" className="w-full h-full object-cover opacity-15" />
      </div>
      <FloatingOrbs />

      {/* Left Branding Panel — fundo escuro, tipografia clara explícita
          (os tokens de tema são pensados para fundo claro e ficariam ilegíveis aqui). */}
      <div className="hidden lg:flex flex-col justify-center flex-[3] px-16 xl:px-24 relative z-10">
        <div className="animate-slide-up" style={{ animationDelay: '0s' }}>
          <div className="flex items-center gap-3 mb-10">
            <TecaMascot alt="Aulateca" className="w-12 h-12" />
            <div>
              <span className="font-fredoka text-[28px] font-bold text-white drop-shadow-sm">Aulateca</span>
              <p className="text-[11px] tracking-[0.3em] uppercase text-white/70 font-semibold">Hub Educacional</p>
            </div>
          </div>
        </div>

        <h1
          className="font-fredoka text-[44px] leading-tight font-bold mb-6 animate-slide-up"
          style={{
            animationDelay: '0.06s',
            backgroundImage: 'linear-gradient(135deg, #ffffff 0%, #f5f3ff 40%, hsl(var(--brand-purple)) 100%)',
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            color: 'transparent',
          }}
        >
          Transforme suas aulas de produção de texto
        </h1>

        <p className="text-white/80 text-lg mb-12 max-w-md leading-relaxed animate-slide-up" style={{ animationDelay: '0.12s' }}>
          Mais de 226 atividades de produção textual e interpretação, prontas para imprimir e levar para a sala.
        </p>
      </div>

      {/* Right Auth Panel */}
      <div className="flex-1 lg:flex-[2] flex items-center justify-center p-4 sm:p-8 relative z-10">
        <div className="glass-card p-8 w-full max-w-md animate-slide-up" style={{ animationDelay: '0.12s' }}>
          {view === 'welcome' && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <div className="lg:hidden flex items-center justify-center gap-3 mb-6">
                  <TecaMascot size="sm" alt="Aulateca" />
                  <span className="font-fredoka text-2xl font-bold text-foreground">Aulateca</span>
                </div>
                <h2 className="font-fredoka text-h2 font-bold text-foreground">Bem-vindo(a) de volta!</h2>
                <p className="text-muted-foreground mt-2">Acesse sua conta para continuar</p>
              </div>
              <button onClick={() => setView('login')} className={authButtonClass}>
                Entrar com e-mail
              </button>
              {/* Não existe mais "criar conta grátis": o signup público está
                  desligado e a conta só nasce depois da compra. O que fica no
                  lugar é o caminho de quem pagou e ainda não entrou. */}
              <p className="text-center text-muted-foreground text-sm">
                Comprou e ainda não tem acesso?{' '}
                <Link to="/criar-acesso" className="text-primary font-semibold hover:underline">
                  Criar meu acesso
                </Link>
              </p>
            </div>
          )}

          {view === 'login' && (
            <form onSubmit={handleSubmit} className="space-y-5">
              <button type="button" onClick={() => setView('welcome')} className="text-muted-foreground text-sm hover:text-foreground transition-colors">
                ← Voltar
              </button>
              <h2 className="font-fredoka text-h2 font-bold text-foreground">Entrar na sua conta</h2>
              {info && <AuthAlert variant="info" message={info} />}
              {error && (
                <AuthAlert message={error.message}>
                  {error.sugestao === 'recuperar_senha' && (
                    <Link to="/recuperar-senha" className="underline font-semibold">
                      Recuperar minha senha
                    </Link>
                  )}
                  {error.sugestao === 'login' && (
                    <Link to="/criar-acesso" className="underline font-semibold">
                      Criar meu acesso
                    </Link>
                  )}
                </AuthAlert>
              )}
              <div className="space-y-4">
                <div>
                  <label htmlFor="login-email" className={authLabelClass}>E-mail</label>
                  <input
                    id="login-email"
                    type="email"
                    autoComplete="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    className={authInputClass}
                  />
                </div>
                <div>
                  <label htmlFor="login-senha" className={authLabelClass}>Senha</label>
                  <input
                    id="login-senha"
                    type="password"
                    autoComplete="current-password"
                    placeholder="••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    className={authInputClass}
                  />
                </div>
              </div>
              {isLocked && (
                <AuthAlert
                  variant="aviso"
                  message={`Muitas tentativas seguidas. Tente novamente em ${remainingSeconds}s.`}
                />
              )}
              <button type="submit" disabled={loading || isLocked} className={authButtonClass}>
                {loading ? 'Entrando...' : 'Entrar →'}
              </button>
              <p className="text-center text-sm text-muted-foreground">
                <Link to="/recuperar-senha" className="text-primary hover:underline">
                  Esqueceu a senha?
                </Link>
              </p>
            </form>
          )}

        </div>
      </div>
    </div>
  );
};

export default LoginPage;
