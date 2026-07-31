-- Login via Google popula nome e foto em raw_user_meta_data com chaves próprias
-- do provedor; o trigger de criação de perfil só olhava 'name' e ignorava a foto.
-- Passa a aceitar as variações que o Supabase repassa do OAuth:
--   nome  → name | full_name
--   foto  → avatar_url | picture
-- Cadastro por e-mail/senha não tem essas chaves extras, então o comportamento
-- anterior (nome do form, avatar null) é preservado.
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, name, role, avatar_url)
  values (
    new.id,
    coalesce(
      nullif(new.raw_user_meta_data->>'name', ''),
      nullif(new.raw_user_meta_data->>'full_name', ''),
      split_part(new.email, '@', 1)
    ),
    coalesce(new.raw_user_meta_data->>'role', 'PROFESSOR'),
    coalesce(
      nullif(new.raw_user_meta_data->>'avatar_url', ''),
      nullif(new.raw_user_meta_data->>'picture', '')
    )
  );
  return new;
end;
$$ language plpgsql security definer;
