import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAccess } from '@/hooks/useAccess';
import RouteFallback from '@/components/layout/RouteFallback';

/**
 * Barra quem está logado mas não tem acesso pago.
 *
 * Enquanto `isLoading`, mostra o fallback em vez do paywall: acusar de
 * caloteiro quem acabou de pagar, por causa de meio segundo de consulta, é o
 * pior erro possível nesta tela — o próprio `useAccess` documenta isso.
 *
 * Este gate é de experiência, não de segurança: quem protege os dados são as
 * policies da migration 015. Sem ele, quem não pagou veria o app inteiro vazio,
 * sem entender o porquê.
 */
const PaidGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { hasAccess, isLoading } = useAccess();
  if (isLoading) return <RouteFallback />;
  if (!hasAccess) return <Navigate to="/acesso" replace />;
  return <>{children}</>;
};

export default PaidGuard;
