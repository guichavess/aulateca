-- ════════════════════════════════════════════════════════════════════════════
-- 004 — FK de adesões → profiles, agregações no banco, capacidade/waitlist
--       transacional e bucket de imagens das atividades.
--       Idempotente: pode rodar múltiplas vezes sem quebrar dados existentes.
-- ════════════════════════════════════════════════════════════════════════════

-- 1. FK de activity_enrollments.user_id passa a referenciar profiles(id).
--    Antes apontava para auth.users, o que tornava o embed
--    `profiles!activity_enrollments_user_id_fkey` frágil no PostgREST.
--    profiles.id é 1:1 com auth.users(id), então nenhuma linha é invalidada.
--    Mantemos o MESMO nome de constraint para o embed continuar válido.
alter table public.activity_enrollments
  drop constraint if exists activity_enrollments_user_id_fkey;

alter table public.activity_enrollments
  add constraint activity_enrollments_user_id_fkey
  foreign key (user_id) references public.profiles(id) on delete cascade;

-- 2. Contagem de adesões por status via agregação no banco (não varrer no JS).
--    SECURITY DEFINER ignora RLS, então restringimos a admins no WHERE.
create or replace function public.enrollment_counts()
returns table (status text, count bigint)
language sql
stable
security definer
set search_path = public
as $$
  select e.status, count(*)
  from public.activity_enrollments e
  where public.is_admin()
  group by e.status;
$$;

-- 3. Lugares ocupados por atividade (PENDING + CONFIRMED contam vaga).
--    Usado para exibir vagas restantes na UI admin.
create or replace function public.activity_enrollment_counts()
returns table (activity_id uuid, taken bigint)
language sql
stable
security definer
set search_path = public
as $$
  select e.activity_id, count(*)
  from public.activity_enrollments e
  where e.status in ('PENDING', 'CONFIRMED')
    and public.is_admin()
  group by e.activity_id;
$$;

-- 4. Inscrição transacional com regra de capacidade e waitlist automática.
--    `for update` na atividade serializa inscrições concorrentes na mesma
--    atividade, evitando corrida ao contar vagas. SECURITY DEFINER para poder
--    ler as demais inscrições da atividade sem violar RLS.
create or replace function public.enroll_in_activity(
  p_activity_id uuid,
  p_notes text default null
)
returns public.activity_enrollments
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_capacity integer;
  v_active boolean;
  v_taken integer;
  v_status text;
  v_row public.activity_enrollments;
begin
  if v_user is null then
    raise exception 'not authenticated' using errcode = '28000';
  end if;

  -- Trava a atividade para serializar inscrições concorrentes.
  select capacity, is_active
    into v_capacity, v_active
  from public.public_activities
  where id = p_activity_id
  for update;

  if not found or not v_active then
    raise exception 'activity not available' using errcode = 'P0002';
  end if;

  -- Já inscrito: idempotente, devolve a inscrição existente.
  select * into v_row
  from public.activity_enrollments
  where activity_id = p_activity_id and user_id = v_user;
  if found then
    return v_row;
  end if;

  if v_capacity is null then
    v_status := 'PENDING';
  else
    select count(*) into v_taken
    from public.activity_enrollments
    where activity_id = p_activity_id
      and status in ('PENDING', 'CONFIRMED');
    v_status := case when v_taken >= v_capacity then 'WAITLIST' else 'PENDING' end;
  end if;

  insert into public.activity_enrollments (activity_id, user_id, status, notes)
  values (p_activity_id, v_user, v_status, p_notes)
  returning * into v_row;

  return v_row;
end;
$$;

-- 5. Bucket público para imagens das atividades. Escrita só de admin; leitura
--    pública. Policies com drop/create para idempotência (CREATE POLICY não
--    aceita IF NOT EXISTS).
insert into storage.buckets (id, name, public)
values ('activity-images', 'activity-images', true)
on conflict (id) do nothing;

drop policy if exists "activity images public read" on storage.objects;
create policy "activity images public read"
  on storage.objects for select
  using (bucket_id = 'activity-images');

drop policy if exists "admin insere imagem de atividade" on storage.objects;
create policy "admin insere imagem de atividade"
  on storage.objects for insert
  with check (bucket_id = 'activity-images' and public.is_admin());

drop policy if exists "admin atualiza imagem de atividade" on storage.objects;
create policy "admin atualiza imagem de atividade"
  on storage.objects for update
  using (bucket_id = 'activity-images' and public.is_admin())
  with check (bucket_id = 'activity-images' and public.is_admin());

drop policy if exists "admin remove imagem de atividade" on storage.objects;
create policy "admin remove imagem de atividade"
  on storage.objects for delete
  using (bucket_id = 'activity-images' and public.is_admin());
