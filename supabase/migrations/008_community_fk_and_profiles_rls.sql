-- ════════════════════════════════════════════════════════════════════════════
-- 008 — FK de posts/comentários → profiles e fecha leitura de profiles para
--       anônimos. Idempotente: pode rodar múltiplas vezes.
-- ════════════════════════════════════════════════════════════════════════════

-- 1. community_posts.author_id e post_comments.author_id passam a referenciar
--    profiles(id). Antes apontavam para auth.users, e sem FK para profiles o
--    PostgREST recusa o embed `profiles(name)` com PGRST200 — o que derruba o
--    feed inteiro da comunidade. Mesmo procedimento aplicado em 004 para
--    activity_enrollments. profiles.id é 1:1 com auth.users(id), então nenhuma
--    linha existente é invalidada. Mantemos o MESMO nome de constraint.
alter table public.community_posts
  drop constraint if exists community_posts_author_id_fkey;

alter table public.community_posts
  add constraint community_posts_author_id_fkey
  foreign key (author_id) references public.profiles(id) on delete cascade;

alter table public.post_comments
  drop constraint if exists post_comments_author_id_fkey;

alter table public.post_comments
  add constraint post_comments_author_id_fkey
  foreign key (author_id) references public.profiles(id) on delete cascade;

-- 2. profiles: SELECT era `using (true)`, ou seja, qualquer requisição com a
--    anon key (sem login) baixava nome, avatar e ROLE de toda a base — a lista
--    de quem é ADMIN é o mapa para um ataque direcionado.
--    Restringimos a usuários autenticados. Não dá para limitar ao próprio
--    perfil: os embeds `profiles(name)` da comunidade e do catálogo resolvem
--    sob a RLS do leitor e o nome do autor viraria null para todo mundo.
drop policy if exists "perfis visíveis para todos" on public.profiles;
drop policy if exists "perfis visíveis para autenticados" on public.profiles;

create policy "perfis visíveis para autenticados" on public.profiles
  for select to authenticated using (true);
