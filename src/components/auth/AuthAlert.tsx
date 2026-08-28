import React from 'react';
import { AlertCircle, Clock, Info } from 'lucide-react';

export type AuthAlertVariant = 'erro' | 'aviso' | 'info';

/**
 * Alerta-adesivo das telas de autenticação.
 *
 * Substitui o `authErrorClass` e as caixas soltas com `text-red-400` /
 * `sky-300` / `amber-300`: cores claras herdadas de quando o card era escuro.
 * Hoje o card é branco (`.sticker-surface`), e aquilo virava texto claro sobre
 * fundo claro. Aqui a cor sai de token e o contraste é garantido.
 *
 * O desenho segue o mesmo vocabulário dos cards do app — borda de 2px, raio de
 * botão, sombra sólida — em vez do retângulo pastel genérico de antes. O ícone
 * vem dentro de um selo redondo com a mesma borda: é o detalhe que faz a caixa
 * ler como adesivo colado no papel, e não como alerta de sistema operacional.
 *
 * Cada variante traz um TÍTULO padrão curto em Fredoka. Ele existe para a
 * pessoa entender a natureza do problema antes de ler a frase inteira — e é
 * onde a voz da marca cabe, já que a mensagem em si precisa ser exata.
 *
 * `children` é a saída — o link de recuperar senha, de ir para o login — porque
 * erro de autenticação sem próximo passo deixa a pessoa parada na tela.
 */
const VARIANTES: Record<
  AuthAlertVariant,
  { classes: string; selo: string; shadow: string; titulo: string; Icon: typeof AlertCircle }
> = {
  erro: {
    classes: 'bg-danger/10 border-danger/40 text-danger-deep',
    selo: 'bg-danger/15 border-danger/40',
    shadow: '0 3px 0 0 hsl(var(--danger) / 0.3)',
    titulo: 'Quase lá',
    Icon: AlertCircle,
  },
  // Amarelo com texto branco reprova contraste (a mesma armadilha que o
  // index.css documenta no --sun), então o texto do aviso é tinta.
  aviso: {
    classes: 'bg-sun/20 border-sun text-ink',
    selo: 'bg-sun/40 border-sun',
    shadow: '0 3px 0 0 hsl(var(--sun) / 0.55)',
    titulo: 'Um instante',
    Icon: Clock,
  },
  // `teca` e não `sky`: o token da marca no Tailwind se chama assim, para não
  // colidir com a escala sky-* do Tailwind já usada no admin.
  info: {
    classes: 'bg-teca/10 border-teca/40 text-teca-deep',
    selo: 'bg-teca/15 border-teca/40',
    shadow: '0 3px 0 0 hsl(var(--sky) / 0.3)',
    titulo: 'Aviso',
    Icon: Info,
  },
};

interface AuthAlertProps {
  variant?: AuthAlertVariant;
  /** Sobrescreve o título padrão da variante. `null` esconde o título. */
  title?: string | null;
  message: string;
  children?: React.ReactNode;
  className?: string;
}

const AuthAlert: React.FC<AuthAlertProps> = ({
  variant = 'erro',
  title,
  message,
  children,
  className = '',
}) => {
  const { classes, selo, shadow, titulo, Icon } = VARIANTES[variant];
  const tituloFinal = title === undefined ? titulo : title;

  return (
    <div
      role="alert"
      // `animate-slide-up` já é neutralizado por prefers-reduced-motion no
      // index.css — o alerta aparece na hora para quem pediu menos movimento.
      className={`flex gap-3 border-2 p-3 text-sm animate-slide-up ${classes} ${className}`}
      style={{ borderRadius: 'var(--radius-button)', boxShadow: shadow }}
    >
      <span
        aria-hidden="true"
        className={`w-7 h-7 shrink-0 flex items-center justify-center border-2 rounded-full ${selo}`}
      >
        <Icon className="w-4 h-4" />
      </span>
      <div className="space-y-1 min-w-0">
        {tituloFinal && (
          <p className="font-fredoka font-bold leading-snug">{tituloFinal}</p>
        )}
        <p className="leading-snug">{message}</p>
        {children && <div className="pt-0.5">{children}</div>}
      </div>
    </div>
  );
};

export default AuthAlert;
