import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { BookOpen, ClipboardList, Sparkles, MessageSquare, Users, ArrowRight } from 'lucide-react';
import { publicActivitiesService, enrollmentsService, adminUsersService } from '@/services/admin.service';

const StatCard: React.FC<{
  label: string;
  value: number | string;
  icon: React.ElementType;
  to: string;
  accent: string;
}> = ({ label, value, icon: Icon, to, accent }) => (
  <Link
    to={to}
    className="group block rounded-2xl bg-card border border-border p-5 hover:border-primary/30 hover:shadow-md transition-all"
  >
    <div className="flex items-center justify-between mb-3">
      <div
        className="w-9 h-9 rounded-xl flex items-center justify-center"
        style={{ background: `${accent}18`, color: accent }}
      >
        <Icon className="w-4 h-4" />
      </div>
      <ArrowRight className="w-4 h-4 text-muted-foreground/60 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
    </div>
    <p className="text-2xl font-bold font-fredoka tabular-nums">{value}</p>
    <p className="text-xs text-muted-foreground mt-1">{label}</p>
  </Link>
);

const AdminDashboard: React.FC = () => {
  const activities = useQuery({
    queryKey: ['admin', 'activities'],
    queryFn: () => publicActivitiesService.list(),
  });

  const enrollmentCounts = useQuery({
    queryKey: ['admin', 'enrollment-counts'],
    queryFn: () => enrollmentsService.counts(),
  });

  const users = useQuery({
    queryKey: ['admin', 'users'],
    queryFn: () => adminUsersService.list(),
  });

  const totalActive = activities.data?.filter((a) => a.isActive).length ?? 0;
  const totalEnrollments = enrollmentCounts.data
    ? Object.values(enrollmentCounts.data).reduce((a, b) => a + b, 0)
    : 0;
  const pending = enrollmentCounts.data?.PENDING ?? 0;
  const totalUsers = users.data?.length ?? 0;

  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h1 className="font-fredoka text-2xl font-bold tracking-tight">Visão geral</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Acompanhe atividades, adesões e a comunidade em um só lugar.
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Atividades ativas" value={totalActive} icon={Sparkles} to="/admin/catalogo" accent="#7c3aed" />
        <StatCard label="Adesões totais" value={totalEnrollments} icon={ClipboardList} to="/admin/adesoes" accent="#0ea5e9" />
        <StatCard label="Pendentes" value={pending} icon={ClipboardList} to="/admin/adesoes" accent="#f59e0b" />
        <StatCard label="Usuários" value={totalUsers} icon={Users} to="/admin/usuarios" accent="#10b981" />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <Link
          to="/admin/recursos"
          className="rounded-2xl bg-card border border-border p-5 hover:border-primary/30 transition-all group"
        >
          <BookOpen className="w-5 h-5 text-primary mb-3" />
          <h3 className="font-fredoka font-semibold mb-1">Gerenciar recursos pedagógicos</h3>
          <p className="text-xs text-muted-foreground">Editar e excluir vídeos e PDFs publicados pelos professores.</p>
        </Link>
        <Link
          to="/admin/comunidade"
          className="rounded-2xl bg-card border border-border p-5 hover:border-primary/30 transition-all group"
        >
          <MessageSquare className="w-5 h-5 text-primary mb-3" />
          <h3 className="font-fredoka font-semibold mb-1">Moderar comunidade</h3>
          <p className="text-xs text-muted-foreground">Remover posts e comentários impróprios.</p>
        </Link>
      </div>
    </div>
  );
};

export default AdminDashboard;
