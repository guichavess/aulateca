-- Corrige registros que foram inseridos com encoding latin1 mas armazenados em
-- coluna UTF-8 (mojibake: "OlÃ¡" em vez de "Olá"). É idempotente: só atualiza
-- linhas que ainda contêm o padrão de bytes corrompidos, então rodar de novo
-- depois de tudo limpo não muda nada.

-- Heurística: se 'Ã' aparece seguido de um byte alto (¡©§£µ³­º¢ª), é mojibake.
-- A correção converte o texto para bytes latin1 e re-decodifica como UTF-8.

update public.resources
set title = convert_from(convert_to(title, 'LATIN1'), 'UTF8')
where title ~ 'Ã[¡©§£µ³­º¢ª]';

update public.resources
set description = convert_from(convert_to(description, 'LATIN1'), 'UTF8')
where description ~ 'Ã[¡©§£µ³­º¢ª]';

update public.community_posts
set content = convert_from(convert_to(content, 'LATIN1'), 'UTF8')
where content ~ 'Ã[¡©§£µ³­º¢ª]';

update public.profiles
set name = convert_from(convert_to(name, 'LATIN1'), 'UTF8')
where name ~ 'Ã[¡©§£µ³­º¢ª]';

-- Diagnóstico: se ainda houver registros com mojibake após rodar isto, são
-- casos de double-encoding (LATIN1 → UTF8 → LATIN1 → UTF8). Inspecionar
-- manualmente com:
--   select id, title from public.resources where title ~ 'Ã[¡©§£µ³­º¢ª]';
