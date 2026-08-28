import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Heart, FileText, LogOut, Check, X, Pencil, Mail, ShieldCheck, KeyRound } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useApp } from '@/lib/context';
import type { UserRole } from '@/services/auth.service';
import AvatarUploader from '@/components/profile/AvatarUploader';
import ChangeEmailDialog from '@/components/profile/ChangeEmailDialog';
import ChangePasswordDialog from '@/components/profile/ChangePasswordDialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

const ROLE_LABEL: Record<UserRole, string> = {
  PROFESSOR: 'Professor(a)',
  PAI_MAE: 'Pai / Mãe',
  TERAPEUTA: 'Terapeuta',
  ADMIN: 'Administrador(a)',
};

const ProfilePage: React.FC = () => {
  const { user, userName, favorites, logout, updateProfile } = useApp();

  const [editing, setEditing] = useState(false);
  const [draftName, setDraftName] = useState(userName);
  const [saving, setSaving] = useState(false);

  // Contagem real de recursos publicados. Antes a tela exibia "8 Recursos
  // Criados" e "3 Turmas" fixos no código — números que não vinham de lugar
  // nenhum e eram idênticos para todo usuário. "Turmas" saiu: não existe esse
  // conceito no banco, então não há o que contar.
  const { data: createdCount } = useQuery({
    queryKey: ['profile', 'resources-count', user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { count, error } = await supabase
        .from('resources')
        .select('id', { count: 'exact', head: true })
        .eq('author_id', user!.id);
      if (error) throw new Error(error.message);
      return count ?? 0;
    },
  });

  const startEditing = () => {
    setDraftName(userName);
    setEditing(true);
  };

  const save = async () => {
    const name = draftName.trim();
    if (!name) {
      toast.error('O nome não pode ficar vazio');
      return;
    }
    if (name === userName) {
      setEditing(false);
      return;
    }
    setSaving(true);
    try {
      await updateProfile({ name });
      toast.success('Perfil atualizado');
      setEditing(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Não foi possível salvar');
    } finally {
      setSaving(false);
    }
  };

  const stats = [
    {
      to: '/create',
      value: createdCount ?? '—',
      label: createdCount === 1 ? 'Recurso publicado' : 'Recursos publicados',
      icon: FileText,
    },
    {
      to: '/favorites',
      value: favorites.size,
      label: favorites.size === 1 ? 'Favorito' : 'Favoritos',
      icon: Heart,
    },
  ];

  return (
    <div className="px-5 py-6 sm:px-6 lg:px-8 max-w-3xl mx-auto space-y-6 animate-slide-up">
      <h1 className="font-fredoka text-h1 font-bold text-ink">
        Meu perfil
      </h1>

      {/* Identidade */}
      <section
        className="sticker-surface p-6 sm:p-8"
        style={{ borderRadius: 'var(--radius-panel)' }}
      >
        <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
          <AvatarUploader />

          <div className="flex-1 min-w-0 w-full">
            {editing ? (
              <div className="space-y-3">
                <label htmlFor="profile-name" className="section-label block">
                  Nome de exibição
                </label>
                <Input
                  id="profile-name"
                  value={draftName}
                  autoFocus
                  maxLength={80}
                  disabled={saving}
                  onChange={(e) => setDraftName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') save();
                    if (e.key === 'Escape') setEditing(false);
                  }}
                />
                <div className="flex gap-2 justify-center sm:justify-start">
                  <Button variant="sticker" onClick={save} disabled={saving}>
                    <Check className="w-4 h-4" aria-hidden="true" />
                    {saving ? 'Salvando…' : 'Salvar'}
                  </Button>
                  <Button variant="ghost" onClick={() => setEditing(false)} disabled={saving}>
                    <X className="w-4 h-4" aria-hidden="true" />
                    Cancelar
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <h2 className="font-fredoka text-2xl font-bold text-ink truncate">
                  {userName || 'Professor(a)'}
                </h2>
                <dl className="mt-2 space-y-1 text-sm text-muted-foreground">
                  {user?.email && (
                    <div className="flex items-center gap-2 justify-center sm:justify-start">
                      <dt className="sr-only">E-mail</dt>
                      <Mail className="w-4 h-4 shrink-0" aria-hidden="true" />
                      <dd className="truncate">{user.email}</dd>
                    </div>
                  )}
                  {user?.role && (
                    <div className="flex items-center gap-2 justify-center sm:justify-start">
                      <dt className="sr-only">Perfil de acesso</dt>
                      <ShieldCheck className="w-4 h-4 shrink-0" aria-hidden="true" />
                      <dd>{ROLE_LABEL[user.role]}</dd>
                    </div>
                  )}
                </dl>
                <Button variant="sticker-outline" onClick={startEditing} className="mt-4">
                  <Pencil className="w-4 h-4" aria-hidden="true" />
                  Editar nome
                </Button>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Números — cada card leva à tela correspondente. */}
      <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {stats.map((s) => (
          <Link
            key={s.label}
            to={s.to}
            className="sticker-card sticker-card-interactive p-5 flex items-center gap-4"
          >
            <div className="w-11 h-11 shrink-0 rounded-full bg-accent flex items-center justify-center">
              <s.icon className="w-5 h-5 text-primary" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <div className="font-fredoka text-2xl font-bold text-ink leading-tight tabular-nums">
                {s.value}
              </div>
              <div className="text-sm text-muted-foreground truncate">{s.label}</div>
            </div>
          </Link>
        ))}
      </section>

      {/* Conta e segurança.
          E-mail e senha vivem em auth.users, não em public.profiles — por isso
          não entram no "Editar nome" acima: cada um tem fluxo próprio, e ambos
          exigem a senha atual antes de mudar. */}
      <section className="sticker-surface p-5 sm:p-6" style={{ borderRadius: 'var(--radius-panel)' }}>
        <p className="section-label mb-1">Conta e segurança</p>
        <p className="text-sm text-muted-foreground mb-5">
          Alterações aqui pedem sua senha atual para confirmar que é você.
        </p>

        <ul className="divide-y divide-border">
          <li className="flex flex-wrap items-center justify-between gap-3 py-4 first:pt-0">
            <div className="flex items-start gap-3 min-w-0">
              <Mail className="w-5 h-5 mt-0.5 shrink-0 text-primary" aria-hidden="true" />
              <div className="min-w-0">
                <p className="font-semibold text-ink">E-mail de acesso</p>
                <p className="text-sm text-muted-foreground truncate">{user?.email}</p>
              </div>
            </div>
            <ChangeEmailDialog />
          </li>

          <li className="flex flex-wrap items-center justify-between gap-3 py-4 last:pb-0">
            <div className="flex items-start gap-3 min-w-0">
              <KeyRound className="w-5 h-5 mt-0.5 shrink-0 text-primary" aria-hidden="true" />
              <div className="min-w-0">
                <p className="font-semibold text-ink">Senha</p>
                <p className="text-sm text-muted-foreground">
                  Use uma senha só desta conta, com 8 caracteres ou mais.
                </p>
              </div>
            </div>
            <ChangePasswordDialog />
          </li>
        </ul>
      </section>

      {/* Sessão.
          O "Modo Escuro" que existia aqui era um useState solto: o botão
          animava, mas não há bloco `.dark` no index.css, então nada mudava na
          tela. Saiu junto com "Editar Perfil"/"Configurações"/"Sobre", que
          eram linhas sem nenhum onClick. Voltam quando tiverem destino. */}
      <section className="sticker-surface p-5" style={{ borderRadius: 'var(--radius-panel)' }}>
        <p className="section-label mb-1">Sessão</p>
        <p className="text-sm text-muted-foreground mb-4">
          Você será desconectado neste dispositivo.
        </p>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="outline"
              className="border-2 border-danger text-danger hover:bg-danger/10 hover:text-danger"
            >
              <LogOut className="w-4 h-4" aria-hidden="true" />
              Sair da conta
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="font-fredoka">Sair da conta?</AlertDialogTitle>
              <AlertDialogDescription>
                Você precisará entrar de novo com e-mail e senha para voltar.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Continuar conectado</AlertDialogCancel>
              <AlertDialogAction
                onClick={logout}
                className="bg-danger text-danger-foreground hover:bg-danger/90"
              >
                Sair
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </section>
    </div>
  );
};

export default ProfilePage;
