import React, { useState } from 'react';
import { toast } from 'sonner';
import { useApp } from '@/lib/context';
import { authService } from '@/services/auth.service';
import FloatingOrbs from '@/components/FloatingOrbs';
import mascot from '@/assets/mascot.png';
import loginBg from '@/assets/login-bg.png';

type AuthView = 'welcome' | 'login' | 'register';

const LoginPage: React.FC = () => {
  const { login } = useApp();
  const [view, setView] = useState<AuthView>('welcome');
  const [role, setRole] = useState('teacher');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setInfo('');
    setLoading(true);
    try {
      if (view === 'register') {
        const result = await authService.register(name, email, password, role);
        if (result.status === 'needs-confirmation') {
          setInfo(`Cadastro feito! Enviamos um e-mail para ${result.email}. Confirme para entrar.`);
          setPassword('');
          setView('login');
          return;
        }
        login(result.token, result.user);
      } else {
        const result = await authService.login(email, password);
        login(result.token, result.user);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao autenticar. Verifique seus dados.');
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
            <img src={mascot} alt="Aulateca mascot" className="w-12 h-12 rounded-xl object-cover" />
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
          Acesse recursos pedagógicos de produção textual para Ensino Fundamental, gere planos com a Teca e conecte-se com outros educadores.
        </p>

        <div className="flex gap-8 animate-slide-up" style={{ animationDelay: '0.18s' }}>
          {[
            { value: '2.400+', label: 'Recursos' },
            { value: '18.5k', label: 'Professores' },
            { value: '4.8', star: true, label: 'Avaliação' },
          ].map((stat) => (
            <div key={stat.label}>
              <div className="font-fredoka text-2xl font-bold text-white">
                {stat.value}{'star' in stat && <span className="text-amber-400">★</span>}
              </div>
              <div className="text-sm text-white/60">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Auth Panel */}
      <div className="flex-1 lg:flex-[2] flex items-center justify-center p-4 sm:p-8 relative z-10">
        <div className="glass-card p-8 w-full max-w-md animate-slide-up" style={{ animationDelay: '0.12s' }}>
          {view === 'welcome' && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <div className="lg:hidden flex items-center justify-center gap-3 mb-6">
                  <img src={mascot} alt="Aulateca mascot" className="w-10 h-10 rounded-xl object-cover" />
                  <span className="font-fredoka text-2xl font-bold text-foreground">Aulateca</span>
                </div>
                <h2 className="font-fredoka text-2xl font-bold text-foreground">Bem-vindo(a) de volta!</h2>
                <p className="text-muted-foreground mt-2">Acesse sua conta para continuar</p>
              </div>
              <button onClick={() => setView('login')} className="w-full py-3.5 rounded-xl font-semibold text-primary-foreground btn-primary-glow">
                Entrar com e-mail
              </button>
              <button
                onClick={() => toast.info('Login com Google em breve', { description: 'Use seu e-mail por enquanto.' })}
                className="w-full py-3.5 rounded-xl font-semibold text-foreground border border-border/50 hover:bg-secondary/50 transition-colors"
              >
                Entrar com Google
              </button>
              <p className="text-center text-muted-foreground text-sm">
                Não tem conta?{' '}
                <button onClick={() => setView('register')} className="text-primary font-semibold hover:underline">
                  Criar conta grátis
                </button>
              </p>
            </div>
          )}

          {view === 'login' && (
            <form onSubmit={handleSubmit} className="space-y-5">
              <button type="button" onClick={() => setView('welcome')} className="text-muted-foreground text-sm hover:text-foreground transition-colors">
                ← Voltar
              </button>
              <h2 className="font-fredoka text-2xl font-bold text-foreground">Entrar na sua conta</h2>
              {info && <p className="text-sm text-sky-300 bg-sky-400/10 rounded-lg px-3 py-2">{info}</p>}
              {error && <p className="text-sm text-red-400 bg-red-400/10 rounded-lg px-3 py-2">{error}</p>}
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-1.5 block">E-mail</label>
                  <input type="email" placeholder="seu@email.com" value={email} onChange={e => setEmail(e.target.value)} required className="w-full px-4 py-3 rounded-xl bg-secondary/50 border border-border/50 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" />
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-1.5 block">Senha</label>
                  <input type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required className="w-full px-4 py-3 rounded-xl bg-secondary/50 border border-border/50 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" />
                </div>
              </div>
              <button type="submit" disabled={loading} className="w-full py-3.5 rounded-xl font-semibold text-primary-foreground btn-primary-glow disabled:opacity-60">
                {loading ? 'Entrando...' : 'Entrar →'}
              </button>
              <p className="text-center text-sm text-muted-foreground">
                <button
                  type="button"
                  onClick={() => toast.info('Recuperação de senha em breve', { description: 'Contate o suporte se precisar acessar agora.' })}
                  className="text-primary hover:underline"
                >
                  Esqueceu a senha?
                </button>
              </p>
            </form>
          )}

          {view === 'register' && (
            <form onSubmit={handleSubmit} className="space-y-5">
              <button type="button" onClick={() => setView('welcome')} className="text-muted-foreground text-sm hover:text-foreground transition-colors">
                ← Voltar
              </button>
              <h2 className="font-fredoka text-2xl font-bold text-foreground">Criar sua conta</h2>
              {info && <p className="text-sm text-sky-300 bg-sky-400/10 rounded-lg px-3 py-2">{info}</p>}
              {error && <p className="text-sm text-red-400 bg-red-400/10 rounded-lg px-3 py-2">{error}</p>}
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-1.5 block">Nome completo</label>
                  <input type="text" placeholder="Maria Silva" value={name} onChange={e => setName(e.target.value)} required className="w-full px-4 py-3 rounded-xl bg-secondary/50 border border-border/50 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" />
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-1.5 block">E-mail</label>
                  <input type="email" placeholder="seu@email.com" value={email} onChange={e => setEmail(e.target.value)} required className="w-full px-4 py-3 rounded-xl bg-secondary/50 border border-border/50 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" />
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-1.5 block">Senha</label>
                  <input type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} className="w-full px-4 py-3 rounded-xl bg-secondary/50 border border-border/50 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-2 block">Eu sou</label>
                <div className="flex gap-2">
                  {[
                    { id: 'teacher', label: 'Professor(a)' },
                    { id: 'parent', label: 'Pai/Mãe' },
                    { id: 'therapist', label: 'Terapeuta' },
                  ].map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => setRole(r.id)}
                      className={`chip flex-1 text-center text-xs ${role === r.id ? 'chip-active text-primary-foreground' : 'text-muted-foreground'}`}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>
              <button type="submit" disabled={loading} className="w-full py-3.5 rounded-xl font-semibold text-primary-foreground btn-primary-glow disabled:opacity-60">
                {loading ? 'Criando conta...' : 'Criar minha conta →'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
