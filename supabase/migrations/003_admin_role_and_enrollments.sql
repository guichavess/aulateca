-- ════════════════════════════════════════════════════════════════════════════
-- 003 — Role ADMIN + tabela de adesões a atividades ofertadas ao público
-- ════════════════════════════════════════════════════════════════════════════

-- 1. Adiciona ADMIN ao check constraint do role em profiles
alter table public.profiles
  drop constraint if exists profiles_role_check;

alter table public.profiles
  add constraint profiles_role_check
  check (role in ('PROFESSOR', 'PAI_MAE', 'TERAPEUTA', 'ADMIN'));

-- 2. Helper: retorna true se o usuário corrente é ADMIN.
--    SECURITY DEFINER evita recursão de RLS ao consultar profiles dentro de policy.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (select role = 'ADMIN' from public.profiles where id = auth.uid()),
    false
  );
$$;

-- 3. Catálogo de atividades ofertadas ao público (geridas pelo admin)
create table if not exists public.public_activities (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  category text,
  image_url text,
  capacity integer,
  starts_at timestamptz,
  ends_at timestamptz,
  is_active boolean not null default true,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_public_activities_active
  on public.public_activities (is_active, starts_at desc);

alter table public.public_activities enable row level security;

-- Leitura pública das ativas; admin enxerga tudo.
create policy "atividades ativas visíveis para todos"
  on public.public_activities for select
  using (is_active or public.is_admin());

create policy "admin gerencia atividades"
  on public.public_activities for all
  using (public.is_admin())
  with check (public.is_admin());

-- 4. Adesões/inscrições do público às atividades
create table if not exists public.activity_enrollments (
  id uuid primary key default gen_random_uuid(),
  activity_id uuid references public.public_activities(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  status text not null default 'PENDING' check (status in ('PENDING', 'CONFIRMED', 'CANCELLED', 'WAITLIST')),
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (activity_id, user_id)
);

create index if not exists idx_activity_enrollments_status
  on public.activity_enrollments (status, created_at desc);

alter table public.activity_enrollments enable row level security;

-- Usuário vê e cria a própria inscrição; admin vê e gerencia tudo.
create policy "usuário vê própria inscrição"
  on public.activity_enrollments for select
  using (auth.uid() = user_id or public.is_admin());

create policy "usuário cria inscrição própria"
  on public.activity_enrollments for insert
  with check (auth.uid() = user_id);

create policy "usuário cancela própria inscrição"
  on public.activity_enrollments for update
  using (auth.uid() = user_id or public.is_admin())
  with check (auth.uid() = user_id or public.is_admin());

create policy "admin remove inscrição"
  on public.activity_enrollments for delete
  using (public.is_admin());

-- 5. Admin também pode editar/excluir recursos e moderar comunidade
create policy "admin gerencia recursos (update)"
  on public.resources for update
  using (public.is_admin())
  with check (public.is_admin());

create policy "admin gerencia recursos (delete)"
  on public.resources for delete
  using (public.is_admin());

create policy "admin modera posts"
  on public.community_posts for delete
  using (public.is_admin());

create policy "admin modera comentários"
  on public.post_comments for delete
  using (public.is_admin());

-- 6. Trigger updated_at
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_public_activities_updated on public.public_activities;
create trigger trg_public_activities_updated
  before update on public.public_activities
  for each row execute function public.touch_updated_at();

drop trigger if exists trg_activity_enrollments_updated on public.activity_enrollments;
create trigger trg_activity_enrollments_updated
  before update on public.activity_enrollments
  for each row execute function public.touch_updated_at();
