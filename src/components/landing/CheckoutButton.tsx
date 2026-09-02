import React from 'react';
import { Link } from 'react-router-dom';
import { rastrearInicioDeCheckout } from '@/lib/rastreio';

/**
 * URL do checkout do produto na Cakto. Vem do ambiente porque muda entre a
 * oferta de teste e a de produção, e porque não é segredo nenhum — é o link
 * que a landing publica.
 */
export const CHECKOUT_URL: string = import.meta.env.VITE_CAKTO_CHECKOUT_URL ?? '';

if (!CHECKOUT_URL && import.meta.env.DEV) {
  // Sem esta variável em produção, o botão de compra não leva a lugar nenhum e
  // a landing deixa de vender. O aviso é em dev para aparecer antes do deploy.
  console.warn('VITE_CAKTO_CHECKOUT_URL não configurada — os CTAs da landing não levam ao checkout.');
}

interface CheckoutButtonProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * O CTA da landing.
 *
 * Antes apontava para `/`, que com a raiz protegida vira a tela de login: o
 * visitante que queria comprar acabava num formulário de entrar. Agora vai para
 * o checkout da Cakto — e, se a URL não estiver configurada, cai no login em
 * vez de virar um link morto.
 *
 * Todos os CTAs da landing passam por aqui (navbar, hero e card de oferta), o
 * que faz deste o único ponto onde o `InitiateCheckout` precisa ser disparado.
 * Um CTA novo que não use este componente sai do funil calado — se aparecer
 * um, ele vem para cá em vez de ganhar um `fbq` próprio.
 *
 * O rastreio não roda no caminho do `/login`: ali o visitante não está indo
 * comprar, está indo entrar, e contar isso como início de checkout sujaria o
 * funil com quem já é cliente.
 */
const CheckoutButton: React.FC<CheckoutButtonProps> = ({ children, className }) => {
  if (!CHECKOUT_URL) {
    return (
      <Link to="/login" className={className}>
        {children}
      </Link>
    );
  }

  return (
    <a href={CHECKOUT_URL} className={className} onClick={rastrearInicioDeCheckout}>
      {children}
    </a>
  );
};

export default CheckoutButton;
