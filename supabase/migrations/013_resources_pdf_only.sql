-- ════════════════════════════════════════════════════════════════════════════
-- 013 — Virada PDF-only: toda atividade no produto é PDF, não existe mais
--       vídeo (decisão da gestão). Aperta o CHECK que nasceu em
--       001_create_tables.sql aceitando 'video' | 'pdf'.
-- ════════════════════════════════════════════════════════════════════════════

update public.resources set type = 'pdf' where type <> 'pdf';

alter table public.resources drop constraint if exists resources_type_check;
alter table public.resources add constraint resources_type_check check (type = 'pdf');
alter table public.resources alter column type set default 'pdf';
