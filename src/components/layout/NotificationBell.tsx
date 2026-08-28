import React from 'react';
import { Bell } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface NotificationBellProps {
  /**
   * Quantidade de notificações não lidas. A badge só aparece quando > 0.
   *
   * Ainda não existe fonte de notificações no projeto (nenhum serviço, tabela
   * ou query), por isso o padrão é 0. Antes a bolinha vermelha estava fixa no
   * JSX, sem estado algum: aparecia sempre, o clique avisava "Sem notificações
   * novas" e ela continuava lá. Quando houver a fonte real, basta passar a
   * contagem por aqui — a badge passa a ligar e desligar sozinha.
   */
  count?: number;
  className?: string;
  iconClassName?: string;
  /** Posição da badge, que difere entre o header mobile e o desktop. */
  badgeClassName?: string;
}

const NotificationBell: React.FC<NotificationBellProps> = ({
  count = 0,
  className,
  iconClassName,
  badgeClassName,
}) => {
  const hasUnread = count > 0;
  const label = hasUnread
    ? `Notificações (${count} não ${count === 1 ? 'lida' : 'lidas'})`
    : 'Notificações — nenhuma nova';

  return (
    <button
      onClick={() =>
        toast.info(
          hasUnread
            ? `Você tem ${count} ${count === 1 ? 'notificação nova' : 'notificações novas'}`
            : 'Sem notificações novas',
        )
      }
      aria-label={label}
      title={label}
      className={cn('relative transition-colors duration-200', className)}
    >
      <Bell className={iconClassName} aria-hidden="true" />
      {hasUnread && (
        <span
          className={cn('absolute w-2 h-2 rounded-full bg-danger ring-2 ring-background', badgeClassName)}
          aria-hidden="true"
        />
      )}
    </button>
  );
};

export default NotificationBell;
