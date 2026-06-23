import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
} from '@/components/ui/select';
import {
  enrollmentsService, type EnrollmentStatus,
} from '@/services/admin.service';

const statusLabels: Record<EnrollmentStatus | 'ALL', string> = {
  ALL: 'Todas',
  PENDING: 'Pendentes',
  CONFIRMED: 'Confirmadas',
  WAITLIST: 'Lista de espera',
  CANCELLED: 'Canceladas',
};

const statusBadge: Record<EnrollmentStatus, string> = {
  PENDING: 'bg-amber-500/15 text-amber-600',
  CONFIRMED: 'bg-emerald-500/15 text-emerald-600',
  WAITLIST: 'bg-sky-500/15 text-sky-600',
  CANCELLED: 'bg-muted text-muted-foreground',
};

const AdminEnrollmentsPage: React.FC = () => {
  const qc = useQueryClient();
  const [filter, setFilter] = useState<EnrollmentStatus | 'ALL'>('ALL');

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['admin', 'enrollments', filter],
    queryFn: () =>
      enrollmentsService.list(filter === 'ALL' ? undefined : { status: filter }),
  });

  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: EnrollmentStatus }) =>
      enrollmentsService.updateStatus(id, status),
    onSuccess: () => {
      toast.success('Status atualizado');
      qc.invalidateQueries({ queryKey: ['admin', 'enrollments'] });
      qc.invalidateQueries({ queryKey: ['admin', 'enrollment-counts'] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: (id: string) => enrollmentsService.remove(id),
    onSuccess: () => {
      toast.success('Adesão removida');
      qc.invalidateQueries({ queryKey: ['admin', 'enrollments'] });
      qc.invalidateQueries({ queryKey: ['admin', 'enrollment-counts'] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="space-y-5 max-w-6xl">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-fredoka text-2xl font-bold tracking-tight">Adesões a atividades</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Aprove, mova para lista de espera ou cancele inscrições do público.
          </p>
        </div>
        <div className="w-48">
          <Select value={filter} onValueChange={(v) => setFilter(v as EnrollmentStatus | 'ALL')}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(Object.keys(statusLabels) as Array<EnrollmentStatus | 'ALL'>).map((k) => (
                <SelectItem key={k} value={k}>{statusLabels[k]}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading && <p className="text-sm text-muted-foreground">Carregando…</p>}
      {isError && (
        <div className="rounded-xl border border-rose-500/20 bg-rose-500/5 p-4 text-sm text-rose-500">
          Falha ao carregar: {error instanceof Error ? error.message : 'erro desconhecido'}
        </div>
      )}

      {data && data.length === 0 && (
        <div className="rounded-2xl border border-dashed border-border p-10 text-center text-muted-foreground">
          <p className="text-sm">Nenhuma adesão encontrada.</p>
        </div>
      )}

      {data && data.length > 0 && (
        <div className="rounded-2xl border border-border bg-card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-secondary/40 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="text-left px-4 py-3 font-semibold">Pessoa</th>
                <th className="text-left px-4 py-3 font-semibold">Atividade</th>
                <th className="text-left px-4 py-3 font-semibold hidden md:table-cell">Data</th>
                <th className="text-left px-4 py-3 font-semibold">Status</th>
                <th className="text-right px-4 py-3 font-semibold">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {data.map((e) => (
                <tr key={e.id} className="hover:bg-secondary/30 transition-colors">
                  <td className="px-4 py-3 font-medium">{e.userName}</td>
                  <td className="px-4 py-3 text-muted-foreground">{e.activityTitle}</td>
                  <td className="px-4 py-3 hidden md:table-cell text-xs text-muted-foreground tabular-nums">
                    {new Date(e.createdAt).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold ${statusBadge[e.status]}`}>
                      {e.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2 items-center">
                      <Select
                        value={e.status}
                        onValueChange={(v) => updateStatus.mutate({ id: e.id, status: v as EnrollmentStatus })}
                      >
                        <SelectTrigger className="h-7 w-32 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="PENDING">Pendente</SelectItem>
                          <SelectItem value="CONFIRMED">Confirmar</SelectItem>
                          <SelectItem value="WAITLIST">Espera</SelectItem>
                          <SelectItem value="CANCELLED">Cancelar</SelectItem>
                        </SelectContent>
                      </Select>
                      <button
                        onClick={() => {
                          if (confirm('Remover esta adesão?')) remove.mutate(e.id);
                        }}
                        className="p-1.5 rounded hover:bg-rose-500/10 hover:text-rose-500 transition-colors"
                        title="Remover"
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
    </div>
  );
};

export default AdminEnrollmentsPage;
