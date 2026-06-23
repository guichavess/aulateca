import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
} from '@/components/ui/select';
import { adminUsersService, type AdminUserRow } from '@/services/admin.service';

const roleLabels: Record<AdminUserRow['role'], string> = {
  PROFESSOR: 'Professor(a)',
  PAI_MAE: 'Pai/Mãe',
  TERAPEUTA: 'Terapeuta',
  ADMIN: 'Admin',
};

const AdminUsersPage: React.FC = () => {
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'users'],
    queryFn: () => adminUsersService.list(),
  });

  const setRole = useMutation({
    mutationFn: ({ id, role }: { id: string; role: AdminUserRow['role'] }) =>
      adminUsersService.setRole(id, role),
    onSuccess: () => {
      toast.success('Papel atualizado');
      qc.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="space-y-5 max-w-5xl">
      <div>
        <h1 className="font-fredoka text-2xl font-bold tracking-tight">Usuários</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Promova ou rebaixe papéis. Cuidado: ADMIN tem acesso completo.
        </p>
      </div>

      {isLoading && <p className="text-sm text-muted-foreground">Carregando…</p>}

      {data && (
        <div className="rounded-2xl border border-border bg-card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-secondary/40 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="text-left px-4 py-3 font-semibold">Nome</th>
                <th className="text-left px-4 py-3 font-semibold hidden md:table-cell">Cadastro</th>
                <th className="text-right px-4 py-3 font-semibold">Papel</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {data.map((u) => (
                <tr key={u.id} className="hover:bg-secondary/30 transition-colors">
                  <td className="px-4 py-3 font-medium">{u.name}</td>
                  <td className="px-4 py-3 hidden md:table-cell text-xs text-muted-foreground tabular-nums">
                    {new Date(u.createdAt).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end">
                      <Select
                        value={u.role}
                        onValueChange={(v) => setRole.mutate({ id: u.id, role: v as AdminUserRow['role'] })}
                      >
                        <SelectTrigger className="h-8 w-40 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {(Object.keys(roleLabels) as AdminUserRow['role'][]).map((r) => (
                            <SelectItem key={r} value={r}>{roleLabels[r]}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
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

export default AdminUsersPage;
