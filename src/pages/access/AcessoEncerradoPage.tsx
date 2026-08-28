import React, { useState } from 'react';
import { toast } from 'sonner';
import { useApp } from '@/lib/context';
import { useAccess } from '@/hooks/useAccess';
import { accessService, isEntitlementActive, type Entitlement } from '@/services/access.service';
import AuthShell from '@/components/auth/AuthShell';
import { authButtonClass } from '@/components/auth/authStyles';

const CHECKOUT_URL = import.meta.env.VITE_CAKTO_CHECKOUT_URL ?? '';

interface Motivo {
  title: string;
  subtitle: string;
  /** Quando true, oferece o botão de vincular a compra ao e-mail da conta. */
  ofereceClaim: boolean;
}

/**
 * Traduz o estado dos entitlements em uma explicação honesta.
 *
 * Cada caso leva a uma ação diferente, e é por isso que não existe uma tela
 * genérica de "sem acesso": quem foi reembolsado precisa saber que foi
 * reembolsado, e quem comprou com outro e-mail precisa do botão que conserta
 * isso sozinho — não de um telefone do suporte.
 */
export function explicar(entitlements: Entitlement[], now: Date = new Date()): Motivo {
  const maisRecente = [...entitlements].sort((a, b) => b.grantedAt.localeCompare(a.grantedAt))[0];

  if (!maisRecente) {
    return {
      title: 'Não encontramos sua compra',
      subtitle:
        'Nenhuma compra está vinculada a este e-mail. Se você pagou usando outro endereço, dá para vincular agora.',
      ofereceClaim: true,
    };
  }

  if (maisRecente.status === 'revoked') {
    const chargeback = maisRecente.revokeReason === 'chargeback';
    return {
      title: chargeback ? 'Acesso suspenso' : 'Acesso encerrado pelo reembolso',
      subtitle: chargeback
        ? 'A compra foi contestada junto à operadora do cartão e o acesso ficou suspenso. Se isso não foi você, fale com a gente.'
        : 'Seu pagamento foi reembolsado, então o acesso foi encerrado. Sua conta continua aqui — se quiser voltar, é só assinar de novo.',
      ofereceClaim: false,
    };
  }

  const venceu = !isEntitlementActive(maisRecente, now);
  if (venceu && maisRecente.status === 'canceled') {
    return {
      title: 'Sua assinatura terminou',
      subtitle: 'O período que você pagou chegou ao fim. Para voltar ao acervo, é só reativar.',
      ofereceClaim: false,
    };
  }

  if (venceu) {
    return {
      title: 'Seu acesso venceu',
      subtitle:
        'Não identificamos a renovação. Se o pagamento acabou de sair, pode levar alguns minutos até cair aqui.',
      ofereceClaim: true,
    };
  }

  // Entitlement válido mas a tela apareceu: normalmente é o dado do app ainda
  // desatualizado logo depois da compra.
  return {
    title: 'Estamos liberando seu acesso',
    subtitle: 'Sua compra foi identificada. Atualize em alguns instantes para entrar.',
    ofereceClaim: true,
  };
}

/**
 * Tela de quem está logado mas não tem acesso pago.
 *
 * Existe porque bloquear sem explicar é o jeito mais rápido de transformar um
 * cliente em chamado de suporte — e porque o caso mais comum (comprou com um
 * e-mail, criou a conta com outro) o próprio usuário resolve em um clique.
 */
const AcessoEncerradoPage: React.FC = () => {
  const { user, logout } = useApp();
  const { entitlements, refetch, isLoading } = useAccess();
  const [vinculando, setVinculando] = useState(false);

  const motivo = explicar(entitlements);

  const handleClaim = async () => {
    setVinculando(true);
    try {
      const vinculados = await accessService.claim();
      refetch();
      if (vinculados > 0) {
        toast.success('Compra vinculada!', {
          description: 'Seu acesso foi liberado. Bem-vindo(a) de volta.',
        });
      } else {
        toast.info('Nenhuma compra encontrada', {
          description: `Não há compra registrada para ${user?.email ?? 'este e-mail'}.`,
        });
      }
    } catch (err) {
      toast.error('Não deu para verificar agora', {
        description: err instanceof Error ? err.message : 'Tente novamente em instantes.',
      });
    } finally {
      setVinculando(false);
    }
  };

  return (
    <AuthShell
      title={motivo.title}
      subtitle={motivo.subtitle}
      footer={
        <button type="button" onClick={logout} className="text-white/60 hover:text-white">
          Sair da conta
        </button>
      }
    >
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Conta: <span className="text-foreground font-medium">{user?.email}</span>
        </p>

        {motivo.ofereceClaim && (
          <button
            type="button"
            onClick={handleClaim}
            disabled={vinculando || isLoading}
            className={authButtonClass}
          >
            {vinculando ? 'Verificando...' : 'Já comprei — verificar meu acesso'}
          </button>
        )}

        {CHECKOUT_URL && (
          <a
            href={CHECKOUT_URL}
            className="block text-center w-full py-3.5 rounded-xl font-semibold border-2 border-border text-foreground hover:border-primary hover:text-primary transition-colors"
          >
            {motivo.ofereceClaim ? 'Comprar o Aulateca' : 'Assinar novamente'}
          </a>
        )}

        <button
          type="button"
          onClick={refetch}
          className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Atualizar
        </button>
      </div>
    </AuthShell>
  );
};

export default AcessoEncerradoPage;
