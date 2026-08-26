-- ════════════════════════════════════════════════════════════════════════════
-- 009 — Alinha `resources` ao que o app realmente usa. Idempotente.
-- ════════════════════════════════════════════════════════════════════════════

-- 1. A taxonomia do banco parou em 001 ('narrative','descriptive',…) enquanto o
--    frontend migrou para 'producao-texto', 'ludica' etc. (ver CategoryId em
--    src/lib/types.ts). Qualquer insert vindo do app hoje é rejeitado pelo
--    check. Migramos os valores antigos e trocamos a constraint.
alter table public.resources
  drop constraint if exists resources_category_check;

update public.resources set category = case category
  when 'narrative'    then 'producao-texto'
  when 'opinion'      then 'producao-texto'
  when 'poetry'       then 'producao-texto'
  when 'descriptive'  then 'interpretacao-texto'
  when 'informative'  then 'interpretacao-texto'
  when 'games'        then 'ludica'
  else category
end
where category in ('narrative','descriptive','opinion','poetry','informative','games');

alter table public.resources
  add constraint resources_category_check check (category in (
    'producao-texto','interpretacao-texto','ludica','sondagem','datas-comemorativas'
  ));

-- 2. ResourceCard renderiza `resource.imageUrl`, mas a coluna nunca existiu em
--    `resources` — só em `public_activities` (003:34). Sem ela, todo card vindo
--    do banco cai no placeholder colorido, enquanto os mocks têm arte.
alter table public.resources add column if not exists image_url text;

-- 3. Autoria do acervo curado. `author_id` referencia profiles → auth.users, ou
--    seja, só serve para material publicado por um usuário cadastrado. O acervo
--    inicial não tem dono no auth, e sem isto todo card exibiria "Aulateca".
alter table public.resources add column if not exists author_name text;
