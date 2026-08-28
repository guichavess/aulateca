import React from 'react';
import FloatingOrbs from '@/components/layout/FloatingOrbs';
import TecaMascot from '@/components/brand/TecaMascot';
import loginBg from '@/assets/login-bg.png';

interface AuthShellProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  /** Linha de apoio abaixo do card (links de "voltar", ajuda). */
  footer?: React.ReactNode;
}

/**
 * Moldura das telas de autenticação — o fundo escuro, os orbs e o card de vidro
 * que a LoginPage já usava.
 *
 * Extraído quando as telas de acesso pago (criar acesso, recuperar e redefinir
 * senha, acesso encerrado) passaram a ser quatro: copiar o mesmo cabeçalho
 * cinco vezes é como um dos cinco fica para trás no próximo ajuste visual.
 *
 * Atenção ao contraste: há DOIS fundos aqui. Fora do card o fundo é #0A0A12 e
 * o texto é branco explícito; dentro do card, que é claro (`.glass-card` hoje é
 * `.sticker-surface`, com `background: hsl(var(--card))`), o texto vem dos
 * tokens de tema. Trocar os dois lados é o que deixou as telas de acesso
 * ilegíveis — texto branco sobre card branco. Ver `authStyles.ts`.
 */
const AuthShell: React.FC<AuthShellProps> = ({ title, subtitle, children, footer }) => (
  <div
    className="min-h-screen flex items-center justify-center relative overflow-hidden p-4 sm:p-8"
    style={{ background: '#0A0A12' }}
  >
    <div className="absolute inset-0 z-0">
      <img src={loginBg} alt="" className="w-full h-full object-cover opacity-15" />
    </div>
    <FloatingOrbs />

    <div className="w-full max-w-md relative z-10">
      <div className="flex items-center justify-center gap-3 mb-8">
        <TecaMascot size="sm" />
        <span className="font-fredoka text-2xl font-bold text-white">Aulateca</span>
      </div>

      <div className="glass-card p-8 animate-slide-up">
        <div className="mb-6">
          <h1 className="font-fredoka text-h1 font-bold text-foreground">{title}</h1>
          {subtitle && <p className="text-muted-foreground mt-2 text-sm leading-relaxed">{subtitle}</p>}
        </div>
        {children}
      </div>

      {footer && <div className="mt-6 text-center text-sm text-white/60">{footer}</div>}
    </div>
  </div>
);

export default AuthShell;
