import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2, Power, Calendar, Users as UsersIcon } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { publicActivitiesService, type PublicActivity } from '@/services/admin.service';
import ActivityFormDialog from '@/components/admin/ActivityFormDialog';

const formatDate = (iso: string | null) => {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
  } catch {
    return iso;
  }
};

const AdminCatalogPage: React.FC = () => {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<PublicActivity | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['admin', 'activities'],
    queryFn: () => publicActivitiesService.list(),
  });

  const removeMutation = useMutation({
    mutationFn: (id: string) => publicActivitiesService.remove(id),
    onSuccess: () => {
      toast.success('Atividade excluída');
      qc.invalidateQueries({ queryKey: ['admin', 'activities'] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      publicActivitiesService.toggleActive(id, isActive),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'activities'] }),
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="space-y-5 max-w-6xl">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-fredoka text-2xl font-bold tracking-tight">Catálogo público</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Atividades e serviços ofertados ao público com janelas de adesão.
          </p>
        </div>
        <Button onClick={() => setIsCreating(true)} className="gap-1.5">
          <Plus className="w-4 h-4" />
          Nova atividade
        </Button>
      </div>

      {isLoading && <p className="text-sm text-muted-foreground">Carregando…</p>}
      {isError && (
        <div className="rounded-xl border border-rose-500/20 bg-rose-500/5 p-4 text-sm text-rose-500">
          Falha ao carregar: {error instanceof Error ? error.message : 'erro desconhecido'}
        </div>
      )}

      {data && data.length === 0 && (
        <div className="rounded-2xl border border-dashed border-border p-10 text-center text-muted-foreground">
          <p className="text-sm">Nenhuma atividade cadastrada ainda.</p>
          <p className="text-xs mt-1">Clique em "Nova atividade" para começar.</p>
        </div>
      )}

      {data && data.length > 0 && (
        <div className="rounded-2xl border border-border bg-card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-secondary/40 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="text-left px-4 py-3 font-semibold">Atividade</th>
                <th className="text-left px-4 py-3 font-semibold hidden md:table-cell">Categoria</th>
                <th className="text-left px-4 py-3 font-semibold hidden lg:table-cell">Início</th>
                <th className="text-left px-4 py-3 font-semibold hidden lg:table-cell">Capacidade</th>
                <th className="text-left px-4 py-3 font-semibold">Status</th>
                <th className="text-right px-4 py-3 font-semibold">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {data.map((a) => (
                <tr key={a.id} className="hover:bg-secondary/30 transition-colors">
                  <td className="px-4 py-3">
                    <div className="font-medium">{a.title}</div>
                    {a.description && (
                      <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                        {a.description}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell text-muted-foreground">
                    {a.category ?? '—'}
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell text-muted-foreground tabular-nums text-xs">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3 h-3" />
                      {formatDate(a.startsAt)}
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell text-muted-foreground tabular-nums text-xs">
                    <div className="flex items-center gap-1.5">
                      <UsersIcon className="w-3 h-3" />
                      {a.capacity ?? '∞'}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        a.isActive
                          ? 'bg-emerald-500/15 text-emerald-600'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {a.isActive ? 'ATIVA' : 'INATIVA'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-1">
                      <button
                        onClick={() => toggleMutation.mutate({ id: a.id, isActive: !a.isActive })}
                        className="p-1.5 rounded hover:bg-secondary transition-colors"
                        title={a.isActive ? 'Desativar' : 'Ativar'}
                      >
                        <Power className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setEditing(a)}
                        className="p-1.5 rounded hover:bg-secondary transition-colors"
                        title="Editar"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Excluir "${a.title}"?`)) removeMutation.mutate(a.id);
                        }}
                        className="p-1.5 rounded hover:bg-rose-500/10 hover:text-rose-500 transition-colors"
                        title="Excluir"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {(isCreating || editing) && (
        <ActivityFormDialog
          activity={editing}
          onClose={() => {
            setEditing(null);
            setIsCreating(false);
          }}
          onSaved={() => qc.invalidateQueries({ queryKey: ['admin', 'activities'] })}
        />
      )}
    </div>
  );
};

export default AdminCatalogPage;
