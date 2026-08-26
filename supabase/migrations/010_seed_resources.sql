-- ════════════════════════════════════════════════════════════════════════════
-- 010 — Acervo inicial de `resources`. Idempotente via `on conflict do nothing`
--       com uuids fixos: rodar de novo não duplica nem sobrescreve edições
--       feitas pelo /admin depois.
--
-- Estes são exatamente os 12 itens de src/lib/data.ts, que hoje o app serve
-- como fallback quando o banco volta vazio. Com eles no banco, o fallback deixa
-- de ser exercitado e passa a ser o que deveria ser: um plano B.
--
-- author_id fica null de propósito — o acervo curado não pertence a nenhum
-- usuário de auth.users. A autoria exibida vem de author_name (ver 009).
-- ════════════════════════════════════════════════════════════════════════════

insert into public.resources
  (id, title, description, category, type, age_range, duration, downloads, rating, is_new, image_url, author_name)
values
  ('a01a7eca-0000-4000-8000-000000000001', 'Contando Histórias', 'Aprenda a criar narrativas criativas com começo, meio e fim usando elementos visuais e prompts de escrita.', 'producao-texto', 'video', '6-8', '15min', 2340, 4.9, true, '/catalog/fabrica-textos.png', 'Profa. Ana Lima'),
  ('a01a7eca-0000-4000-8000-000000000002', 'Meu Primeiro Texto', 'Material completo para introdução à produção textual com atividades de escrita guiada para os anos iniciais.', 'producao-texto', 'pdf', '6-8', '20min', 5120, 4.8, false, '/catalog/kit-producao-texto.png', 'Profa. Maria Santos'),
  ('a01a7eca-0000-4000-8000-000000000003', 'Descrevendo o Mundo', 'Atividades para desenvolver textos descritivos usando os cinco sentidos e observação do ambiente.', 'interpretacao-texto', 'video', '9-11', '30min', 1890, 4.7, true, '/catalog/explorando-classes-gramaticais.png', 'Prof. Carlos Mendes'),
  ('a01a7eca-0000-4000-8000-000000000004', 'Poesia na Sala de Aula', 'Oficina de criação poética com rimas, versos e estrofes para despertar a sensibilidade literária.', 'sondagem', 'pdf', '9-11', '25min', 3200, 4.9, false, '/catalog/palavras-magicas.png', 'Profa. Julia Costa'),
  ('a01a7eca-0000-4000-8000-000000000005', 'Carta do Leitor', 'Material sobre produção de textos de opinião com foco em argumentação e posicionamento crítico.', 'producao-texto', 'pdf', '12-14', '35min', 1450, 4.6, false, '/catalog/producao-dissertativa.png', 'Prof. Roberto Silva'),
  ('a01a7eca-0000-4000-8000-000000000006', 'Caça-Palavras Textual', 'Jogos de caça-palavras temáticos para desenvolver vocabulário e ortografia aplicados à produção de texto.', 'ludica', 'pdf', '6-8', '10min', 4500, 4.8, true, '/catalog/oficina-ortografica.png', 'Profa. Fernanda Oliveira'),
  ('a01a7eca-0000-4000-8000-000000000007', 'Fábulas e Recontos', 'Videoaulas sobre reconto de fábulas clássicas e criação de versões autorais pelos alunos.', 'producao-texto', 'video', '6-8', '18min', 2100, 4.7, false, '/catalog/role-reconte.png', 'Profa. Ana Lima'),
  ('a01a7eca-0000-4000-8000-000000000008', 'Roda de Escrita', 'Guia completo para organizar rodas de escrita colaborativa e revisão de textos entre pares.', 'interpretacao-texto', 'pdf', '9-11', '40min', 3800, 4.9, true, '/catalog/banquinha-leitura.png', 'Profa. Maria Santos'),
  ('a01a7eca-0000-4000-8000-000000000009', 'Reportagem Escolar', 'Projeto de criação de jornal escolar com textos informativos e jornalísticos produzidos pelos alunos.', 'interpretacao-texto', 'video', '12-14', '25min', 2750, 4.8, false, '/catalog/cineroteirista.png', 'Prof. Carlos Mendes'),
  ('a01a7eca-0000-4000-8000-000000000010', 'Teatro de Palavras', 'Atividade de criação de roteiros teatrais e diálogos para estimular a escrita criativa e a oralidade.', 'ludica', 'video', '9-11', '20min', 1980, 4.6, true, '/catalog/festival-textual.png', 'Profa. Julia Costa'),
  ('a01a7eca-0000-4000-8000-000000000011', 'Quiz Ortográfico', 'Jogo interativo de ortografia e gramática aplicada à produção textual.', 'ludica', 'pdf', '12-14', '15min', 3100, 4.7, false, '/catalog/stop-ortografia.png', 'Prof. Roberto Silva'),
  ('a01a7eca-0000-4000-8000-000000000012', 'Diário de Bordo', 'Aprenda a escrever diários e relatos pessoais com técnicas de narrativa em primeira pessoa.', 'producao-texto', 'video', '9-11', '22min', 4200, 4.9, true, '/catalog/diario-aventuras.png', 'Profa. Ana Lima')
on conflict (id) do nothing;
