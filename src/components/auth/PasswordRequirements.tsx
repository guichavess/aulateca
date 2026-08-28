import React from 'react';
import { Check, X } from 'lucide-react';
import { checkPassword, passwordStrength, type PasswordContext } from '@/lib/password';
import { cn } from '@/lib/utils';

interface PasswordRequirementsProps {
  password: string;
  context?: PasswordContext;
  className?: string;
}

const BAR_COLOR = ['bg-border', 'bg-danger', 'bg-sun', 'bg-success', 'bg-success-deep'];

/**
 * Checklist ao vivo da política de senha.
 *
 * Mostrar as regras enquanto a pessoa digita, em vez de recusar depois do
 * envio, é o que evita a dança de tentativa e erro — e é o que torna uma
 * política mais dura tolerável.
 */
const PasswordRequirements: React.FC<PasswordRequirementsProps> = ({
  password,
  context,
  className,
}) => {
  const rules = checkPassword(password, context);
  const { score, label } = passwordStrength(password, context);

  if (!password) return null;

  // Todas as superfícies que mostram este checklist são claras (card do
  // AuthShell e diálogo do perfil). Existiu um `tone="dark"` aqui enquanto o
  // card era escuro; virou armadilha quando o card clareou.
  const mutedClass = 'text-muted-foreground';
  const okClass = 'text-success-deep';

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center gap-2">
        <div
          className="flex gap-1 flex-1"
          role="meter"
          aria-valuenow={score}
          aria-valuemin={0}
          aria-valuemax={4}
          aria-label={`Força da senha: ${label || 'não avaliada'}`}
        >
          {[1, 2, 3, 4].map((step) => (
            <span
              key={step}
              className={cn(
                'h-1.5 flex-1 rounded-full transition-colors duration-200',
                step <= score ? BAR_COLOR[score] : 'bg-border',
              )}
            />
          ))}
        </div>
        {label && <span className={cn('text-xs font-semibold', mutedClass)}>{label}</span>}
      </div>

      <ul className="space-y-1" aria-live="polite">
        {rules.map((rule) => (
          <li
            key={rule.id}
            className={cn('flex items-start gap-1.5 text-xs', rule.ok ? okClass : mutedClass)}
          >
            {rule.ok ? (
              <Check className="w-3.5 h-3.5 shrink-0 mt-px" aria-hidden="true" />
            ) : (
              <X className="w-3.5 h-3.5 shrink-0 mt-px" aria-hidden="true" />
            )}
            {rule.label}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PasswordRequirements;
