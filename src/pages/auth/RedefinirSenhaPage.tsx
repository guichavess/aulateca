import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useApp } from '@/lib/context';
import { authService } from '@/services/auth.service';
import { isPasswordAcceptable, PASSWORD_MIN_LENGTH } from '@/lib/password';
import PasswordRequirements from '@/components/auth/PasswordRequirements';
import AuthShell from '@/components/auth/AuthShell';
import { authButtonClass, authInputClass, authLabelClass } from '@/components/auth/authStyles';
import AuthAlert from '@/components/auth/AuthAlert';

/**
 * Destino do link de recuperação.
 *
 * Quando esta tela aparece, a pessoa JÁ ESTÁ logada: o link PKCE cria a sessão
 * antes de qualquer digitação. Quem segura ela aqui é `isRecoveringPassword`
 * no contexto — sem isso, o roteador a mandaria direto para o app, com a senha
 * antiga e sem nunca ver este formulário.
 *
 * A flag só cai depois do `updateUser` bem-sucedido, e é `finishPasswordRecovery`
 * quem a derruba.
 */
const RedefinirSenhaPage: React.FC = () => {
  const { user, isLoggedIn, finishPasswordRecovery } = useApp();
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const passwordOk = isPasswordAcceptable(password, { email: user?.email, name: user?.name });
  const iguais = password.length > 0 && password === confirm;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!iguais) {
      setError('As duas senhas precisam ser iguais.');
      return;
    }

    setLoading(true);
    try {
      await authService.completePasswordReset(password, user?.email);
      finishPasswordRecovery();
      toast.success('Senha alterada', { description: 'Você já está usando a senha nova.' });
      navigate('/', { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível alterar a senha.');
    } finally {
      setLoading(false);
    }
  };

  // Sem sessão o updateUser não teria o que autorizar. Acontece quando o link
  // expira (1 hora) ou já foi usado — dizer isso é melhor do que mostrar um
  // formulário que vai falhar no envio.
  if (!isLoggedIn) {
    return (
      <AuthShell
        title="Link expirado"
        subtitle="Este link de recuperação não vale mais. Eles duram 1 hora e só podem ser usados uma vez."
        footer={
          <Link to="/login" className="text-primary font-semibold hover:underline">
            ← Voltar para o login
          </Link>
        }
      >
        <Link
          to="/recuperar-senha"
          className={authButtonClass}
        >
          Pedir um novo link
        </Link>
      </AuthShell>
    );
  }

  return (
    <AuthShell title="Criar senha nova" subtitle="Escolha uma senha que você não use em outro site.">
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && <AuthAlert message={error} />}

        <div>
          <label htmlFor="ns-senha" className={authLabelClass}>
            Senha nova
          </label>
          <input
            id="ns-senha"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={PASSWORD_MIN_LENGTH}
            autoComplete="new-password"
            className={authInputClass}
          />
          <PasswordRequirements
            password={password}
            context={{ email: user?.email, name: user?.name }}
            className="mt-2"
          />
        </div>

        <div>
          <label htmlFor="ns-confirma" className={authLabelClass}>
            Repita a senha
          </label>
          <input
            id="ns-confirma"
            type="password"
            placeholder="••••••••"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
            autoComplete="new-password"
            className={authInputClass}
          />
          {confirm.length > 0 && !iguais && (
            <p className="text-xs text-muted-foreground mt-1.5">As duas senhas ainda estão diferentes.</p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading || !passwordOk || !iguais}
          className={authButtonClass}
        >
          {loading ? 'Salvando...' : 'Salvar e entrar →'}
        </button>
      </form>
    </AuthShell>
  );
};

export default RedefinirSenhaPage;
