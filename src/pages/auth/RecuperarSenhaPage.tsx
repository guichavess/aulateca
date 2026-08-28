import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { authService } from '@/services/auth.service';
import AuthShell from '@/components/auth/AuthShell';
import { authButtonClass, authInputClass, authLabelClass } from '@/components/auth/authStyles';

/**
 * Pedido de recuperação de senha.
 *
 * Antes disto, "Esqueceu a senha?" era um placebo: mostrava um toast de "em
 * breve" e mandava a pessoa procurar o suporte. Com a venda no ar, quem não
 * consegue entrar é um cliente pagante trancado do lado de fora.
 *
 * A resposta é sempre a mesma, exista ou não conta com aquele e-mail: aqui a
 * proteção contra enumeração não custa nada em usabilidade.
 */
const RecuperarSenhaPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [enviado, setEnviado] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await authService.requestPasswordReset(email);
    setLoading(false);
    setEnviado(true);
  };

  return (
    <AuthShell
      title="Recuperar senha"
      subtitle={
        enviado
          ? undefined
          : 'Informe o e-mail da sua conta. Enviaremos um link para você criar uma senha nova.'
      }
      footer={
        <Link to="/login" className="text-primary font-semibold hover:underline">
          ← Voltar para o login
        </Link>
      }
    >
      {enviado ? (
        <div className="space-y-4">
          <p className="text-sm text-foreground leading-relaxed">
            Se existir uma conta com <strong className="font-semibold">{email}</strong>, o link de
            recuperação já está a caminho. Ele vale por 1 hora.
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Não chegou em alguns minutos? Confira o spam e a lixeira, e verifique se digitou o
            mesmo e-mail que você usa para entrar.
          </p>
          <button
            type="button"
            onClick={() => setEnviado(false)}
            className="text-sm text-primary hover:underline"
          >
            Tentar com outro e-mail
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="rs-email" className={authLabelClass}>
              E-mail
            </label>
            <input
              id="rs-email"
              type="email"
              autoComplete="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className={authInputClass}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className={authButtonClass}
          >
            {loading ? 'Enviando...' : 'Enviar link de recuperação'}
          </button>
        </form>
      )}
    </AuthShell>
  );
};

export default RecuperarSenhaPage;
