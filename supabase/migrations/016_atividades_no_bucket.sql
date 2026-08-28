-- ════════════════════════════════════════════════════════════════════════════
-- 016 — file_url das atividades deixa de ser URL pública e vira caminho no
--       bucket privado `atividades`.
--
-- Contexto: a 015 criou o bucket privado e as policies, mas os PDFs continuavam
-- em public/atividades/ — baixáveis por URL direta, sem sessão e sem compra. O
-- paywall existia na tela e não no arquivo. A Fase 5 tira os PDFs do repositório
-- e os sobe para o bucket (scripts/upload-atividades.mjs); esta migration
-- reescreve as linhas que já foram semeadas pela 012 em bancos existentes.
--
-- Antes:  '/atividades/ludica/<slug>/<slug>.pdf'   (URL servida pelo Vercel)
-- Depois: 'ludica/<slug>/<slug>.pdf'               (chave dentro do bucket)
--
-- image_url NÃO muda: a capa é vitrine e continua pública, versionada em
-- public/atividades/ludica/<slug>/capa.webp.
--
-- Idempotente: o filtro `like '/atividades/ludica/%'` só pega o formato antigo,
-- então rodar duas vezes não faz nada na segunda.
-- ════════════════════════════════════════════════════════════════════════════

update public.resources
set file_url = regexp_replace(file_url, '^/atividades/', '')
where file_url like '/atividades/ludica/%';

-- ── Conferência ─────────────────────────────────────────────────────────────
-- Depois de aplicar, isto deve devolver 0 linhas:
--
--   select id, title, file_url
--   from public.resources
--   where file_url like '/atividades/%';
--
-- E o acervo lúdico deve aparecer como caminho relativo:
--
--   select count(*) from public.resources where file_url like 'ludica/%';
--   -- esperado: 54
--
-- ⚠ A migration sozinha não entrega arquivo nenhum. Enquanto
-- `node scripts/upload-atividades.mjs` não rodar contra este projeto, o bucket
-- está vazio e "Baixar Recurso" falha para todo mundo — inclusive para quem
-- pagou. Aplicar a 016 e subir os arquivos são a mesma tarefa.
