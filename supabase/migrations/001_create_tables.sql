-- Perfis de usuário (extende o auth.users do Supabase)
create table if not exists public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  name text not null,
  role text not null default 'PROFESSOR' check (role in ('PROFESSOR', 'PAI_MAE', 'TERAPEUTA')),
  avatar_url text,
  created_at timestamptz default now()
);

-- Recursos pedagógicos
create table if not exists public.resources (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null,
  category text not null check (category in ('narrative','descriptive','opinion','poetry','informative','games')),
  type text not null check (type in ('video','pdf')),
  age_range text not null,
  duration text not null,
  file_url text,
  is_new boolean default false,
  downloads integer default 0,
  rating numeric(3,1) default 0,
  author_id uuid references public.profiles(id) on delete set null,
  created_at timestamptz default now()
);

-- Favoritos
create table if not exists public.favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  resource_id uuid references public.resources(id) on delete cascade not null,
  created_at timestamptz default now(),
  unique(user_id, resource_id)
);

-- Posts da comunidade
create table if not exists public.community_posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid references auth.users(id) on delete cascade not null,
  content text not null,
  created_at timestamptz default now()
);

-- Likes dos posts
create table if not exists public.post_likes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  post_id uuid references public.community_posts(id) on delete cascade not null,
  created_at timestamptz default now(),
  unique(user_id, post_id)
);

-- Comentários dos posts
create table if not exists public.post_comments (
  id uuid primary key default gen_random_uuid(),
  author_id uuid references auth.users(id) on delete cascade not null,
  post_id uuid references public.community_posts(id) on delete cascade not null,
  content text not null,
  created_at timestamptz default now()
);

-- Perfil criado automaticamente ao cadastrar usuário
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'role', 'PROFESSOR')
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Função para incrementar downloads
create or replace function public.increment_downloads(resource_id uuid)
returns void as $$
  update public.resources set downloads = downloads + 1 where id = resource_id;
$$ language sql security definer;

-- Permissões de acesso (RLS)
alter table public.profiles enable row level security;
alter table public.resources enable row level security;
alter table public.favorites enable row level security;
alter table public.community_posts enable row level security;
alter table public.post_likes enable row level security;
alter table public.post_comments enable row level security;

-- Recursos: qualquer um pode ver, só o dono pode criar/editar
create policy "recursos visíveis para todos" on public.resources for select using (true);
create policy "usuário cria recurso" on public.resources for insert with check (auth.uid() = author_id);

-- Favoritos: cada um vê e gerencia só os seus
create policy "favoritos do próprio usuário" on public.favorites for all using (auth.uid() = user_id);

-- Comunidade: todos veem, autenticados criam
create policy "posts visíveis para todos" on public.community_posts for select using (true);
create policy "usuário cria post" on public.community_posts for insert with check (auth.uid() = author_id);

-- Likes e comentários
create policy "likes visíveis para todos" on public.post_likes for select using (true);
create policy "usuário gerencia like" on public.post_likes for all using (auth.uid() = user_id);
create policy "comentários visíveis para todos" on public.post_comments for select using (true);
create policy "usuário comenta" on public.post_comments for insert with check (auth.uid() = author_id);

-- Perfis: todos veem, cada um edita o seu
create policy "perfis visíveis para todos" on public.profiles for select using (true);
create policy "usuário edita próprio perfil" on public.profiles for update using (auth.uid() = id);
