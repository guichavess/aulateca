import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CircleUser, LogOut, Shield } from 'lucide-react';
import { useApp } from '@/lib/context';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

interface UserMenuProps {
  className?: string;
}

/**
 * Avatar do header com menu de conta.
 *
 * Antes o avatar chamava `logout` direto no clique: quem clicava esperando o
 * próprio perfil era desconectado e jogado na tela de login, sem confirmação e
 * sem caminho de volta. Agora o clique abre um menu, e "Sair" é uma escolha
 * explícita.
 */
const UserMenu: React.FC<UserMenuProps> = ({ className }) => {
  const { user, userName, logout } = useApp();
  const navigate = useNavigate();
  const [avatarFailed, setAvatarFailed] = React.useState(false);
  const avatarUrl = avatarFailed ? undefined : user?.avatarUrl;

  const initials = userName
    ? userName.split(' ').filter(Boolean).map((w) => w[0]).slice(0, 2).join('').toUpperCase()
    : 'PT';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          aria-label={`Conta de ${userName || 'usuário'}`}
          className={cn(
            'w-8 h-8 rounded-full bg-accent text-accent-foreground flex items-center justify-center text-[11px] font-bold overflow-hidden border-2 border-border hover:border-primary transition-colors duration-200',
            className,
          )}
        >
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt=""
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
              onError={() => setAvatarFailed(true)}
            />
          ) : (
            initials
          )}
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="font-normal">
          <p className="font-fredoka text-sm font-bold text-ink truncate">
            {userName || 'Professor(a)'}
          </p>
          {user?.email && (
            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        <DropdownMenuItem onSelect={() => navigate('/profile')}>
          <CircleUser className="w-4 h-4" aria-hidden="true" />
          Meu perfil
        </DropdownMenuItem>

        {user?.role === 'ADMIN' && (
          <DropdownMenuItem onSelect={() => navigate('/admin')}>
            <Shield className="w-4 h-4" aria-hidden="true" />
            Painel administrativo
          </DropdownMenuItem>
        )}

        <DropdownMenuSeparator />
        <DropdownMenuItem
          onSelect={logout}
          className="text-danger focus:text-danger focus:bg-danger/10"
        >
          <LogOut className="w-4 h-4" aria-hidden="true" />
          Sair
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserMenu;
