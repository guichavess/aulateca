import React, { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { useApp } from '@/lib/context';
import { authService } from '@/services/auth.service';
import { passwordProblems } from '@/lib/password';
import PasswordRequirements from '@/components/auth/PasswordRequirements';
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

const ChangePasswordDialog: React.FC = () => {
  const { user } = useApp();
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [busy, setBusy] = useState(false);

  const problems = useMemo(
    () => passwordProblems(next, { email: user?.email, name: user?.name }),
    [next, user?.email, user?.name],
  );
  const mismatch = confirm.length > 0 && next !== confirm;
  const canSubmit = !busy && current.length > 0 && problems.length === 0 && next === confirm;

  const reset = () => {
    setCurrent('');
    setNext('');
    setConfirm('');
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !canSubmit) return;
    if (next === current) {
      toast.error('A nova senha precisa ser diferente da atual');
      return;
    }
    setBusy(true);
    try {
      await authService.changePassword(current, user.email, next);
      toast.success('Senha alterada');
      setOpen(false);
      reset();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Não foi possível alterar a senha');
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
          Alterar senha
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={submit}>
          <DialogHeader>
            <DialogTitle className="font-fredoka">Alterar senha</DialogTitle>
            <DialogDescription>
              Confirmamos a senha atual antes de trocar — é o que impede alguém de assumir a conta
              num computador deixado aberto.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="current-password">Senha atual</Label>
              <Input
                id="current-password"
                type="password"
                required
                autoComplete="current-password"
                value={current}
                onChange={(e) => setCurrent(e.target.value)}
                disabled={busy}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="new-password">Nova senha</Label>
              <Input
                id="new-password"
                type="password"
                required
                autoComplete="new-password"
                value={next}
                onChange={(e) => setNext(e.target.value)}
                disabled={busy}
              />
              <PasswordRequirements
                password={next}
                context={{ email: user?.email, name: user?.name }}
                className="pt-1"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm-password">Repita a nova senha</Label>
              <Input
                id="confirm-password"
                type="password"
                required
                autoComplete="new-password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                disabled={busy}
                aria-invalid={mismatch}
              />
              {mismatch && <p className="text-xs text-danger">As senhas não coincidem</p>}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setOpen(false)} disabled={busy}>
              Cancelar
            </Button>
            <Button type="submit" variant="sticker" disabled={!canSubmit}>
              {busy ? 'Alterando…' : 'Alterar senha'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ChangePasswordDialog;
