import { supabase } from '@/integrations/supabase/client';

// ════════════════════════════════════════════════════════════════════════════
// Tipos do domínio admin (atividades públicas + adesões)
// ════════════════════════════════════════════════════════════════════════════

export type EnrollmentStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'WAITLIST';

export interface PublicActivity {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  imageUrl: string | null;
  capacity: number | null;
  startsAt: string | null;
  endsAt: string | null;
  isActive: boolean;
  createdAt: string;
}

export interface ActivityEnrollment {
  id: string;
  activityId: string;
  activityTitle: string;
  userId: string;
  userName: string;
  userEmail: string;
  status: EnrollmentStatus;
  notes: string | null;
  createdAt: string;
}

type ActivityRow = {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  image_url: string | null;
  capacity: number | null;
  starts_at: string | null;
  ends_at: string | null;
  is_active: boolean;
  created_at: string;
};

const toActivity = (r: ActivityRow): PublicActivity => ({
  id: r.id,
  title: r.title,
  description: r.description,
  category: r.category,
  imageUrl: r.image_url,
  capacity: r.capacity,
  startsAt: r.starts_at,
  endsAt: r.ends_at,
  isActive: r.is_active,
  createdAt: r.created_at,
});

// ════════════════════════════════════════════════════════════════════════════
// Atividades ofertadas ao público
// ════════════════════════════════════════════════════════════════════════════

export const publicActivitiesService = {
  async list(): Promise<PublicActivity[]> {
    const { data, error } = await supabase
      .from('public_activities')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []).map(toActivity);
  },

  async create(input: Omit<PublicActivity, 'id' | 'createdAt'>): Promise<PublicActivity> {
    const { data, error } = await supabase
      .from('public_activities')
      .insert({
        title: input.title,
        description: input.description,
        category: input.category,
        image_url: input.imageUrl,
        capacity: input.capacity,
        starts_at: input.startsAt,
        ends_at: input.endsAt,
        is_active: input.isActive,
      })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return toActivity(data);
  },

  async update(id: string, input: Partial<Omit<PublicActivity, 'id' | 'createdAt'>>): Promise<PublicActivity> {
    const { data, error } = await supabase
      .from('public_activities')
      .update({
        title: input.title,
        description: input.description,
        category: input.category,
        image_url: input.imageUrl,
        capacity: input.capacity,
        starts_at: input.startsAt,
        ends_at: input.endsAt,
        is_active: input.isActive,
      })
      .eq('id', id)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return toActivity(data);
  },

  async remove(id: string): Promise<void> {
    const { error } = await supabase.from('public_activities').delete().eq('id', id);
    if (error) throw new Error(error.message);
  },

  async toggleActive(id: string, isActive: boolean): Promise<void> {
    const { error } = await supabase
      .from('public_activities')
      .update({ is_active: isActive })
      .eq('id', id);
    if (error) throw new Error(error.message);
  },
};

// ════════════════════════════════════════════════════════════════════════════
// Adesões (inscrições) às atividades públicas
// ════════════════════════════════════════════════════════════════════════════

type EnrollmentRow = {
  id: string;
  activity_id: string;
  user_id: string;
  status: EnrollmentStatus;
  notes: string | null;
  created_at: string;
  public_activities: { title: string } | null;
  profiles: { name: string } | null;
};

export const enrollmentsService = {
  async list(filter?: { status?: EnrollmentStatus; activityId?: string }): Promise<ActivityEnrollment[]> {
    let q = supabase
      .from('activity_enrollments')
      .select('*, public_activities(title), profiles!activity_enrollments_user_id_fkey(name)')
      .order('created_at', { ascending: false });
    if (filter?.status) q = q.eq('status', filter.status);
    if (filter?.activityId) q = q.eq('activity_id', filter.activityId);

    const { data, error } = await q;
    if (error) {
      // Fallback simples se o relacionamento não existir como FK nomeado: tenta join sem alias.
      const retry = await supabase
        .from('activity_enrollments')
        .select('*, public_activities(title), profiles(name)')
        .order('created_at', { ascending: false });
      if (retry.error) throw new Error(retry.error.message);
      return (retry.data as EnrollmentRow[]).map((r) => ({
        id: r.id,
        activityId: r.activity_id,
        activityTitle: r.public_activities?.title ?? '—',
        userId: r.user_id,
        userName: r.profiles?.name ?? '—',
        userEmail: '',
        status: r.status,
        notes: r.notes,
        createdAt: r.created_at,
      }));
    }
    return (data as EnrollmentRow[]).map((r) => ({
      id: r.id,
      activityId: r.activity_id,
      activityTitle: r.public_activities?.title ?? '—',
      userId: r.user_id,
      userName: r.profiles?.name ?? '—',
      userEmail: '',
      status: r.status,
      notes: r.notes,
      createdAt: r.created_at,
    }));
  },

  async updateStatus(id: string, status: EnrollmentStatus): Promise<void> {
    const { error } = await supabase
      .from('activity_enrollments')
      .update({ status })
      .eq('id', id);
    if (error) throw new Error(error.message);
  },

  async remove(id: string): Promise<void> {
    const { error } = await supabase
      .from('activity_enrollments')
      .delete()
      .eq('id', id);
    if (error) throw new Error(error.message);
  },

  async counts(): Promise<Record<EnrollmentStatus, number>> {
    const { data, error } = await supabase
      .from('activity_enrollments')
      .select('status');
    if (error) throw new Error(error.message);
    const acc: Record<EnrollmentStatus, number> = {
      PENDING: 0, CONFIRMED: 0, CANCELLED: 0, WAITLIST: 0,
    };
    for (const row of data ?? []) acc[(row as { status: EnrollmentStatus }).status] += 1;
    return acc;
  },
};

// ════════════════════════════════════════════════════════════════════════════
// Admin de recursos pedagógicos (mesma tabela do app, com privilégios extra)
// ════════════════════════════════════════════════════════════════════════════

export const adminResourcesService = {
  async update(id: string, patch: {
    title?: string;
    description?: string;
    category?: string;
    type?: string;
    age_range?: string;
    duration?: string;
    file_url?: string | null;
    is_new?: boolean;
  }): Promise<void> {
    const { error } = await supabase.from('resources').update(patch).eq('id', id);
    if (error) throw new Error(error.message);
  },

  async remove(id: string): Promise<void> {
    const { error } = await supabase.from('resources').delete().eq('id', id);
    if (error) throw new Error(error.message);
  },
};

// ════════════════════════════════════════════════════════════════════════════
// Usuários (somente leitura na área admin; promoção/rebaixamento de role)
// ════════════════════════════════════════════════════════════════════════════

export interface AdminUserRow {
  id: string;
  name: string;
  role: 'PROFESSOR' | 'PAI_MAE' | 'TERAPEUTA' | 'ADMIN';
  avatarUrl: string | null;
  createdAt: string;
}

export const adminUsersService = {
  async list(): Promise<AdminUserRow[]> {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, name, role, avatar_url, created_at')
      .order('created_at', { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []).map((r) => ({
      id: r.id,
      name: r.name,
      role: r.role as AdminUserRow['role'],
      avatarUrl: r.avatar_url,
      createdAt: r.created_at,
    }));
  },

  async setRole(id: string, role: AdminUserRow['role']): Promise<void> {
    const { error } = await supabase.from('profiles').update({ role }).eq('id', id);
    if (error) throw new Error(error.message);
  },
};
