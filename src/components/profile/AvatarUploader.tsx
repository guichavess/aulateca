import React, { useRef, useState } from 'react';
import { toast } from 'sonner';
import { Camera, Loader2, Trash2 } from 'lucide-react';
import { useApp } from '@/lib/context';
import { authService } from '@/services/auth.service';
import { Button } from '@/components/ui/button';

const ACCEPT = 'image/jpeg,image/png,image/webp';

/**
 * Foto de perfil.
 *
 * O arquivo vai para o bucket `avatars` sob a pasta do próprio uid (migration
 * 007) e só depois a URL é gravada em profiles.avatar_url — se o upload falhar,
 * o perfil continua apontando para a foto antiga, sem link quebrado.
 */
const AvatarUploader: React.FC = () => {
  const { user, userName, updateProfile } = useApp();
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  const avatarUrl = preview ?? (failed ? undefined : user?.avatarUrl);

  const initials = userName
    ? userName.split(' ').filter(Boolean).map((w) => w[0]).slice(0, 2).join('').toUpperCase()
    : 'PT';

  const handleFile = async (file: File) => {
    if (!user) return;
    const previous = user.avatarUrl;
    // Preview local imediato: o upload leva segundos e sem isto a tela parece travada.
    const localUrl = URL.createObjectURL(file);
    setPreview(localUrl);
    setBusy(true);
    try {
      const url = await authService.uploadAvatar(user.id, file);
      await updateProfile({ avatarUrl: url });
      await authService.removeAvatarFile(previous, user.id);
      setFailed(false);
      setPreview(null);
      toast.success('Foto atualizada');
    } catch (err) {
      setPreview(null);
      toast.error(err instanceof Error ? err.message : 'Não foi possível enviar a foto');
    } finally {
      URL.revokeObjectURL(localUrl);
      setBusy(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const removePhoto = async () => {
    if (!user) return;
    setBusy(true);
    try {
      const previous = user.avatarUrl;
      await updateProfile({ avatarUrl: null });
      await authService.removeAvatarFile(previous, user.id);
      toast.success('Foto removida');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Não foi possível remover a foto');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative">
        <div className="w-24 h-24 rounded-full border-2 border-border bg-accent text-accent-foreground flex items-center justify-center font-fredoka text-3xl font-bold overflow-hidden">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt=""
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
              onError={() => setFailed(true)}
            />
          ) : (
            initials
          )}
        </div>

        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={busy}
          aria-label="Trocar foto de perfil"
          className="absolute -bottom-1 -right-1 w-9 h-9 rounded-full bg-primary text-primary-foreground border-2 border-background flex items-center justify-center disabled:opacity-60 transition-transform duration-150 active:translate-y-[1px]"
        >
          {busy ? (
            <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
          ) : (
            <Camera className="w-4 h-4" aria-hidden="true" />
          )}
        </button>

        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT}
          className="sr-only"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
          }}
        />
      </div>

      <p className="text-xs text-muted-foreground text-center">JPG, PNG ou WebP, até 2 MB</p>

      {user?.avatarUrl && !busy && (
        <Button
          variant="ghost"
          size="sm"
          onClick={removePhoto}
          className="text-muted-foreground h-8 gap-1.5"
        >
          <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
          Remover foto
        </Button>
      )}
    </div>
  );
};

export default AvatarUploader;
