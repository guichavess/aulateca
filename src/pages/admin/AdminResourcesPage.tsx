import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Trash2, Pencil, Search } from 'lucide-react';
import { toast } from 'sonner';
import { resourcesService } from '@/services/resources.service';
import { adminResourcesService } from '@/services/admin.service';
import type { Resource } from '@/lib/types';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

const EditResourceDialog: React.FC<{
  resource: Resource;
  onClose: () => void;
  onSaved: () => void;
}> = ({ resource, onClose, onSaved }) => {
  const [form, setForm] = useState({
    title: resource.title,
    description: resource.description,
    duration: resource.duration,
    file_url: resource.fileUrl ?? '',
  });

  const save = useMutation({
    mutationFn: () =>
      adminResourcesService.update(resource.id, {
        title: form.title,
        description: form.description,
        duration: form.duration,
        file_url: form.file_url || null,
      }),
    onSuccess: () => {
      toast.success('Recurso atualizado');
      onSaved();
      onClose();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-fredoka">Editar recurso</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            save.mutate();
          }}
          className="space-y-3 mt-2"
        >
          <div>
            <Label htmlFor="t">Título</Label>
            <Input id="t" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          </div>
          <div>
            <Label htmlFor="d">Descrição</Label>
            <Textarea id="d" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="du">Duração</Label>
              <Input id="du" value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} />
            </div>
            <div>
              <Label htmlFor="u">URL do arquivo</Label>
              <Input id="u" value={form.file_url} onChange={(e) => setForm({ ...form, file_url: e.target.value })} />
            </div>
          </div>
          <DialogFooter className="gap-2 mt-4">
            <Button type="button" variant="ghost" onClick={onClose}>Cancelar</Button>
            <Button type="submit" disabled={save.isPending}>{save.isPending ? 'Salvando…' : 'Salvar'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

const AdminResourcesPage: React.FC = () => {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<Resource | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'resources', search],
    queryFn: () => resourcesService.fetchAll({ search: search || undefined, limit: 50 }),
  });

  const remove = useMutation({
    mutationFn: (id: string) => adminResourcesService.remove(id),
    onSuccess: () => {
      toast.success('Recurso excluído');
      qc.invalidateQueries({ queryKey: ['admin', 'resources'] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="space-y-5 max-w-6xl">
      <div>
        <h1 className="font-fredoka text-2xl font-bold tracking-tight">Recursos pedagógicos</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Editar metadados e remover materiais publicados.
        </p>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por título…"
          className="pl-9"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {isLoading && <p className="text-sm text-muted-foreground">Carregando…</p>}

      {data && (
        <div className="rounded-2xl border border-border bg-card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-secondary/40 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="text-left px-4 py-3 font-semibold">Título</th>
                <th className="text-left px-4 py-3 font-semibold hidden md:table-cell">Categoria</th>
                <th className="text-left px-4 py-3 font-semibold hidden md:table-cell">Tipo</th>
                <th className="text-left px-4 py-3 font-semibold hidden lg:table-cell">Faixa</th>
                <th className="text-left px-4 py-3 font-semibold hidden lg:table-cell">Autor</th>
                <th className="text-right px-4 py-3 font-semibold">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {data.data.map((r) => (
                <tr key={r.id} className="hover:bg-secondary/30 transition-colors">
                  <td className="px-4 py-3">
                    <div className="font-medium line-clamp-1">{r.title}</div>
                    <p className="text-xs text-muted-foreground line-clamp-1">{r.description}</p>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell text-muted-foreground text-xs">{r.category}</td>
                  <td className="px-4 py-3 hidden md:table-cell text-muted-foreground text-xs">{r.type}</td>
                  <td className="px-4 py-3 hidden lg:table-cell text-muted-foreground text-xs">{r.ageRange}</td>
                  <td className="px-4 py-3 hidden lg:table-cell text-muted-foreground text-xs">{r.author}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-1">
                      <button
                        onClick={() => setEditing(r)}
                        className="p-1.5 rounded hover:bg-secondary"
                        title="Editar"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Excluir "${r.title}"?`)) remove.mutate(r.id);
                        }}
                        className="p-1.5 rounded hover:bg-rose-500/10 hover:text-rose-500"
                        title="Excluir"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {data.data.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-sm text-muted-foreground">
                    Nenhum recurso encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {editing && (
        <EditResourceDialog
          resource={editing}
          onClose={() => setEditing(null)}
          onSaved={() => qc.invalidateQueries({ queryKey: ['admin', 'resources'] })}
        />
      )}
    </div>
  );
};

export default AdminResourcesPage;
