import React, { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useApp } from '@/lib/context';
import { authService } from '@/services/auth.service';
import { CreateAccessError } from '@/lib/authErrors';
import { isPasswordAcceptable, PASSWORD_MIN_LENGTH } from '@/lib/password';
import PasswordRequirements from '@/components/auth/PasswordRequirements';
import AuthShell from '@/components/auth/AuthShell';
import { authButtonClass, authInputClass, authLabelClass } from '@/components/auth/authStyles';
import AuthAlert from '@/components/auth/AuthAlert';

const ROLES = [
  { id: 'teacher', label: 'Professor(a)' },
  { id: 'parent', label: 'Pai/Mãe' },
  { id: 'therapist', label: 'Terapeuta' },
];

/**
 * Decodifica o `?e=` do link do e-mail (base64url do e-mail, montado em
 * `supabase/functions/cakto-webhook/email.ts`).
 *
 * O parâmetro só pré-preenche o campo — quem decide se há acesso é a Edge
 * Function, conferindo o entitlement. Por isso um valor adulterado aqui não
 * concede nada: no máximo faz a pessoa ver "não encontramos uma compra".
 */
function decodeEmailParam(raw: string | null): string {
  if (!raw) return '';
  try {
    const base64 = raw.replace(/-/g, '+').replace(/_/g, '/');
    const email = atob(base64.padEnd(Math.ceil(base64.length / 4) * 4, '='));
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) ? email : '';
  } catch {
    return '';
  }
}

/**
 * Onde o comprador vira usuário.
 *
 * A página é pública de propósito: o gate é a compra, não o segredo da URL.
 * Ela também precisa funcionar SEM parâmetro nenhum — não está confirmado que
 * a Cakto repassa o e-mail no redirect, e quem chega pelo e-mail com o link
 * quebrado ainda tem que conseguir digitar o endereço à mão.
 */
const CriarAcessoPage: React.FC = () => {
  const { login } = useApp();
  const [params] = useSearchParams();

  const emailDoLink = useMemo(() => decodeEmailParam(params.get('e')), [params]);
  const [email, setEmail] = useState(emailDoLink);
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('teacher');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [errorCode, setErrorCode] = useState<string>('');

  const passwordOk = isPasswordAcceptable(password, { email, name });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setErrorCode('');
    setLoading(true);
    try {
      const { token, user } = await authService.createAccess({
        name,
        email,
        password,
        roleKey: role,
      });
      login(token, user);
    } catch (err) {
      if (err instanceof CreateAccessError) {
        setErrorCode(err.code);
        setError(err.message);
      } else {
        setError(err instanceof Error ? err.message : 'Não foi possível criar seu acesso.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Criar seu acesso"
      subtitle="Você comprou o Aulateca — falta só escolher sua senha. Use o mesmo e-mail do pagamento: é por ele que reconhecemos sua compra."
      footer={
        <>
          Já tem conta?{' '}
          <Link to="/login" className="text-primary font-semibold hover:underline">
            Entrar
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <AuthAlert message={error}>
            {errorCode === 'conta_existe' && (
              <p>
                <Link to="/login" className="underline font-semibold">
                  Ir para o login
                </Link>{' '}
                ou{' '}
                <Link to="/recuperar-senha" className="underline font-semibold">
                  recuperar a senha
                </Link>
                .
              </p>
            )}
          </AuthAlert>
        )}

        <div>
          <label htmlFor="ca-email" className={authLabelClass}>
            E-mail da compra
          </label>
          <input
            id="ca-email"
            type="email"
            autoComplete="email"
            placeholder="seu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className={authInputClass}
          />
        </div>

        <div>
          <label htmlFor="ca-nome" className={authLabelClass}>
            Seu nome
          </label>
          <input
            id="ca-nome"
            type="text"
            autoComplete="name"
            placeholder="Maria Silva"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className={authInputClass}
          />
        </div>

        <div>
          <label htmlFor="ca-senha" className={authLabelClass}>
            Crie uma senha
          </label>
          <input
            id="ca-senha"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={PASSWORD_MIN_LENGTH}
            autoComplete="new-password"
            className={authInputClass}
          />
          <PasswordRequirements password={password} context={{ email, name }} className="mt-2" />
        </div>

        <div>
          <span className="text-sm font-medium text-muted-foreground mb-2 block">Eu sou</span>
          <div className="flex gap-2">
            {ROLES.map((r) => (
              <button
                key={r.id}
                type="button"
                aria-pressed={role === r.id}
                onClick={() => setRole(r.id)}
                className={`chip flex-1 justify-center text-center text-xs ${
                  role === r.id ? 'chip-active' : ''
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || !passwordOk}
          className={authButtonClass}
        >
          {loading ? 'Criando acesso...' : 'Criar acesso e entrar →'}
        </button>
      </form>
    </AuthShell>
  );
};

export default CriarAcessoPage;
