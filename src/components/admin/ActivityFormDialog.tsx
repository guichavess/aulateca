import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { publicActivitiesService, type PublicActivity } from '@/services/admin.service';

interface Props {
  activity: PublicActivity | null;
  onClose: () => void;
  onSaved: () => void;
}

// Datetime-local quer "YYYY-MM-DDTHH:mm" sem timezone — fatiamos o ISO.
const isoToLocal = (iso: string | null) => (iso ? iso.slice(0, 16) : '');

const ActivityFormDialog: React.FC<Props> = ({ activity, onClose, onSaved }) => {
  const isEdit = !!activity;
  const [form, setForm] = useState({
    title: activity?.title ?? '',
    description: activity?.description ?? '',
    category: activity?.category ?? '',
    imageUrl: activity?.imageUrl ?? '',
    capacity: activity?.capacity?.toString() ?? '',
    startsAt: isoToLocal(activity?.startsAt ?? null),
    endsAt: isoToLocal(activity?.endsAt ?? null),
    isActive: activity?.isActive ?? true,
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        title: form.title.trim(),
        description: form.description.trim() || null,
        category: form.category.trim() || null,
        imageUrl: form.imageUrl.trim() || null,
        capacity: form.capacity ? Number(form.capacity) : null,
        startsAt: form.startsAt ? new Date(form.startsAt).toISOString() : null,
        endsAt: form.endsAt ? new Date(form.endsAt).toISOString() : null,
        isActive: form.isActive,
      };
      if (isEdit && activity) {
        return publicActivitiesService.update(activity.id, payload);
      }
      return publicActivitiesService.create(payload);
    },
    onSuccess: () => {
      toast.success(isEdit ? 'Atividade atualizada' : 'Atividade criada');
      onSaved();
      onClose();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) {
      toast.error('Título é obrigatório');
      return;
    }
    saveMutation.mutate();
  };

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-fredoka">
            {isEdit ? 'Editar atividade' : 'Nova atividade'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-3 mt-2">
          <div>
            <Label htmlFor="title">Título *</Label>
            <Input
              id="title"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="category">Categoria</Label>
              <Input
                id="category"
                placeholder="oficina, curso…"
                value={form.category}
                onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="capacity">Capacidade</Label>
              <Input
                id="capacity"
                type="number"
                min={1}
                placeholder="sem limite"
                value={form.capacity}
                onChange={(e) => setForm((f) => ({ ...f, capacity: e.target.value }))}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="startsAt">Início</Label>
              <Input
                id="startsAt"
                type="datetime-local"
                value={form.startsAt}
                onChange={(e) => setForm((f) => ({ ...f, startsAt: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="endsAt">Fim</Label>
              <Input
                id="endsAt"
                type="datetime-local"
                value={form.endsAt}
                onChange={(e) => setForm((f) => ({ ...f, endsAt: e.target.value }))}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="imageUrl">URL da imagem</Label>
            <Input
              id="imageUrl"
              placeholder="https://… ou /catalog/arquivo.png"
              value={form.imageUrl}
              onChange={(e) => setForm((f) => ({ ...f, imageUrl: e.target.value }))}
            />
          </div>

          <div className="flex items-center justify-between rounded-lg border border-border px-3 py-2">
            <div>
              <p className="text-sm font-medium">Ativa para o público</p>
              <p className="text-xs text-muted-foreground">Quando desligada, fica oculta dos usuários.</p>
            </div>
            <Switch
              checked={form.isActive}
              onCheckedChange={(v) => setForm((f) => ({ ...f, isActive: v }))}
            />
          </div>

          <DialogFooter className="gap-2 mt-4">
            <Button type="button" variant="ghost" onClick={onClose}>Cancelar</Button>
            <Button type="submit" disabled={saveMutation.isPending}>
              {saveMutation.isPending ? 'Salvando…' : isEdit ? 'Salvar' : 'Criar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ActivityFormDialog;
