-- ════════════════════════════════════════════════════════════════════════════
-- 006 — CORREÇÃO DE SEGURANÇA: escalação de privilégio para ADMIN
--
-- Toda a autorização do sistema depende de public.profiles.role (é o que
-- public.is_admin() lê). Havia dois caminhos para um usuário comum se tornar
-- ADMIN sozinho:
--
--   1. UPDATE livre da própria linha. A policy da migration 001 era
--      `for update using (auth.uid() = id)` — sem WITH CHECK e sem restringir
--      coluna. Logo `update profiles set role='ADMIN' where id = auth.uid()`
--      passava.
--
--   2. Metadata do cadastro. handle_new_user() copiava
--      `raw_user_meta_data->>'role'`, e esse metadata é escrito pelo cliente no
--      signUp(). Bastava cadastrar mandando role: 'ADMIN'.
--
-- Efeito colateral corrigido junto: não existia policy permitindo o ADMIN
-- editar o perfil de OUTRO usuário, então adminUsersService.setRole() era um
-- no-op silencioso (o UPDATE casava 0 linhas e o PostgREST não devolve erro).
--
-- Idempotente: pode rodar mais de uma vez.
-- ════════════════════════════════════════════════════════════════════════════

-- ── 1. Papéis que o próprio usuário pode escolher no cadastro ───────────────
-- ADMIN fica fora de propósito: só é concedido por outro admin (UI /admin) ou
-- direto no banco com a service_role. Qualquer valor desconhecido vira
-- PROFESSOR em vez de estourar o cadastro.
create or replace function public.self_assignable_role(p_role text)
returns text
language sql
immutable
as $$
  select case
    when p_role in ('PROFESSOR', 'PAI_MAE', 'TERAPEUTA') then p_role
    else 'PROFESSOR'
  end;
$$;

-- ── 2. Criação de perfil no cadastro, agora com a role filtrada ─────────────
-- Mantém o comportamento da 005 para nome e foto.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, name, role, avatar_url)
  values (
    new.id,
    coalesce(
      nullif(new.raw_user_meta_data->>'name', ''),
      nullif(new.raw_user_meta_data->>'full_name', ''),
      split_part(new.email, '@', 1)
    ),
    public.self_assignable_role(new.raw_user_meta_data->>'role'),
    coalesce(
      nullif(new.raw_user_meta_data->>'avatar_url', ''),
      nullif(new.raw_user_meta_data->>'picture', '')
    )
  );
  return new;
end;
$$;

-- ── 3. Trava de role no UPDATE ─────────────────────────────────────────────
-- A policy sozinha não resolve: ela autoriza a LINHA, não a COLUNA. O usuário
-- continua dono da própria linha e precisa poder editar nome/avatar — só a
-- role é que não pode mudar por conta própria.
--
-- auth.uid() null = chamada sem JWT (service_role, SQL editor, dashboard).
-- Esse caminho é liberado de propósito: é como se promove o primeiro admin, e
-- ele já exige a chave secreta do projeto. Pelo anon key sem login o UPDATE
-- nem chega aqui — a RLS barra antes.
create or replace function public.guard_profile_role_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.role is distinct from old.role
     and auth.uid() is not null
     and not public.is_admin() then
    raise exception 'alteração de papel não permitida'
      using errcode = '42501';
  end if;
  return new;
end;
$$;

drop trigger if exists trg_profiles_guard_role on public.profiles;
create trigger trg_profiles_guard_role
  before update on public.profiles
  for each row execute function public.guard_profile_role_change();

-- ── 4. Policies de UPDATE em profiles ──────────────────────────────────────
-- WITH CHECK explícito impede também trocar o `id` da linha para o de outro.
drop policy if exists "usuário edita próprio perfil" on public.profiles;
create policy "usuário edita próprio perfil"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Sem esta, a tela /admin/usuarios não conseguia promover ninguém: o UPDATE
-- casava 0 linhas e falhava em silêncio. Policies se somam (OR), então o admin
-- passa por esta e o trigger acima o autoriza a mexer na role.
drop policy if exists "admin edita qualquer perfil" on public.profiles;
create policy "admin edita qualquer perfil"
  on public.profiles for update
  using (public.is_admin())
  with check (public.is_admin());

-- ════════════════════════════════════════════════════════════════════════════
-- APÓS APLICAR — auditoria obrigatória
--
-- A falha esteve aberta enquanto o sistema rodou, então pode já existir ADMIN
-- indevido. Rode no SQL editor e confira nome por nome:
--
--   select p.id, p.name, p.role, u.email, p.created_at
--   from public.profiles p
--   join auth.users u on u.id = p.id
--   where p.role = 'ADMIN'
--   order by p.created_at;
--
-- Para rebaixar quem não deveria estar lá (a service_role do SQL editor passa
-- pelo trigger, como descrito no item 3):
--
--   update public.profiles set role = 'PROFESSOR' where id = '<uuid>';
-- ════════════════════════════════════════════════════════════════════════════
