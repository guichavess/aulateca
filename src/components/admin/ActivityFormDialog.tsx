import React, { useRef } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ImagePlus, Loader2, X } from 'lucide-react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { publicActivitiesService, type PublicActivity } from '@/services/admin.service';
import {
  activityFormSchema, toActivityInput, type ActivityFormValues,
} from '@/services/admin.schemas';

interface Props {
  activity: PublicActivity | null;
  onClose: () => void;
  onSaved: () => void;
}

// Datetime-local quer "YYYY-MM-DDTHH:mm" sem timezone — fatiamos o ISO.
const isoToLocal = (iso: string | null) => (iso ? iso.slice(0, 16) : '');

const ActivityFormDialog: React.FC<Props> = ({ activity, onClose, onSaved }) => {
  const isEdit = !!activity;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register, handleSubmit, control, setValue, watch,
    formState: { errors },
  } = useForm<ActivityFormValues>({
    resolver: zodResolver(activityFormSchema),
    defaultValues: {
      title: activity?.title ?? '',
      description: activity?.description ?? '',
      category: activity?.category ?? '',
      imageUrl: activity?.imageUrl ?? '',
      capacity: activity?.capacity?.toString() ?? '',
      startsAt: isoToLocal(activity?.startsAt ?? null),
      endsAt: isoToLocal(activity?.endsAt ?? null),
      isActive: activity?.isActive ?? true,
    },
  });

  const imageUrl = watch('imageUrl');

  const uploadMutation = useMutation({
    mutationFn: (file: File) => publicActivitiesService.uploadImage(file),
    onSuccess: (url) => {
      setValue('imageUrl', url, { shouldValidate: true, shouldDirty: true });
      toast.success('Imagem enviada');
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const saveMutation = useMutation({
    mutationFn: (values: ActivityFormValues) => {
      const payload = toActivityInput(values);
      return isEdit && activity
        ? publicActivitiesService.update(activity.id, payload)
        : publicActivitiesService.create(payload);
    },
    onSuccess: () => {
      toast.success(isEdit ? 'Atividade atualizada' : 'Atividade criada');
      onSaved();
      onClose();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const onPickFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadMutation.mutate(file);
    e.target.value = ''; // permite reenviar o mesmo arquivo
  };

  const err = (name: keyof ActivityFormValues) =>
    errors[name] && <p className="text-xs text-danger mt-1">{errors[name]?.message}</p>;

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-fredoka">
            {isEdit ? 'Editar atividade' : 'Nova atividade'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit((v) => saveMutation.mutate(v))} className="space-y-3 mt-2">
          <div>
            <Label htmlFor="title">Título *</Label>
            <Input id="title" {...register('title')} />
            {err('title')}
          </div>

          <div>
            <Label htmlFor="description">Descrição</Label>
            <Textarea id="description" rows={3} {...register('description')} />
            {err('description')}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="category">Categoria</Label>
              <Input id="category" placeholder="oficina, curso…" {...register('category')} />
              {err('category')}
            </div>
            <div>
              <Label htmlFor="capacity">Capacidade</Label>
              <Input
                id="capacity"
                type="number"
                min={1}
                placeholder="sem limite"
                {...register('capacity')}
              />
              {err('capacity')}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="startsAt">Início</Label>
              <Input id="startsAt" type="datetime-local" {...register('startsAt')} />
              {err('startsAt')}
            </div>
            <div>
              <Label htmlFor="endsAt">Fim</Label>
              <Input id="endsAt" type="datetime-local" {...register('endsAt')} />
              {err('endsAt')}
            </div>
          </div>

          <div>
            <Label htmlFor="imageUrl">Imagem</Label>
            <div className="flex gap-2">
              <Input
                id="imageUrl"
                placeholder="https://… ou /atividades/ludica/quem-sou-eu/capa.webp"
                {...register('imageUrl')}
              />
              <Button
                type="button"
                variant="outline"
                className="shrink-0 gap-1.5"
                disabled={uploadMutation.isPending}
                onClick={() => fileInputRef.current?.click()}
              >
                {uploadMutation.isPending
                  ? <Loader2 className="w-4 h-4 animate-spin" />
                  : <ImagePlus className="w-4 h-4" />}
                Enviar
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={onPickFile}
              />
            </div>
            {err('imageUrl')}
            {imageUrl && (
              <div className="relative mt-2 w-fit">
                <img
                  src={imageUrl}
                  alt="Prévia da atividade"
                  className="h-28 rounded-lg border border-border object-cover"
                />
                <button
                  type="button"
                  onClick={() => setValue('imageUrl', '', { shouldDirty: true })}
                  className="absolute -top-2 -right-2 rounded-full bg-background border border-border p-1 hover:bg-secondary"
                  title="Remover imagem"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between rounded-lg border border-border px-3 py-2">
            <div>
              <p className="text-sm font-medium">Ativa para o público</p>
              <p className="text-xs text-muted-foreground">Quando desligada, fica oculta dos usuários.</p>
            </div>
            <Controller
              control={control}
              name="isActive"
              render={({ field }) => (
                <Switch checked={field.value} onCheckedChange={field.onChange} />
              )}
            />
          </div>

          <DialogFooter className="gap-2 mt-4">
            <Button type="button" variant="ghost" onClick={onClose}>Cancelar</Button>
            <Button type="submit" disabled={saveMutation.isPending || uploadMutation.isPending}>
              {saveMutation.isPending ? 'Salvando…' : isEdit ? 'Salvar' : 'Criar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ActivityFormDialog;
