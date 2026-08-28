-- ════════════════════════════════════════════════════════════════════════════
-- 014 — Remove os 12 recursos fictícios semeados por 010_seed_resources.sql
--       (autores inventados, sem file_url). Decisão da gestão: o acervo
--       inicial é somente as fichas reais de 012_seed_atividades_ludicas.sql.
--
-- Restrito a author_id is null para nunca apagar algo publicado de verdade
-- por um usuário — mesmo que, por coincidência, tenha um desses uuids fixos.
-- ════════════════════════════════════════════════════════════════════════════

delete from public.resources
where id in (
  'a01a7eca-0000-4000-8000-000000000001',
  'a01a7eca-0000-4000-8000-000000000002',
  'a01a7eca-0000-4000-8000-000000000003',
  'a01a7eca-0000-4000-8000-000000000004',
  'a01a7eca-0000-4000-8000-000000000005',
  'a01a7eca-0000-4000-8000-000000000006',
  'a01a7eca-0000-4000-8000-000000000007',
  'a01a7eca-0000-4000-8000-000000000008',
  'a01a7eca-0000-4000-8000-000000000009',
  'a01a7eca-0000-4000-8000-000000000010',
  'a01a7eca-0000-4000-8000-000000000011',
  'a01a7eca-0000-4000-8000-000000000012'
)
and author_id is null;
