-- ════════════════════════════════════════════════════════════════════════════
-- 007 — Bucket de fotos de perfil
--
-- profiles.avatar_url já existia desde a 001 e o trigger de signup grava a foto
-- do Google (005/006), mas não havia onde hospedar upload próprio: o único
-- bucket é `activity-images`, cujo insert é restrito a admin. Sem isto, "trocar
-- foto" na tela de perfil não teria destino.
--
-- Convenção de caminho: avatars/<uid>/<arquivo>. As policies amarram o primeiro
-- segmento do path ao auth.uid(), então ninguém sobrescreve a foto de outro —
-- é isso que impede um usuário logado de trocar o avatar alheio via API.
-- Idempotente.
-- ════════════════════════════════════════════════════════════════════════════

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'avatars',
  'avatars',
  true,
  2097152, -- 2 MB; o cliente também valida, mas o limite real precisa ser do servidor
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update
  set public             = excluded.public,
      file_size_limit    = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- Leitura pública: o avatar aparece em posts da comunidade e no header, para
-- qualquer visitante logado. Bucket público serve URL direta, sem signed URL.
drop policy if exists "avatares com leitura pública" on storage.objects;
create policy "avatares com leitura pública"
  on storage.objects for select
  using (bucket_id = 'avatars');

-- Escrita: só na própria pasta. storage.foldername(name) devolve os segmentos
-- do caminho; [1] é a pasta raiz, que precisa ser o uid de quem chama.
drop policy if exists "usuário envia próprio avatar" on storage.objects;
create policy "usuário envia próprio avatar"
  on storage.objects for insert
  with check (
    bucket_id = 'avatars'
    and auth.uid() is not null
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "usuário atualiza próprio avatar" on storage.objects;
create policy "usuário atualiza próprio avatar"
  on storage.objects for update
  using (
    bucket_id = 'avatars'
    and auth.uid() is not null
    and (storage.foldername(name))[1] = auth.uid()::text
  )
  with check (
    bucket_id = 'avatars'
    and auth.uid() is not null
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "usuário remove próprio avatar" on storage.objects;
create policy "usuário remove próprio avatar"
  on storage.objects for delete
  using (
    bucket_id = 'avatars'
    and auth.uid() is not null
    and (storage.foldername(name))[1] = auth.uid()::text
  );
