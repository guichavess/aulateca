import React, { useState } from 'react';
import { toast } from 'sonner';
import { useApp } from '@/lib/context';
import { authService } from '@/services/auth.service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

/**
 * Troca de e-mail — sempre atrás da senha atual.
 *
 * O Supabase aceitaria a troca só com a sessão aberta; exigir a senha impede
 * que quem encontre a máquina destravada mude o e-mail e tome a conta pelo
 * "esqueci minha senha".
 */
const ChangeEmailDialog: React.FC = () => {
  const { user } = useApp();
  const [open, setOpen] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);

  const reset = () => {
    setNewEmail('');
    setPassword('');
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const email = newEmail.trim().toLowerCase();
    if (!email) return;
    if (email === user.email.toLowerCase()) {
      toast.error('Este já é o seu e-mail atual');
      return;
    }
    setBusy(true);
    try {
      await authService.changeEmail(password, user.email, email);
      toast.success('Confirme nos dois e-mails', {
        description:
          'Enviamos um link para o endereço atual e para o novo. A troca só vale depois dos dois cliques.',
      });
      setOpen(false);
      reset();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Não foi possível trocar o e-mail');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (!o) reset();
      }}
    >
      <DialogTrigger asChild>
        <Button variant="sticker-outline" size="sm">
          Trocar e-mail
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={submit}>
          <DialogHeader>
            <DialogTitle className="font-fredoka">Trocar e-mail</DialogTitle>
            <DialogDescription>
              Você receberá um link de confirmação no endereço atual e no novo. Enquanto os dois
              não forem confirmados, o login continua com <strong>{user?.email}</strong>.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="new-email">Novo e-mail</Label>
              <Input
                id="new-email"
                type="email"
                required
                autoComplete="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                disabled={busy}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email-current-password">Sua senha atual</Label>
              <Input
                id="email-current-password"
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={busy}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setOpen(false)} disabled={busy}>
              Cancelar
            </Button>
            <Button type="submit" variant="sticker" disabled={busy}>
              {busy ? 'Enviando…' : 'Enviar confirmação'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ChangeEmailDialog;
