# Prompts de correção — pendências para rodar o anúncio

Cada bloco abaixo é um prompt independente para uma sessão do Claude Code na raiz
do projeto. Rode **um por vez**, em branch separada, e revise o diff antes do
merge. A ordem importa: P0 antes de ligar mídia paga, P1 antes de escalar verba,
P2 depois.

Já resolvido (não está aqui): escalação de privilégio para ADMIN
(`supabase/migrations/006_fix_role_escalation.sql`) e remoção do login com Google.

> **Cole este bloco de contexto antes de qualquer prompt abaixo:**
>
> Contexto: AulaTeca — plataforma de recursos pedagógicos. Frontend Vite +
> React + TS + Tailwind + shadcn em `src/`, deploy na Vercel. Auth, banco e
> storage no Supabase (migrations em `supabase/migrations/`, RLS habilitada).
> Um microsserviço FastAPI em `backend/fastapi/` cuida só da IA (a "Teca"),
> deploy no Render. O produto será vendido pela Hotmart. Antes de mudar algo,
> leia os arquivos envolvidos. Não invente números nem promessas comerciais.
> Rode `npm run typecheck`, `npm run lint` e `npm test` ao final.

---

## P0 — bloqueadores. Sem isso, não liga o anúncio.

### P0-1 · Liberar acesso só para quem comprou (Hotmart)

```
Hoje qualquer pessoa cria conta grátis pelo formulário de cadastro em
src/pages/auth/LoginPage.tsx (view 'register') e entra no sistema inteiro. Como
o produto passa a ser vendido pela Hotmart, o acesso deve existir apenas para
quem comprou.

Implemente:

1. Um endpoint de webhook da Hotmart no FastAPI (backend/fastapi/), em um router
   novo `app/routers/hotmart.py`. Ele deve:
   - validar a autenticidade da requisição pelo mecanismo oficial da Hotmart
     (hottok / assinatura no header), com o segredo vindo de variável de
     ambiente — nunca hardcoded;
   - tratar os eventos de compra aprovada, reembolso, chargeback e cancelamento
     de assinatura;
   - ser idempotente: a Hotmart reenvia webhook, então o mesmo evento não pode
     criar usuário duplicado nem alternar o acesso duas vezes;
   - responder rápido (2xx) e registrar o evento cru numa tabela de auditoria.
2. Uma migration nova (`supabase/migrations/007_*.sql`) com:
   - tabela `entitlements` (user_id, hotmart_transaction_id único, produto,
     status ACTIVE/REFUNDED/CANCELLED, datas), RLS ligada, leitura só do próprio
     usuário e de admin, escrita nenhuma pelo cliente;
   - tabela de log dos webhooks recebidos (payload cru + status de processamento);
   - função `public.has_active_access()` para usar nas policies.
3. Provisionamento do usuário: na compra aprovada, criar o usuário no Supabase
   com a service_role a partir do e-mail da compra e disparar convite / magic
   link para ele definir a senha. A service_role key fica só no backend.
4. No frontend: remover a view 'register' de LoginPage.tsx e o método
   `register` de src/services/auth.service.ts. A tela passa a ter só entrar +
   "esqueci a senha". Quem cai no login sem ter comprado precisa de uma
   mensagem clara com link para a página de vendas.
5. Bloquear o app para quem não tem entitlement ativo (reembolso/chargeback
   revoga o acesso), com uma tela explicando e oferecendo o link de recompra.

Critério de aceite: um webhook de compra aprovada cria o acesso; o mesmo webhook
reenviado não duplica nada; um webhook de reembolso revoga; requisição sem
assinatura válida é recusada com 401. Escreva testes para a validação de
assinatura e para a idempotência.

Não faça: não exponha a service_role key no frontend, não confie em nenhum campo
do payload sem validar a assinatura antes, não deixe o cadastro público de pé
"por enquanto".
```

### P0-2 · Entregar o conteúdo que o anúncio promete

```
A landing vende "226+ atividades, 37 jogos lúdicos e 47 exercícios
complementares prontos para usar". Hoje o repositório tem 6 PDFs em
public/atividades/ e ~50 imagens de capa em public/catalog/. O catálogo em
src/lib/catalogData.ts é uma vitrine com título e imagem, sem arquivo para
baixar, e o botão de detalhes só mostra toast de "em breve". Pior: HomePage,
ExplorePage, CategoryPage, FavoritesPage e CommunityPage caem em dados mockados
de src/lib/data.ts quando o Supabase volta vazio (ver o comentário
"FALLBACK MOCK" em src/pages/home/HomePage.tsx:36).

Faça, nesta ordem:

1. Um inventário honesto: leia src/lib/catalogData.ts e liste, em
   docs/inventario-conteudo.md, todos os itens do catálogo marcando quais têm
   arquivo real disponível em public/ e quais não têm. Some os totais por
   categoria. Esse documento é o que vai dizer que número a landing pode
   afirmar.
2. Modele a entrega real: cada item de catálogo precisa apontar para um arquivo.
   Crie a migration necessária (bucket privado no Supabase Storage + tabela
   ligando item → arquivo, com RLS que só libera download para quem tem acesso
   ativo — ver a função has_active_access do prompt P0-1) e o serviço de
   download por signed URL com expiração curta.
3. Remova todos os fallbacks para mock: HomePage, ExplorePage, CategoryPage,
   FavoritesPage, CommunityPage. Estado vazio passa a ser um empty state honesto
   ("ainda não há recursos nesta categoria"), nunca conteúdo fictício. Apague o
   que virar código morto em src/lib/data.ts e atualize MOCKS.txt (ele está
   desatualizado: descreve arquivos em caminhos que não existem mais).
4. Escreva um script de seed (scripts/) que popula a tabela `resources` a partir
   dos arquivos reais, para o time subir conteúdo sem passar por SQL na mão.

Critério de aceite: com o banco vazio, nenhuma tela mostra recurso inventado;
um item de catálogo com arquivo faz download real por URL assinada; um usuário
sem acesso ativo recebe 403 ao tentar baixar; docs/inventario-conteudo.md tem os
totais reais por categoria.

Não faça: não invente conteúdo para preencher a lacuna, não gere PDFs
placeholder, não mantenha "só um mockzinho" em nenhuma tela.
```

### P0-3 · Copy da landing sem promessa falsa

```
A landing (src/components/landing/*.tsx) faz afirmações que o produto não
sustenta hoje. Preciso que ela fique verdadeira antes de receber tráfego pago —
é exposição ao CDC art. 37 e ao CONAR, e é motivo de reprovação nas políticas
de anúncio do Meta e do Google.

Pontos a corrigir:

- "7 dias de garantia · Cancele quando quiser · Comece grátis" aparece em
  HeroSection.tsx:108 e FinalCTASection.tsx:50. Não existe assinatura nem
  checkout no produto: a venda é one-off pela Hotmart. Ajuste para as condições
  reais da oferta cadastrada na Hotmart (a garantia legal de 7 dias do
  arrependimento vale para compra online e pode ficar, se a oferta a respeitar;
  "cancele quando quiser" e "comece grátis" saem se não houver recorrência nem
  plano gratuito).
- "Junte-se a mais de 8.500 professoras" (FinalCTASection.tsx:38) e "8.500
  professoras" (HowItWorksSection.tsx:39): número sem lastro. Substitua por algo
  verificável ou tire. Se houver base real, use o número real.
- "226+ atividades / 37 jogos / 47 exercícios" (HeroSection.tsx): use os totais
  de docs/inventario-conteudo.md (gerado no prompt P0-2). Se o inventário ainda
  não existir, PARE e me avise em vez de chutar.
- "Crie sua conta grátis em 30 segundos" (HowItWorksSection.tsx:6): o acesso
  passa a ser liberado após a compra na Hotmart. Reescreva o passo a passo para
  o fluxo real (comprar → receber e-mail → definir senha → entrar).
- Os depoimentos e qualquer selo/estatística na landing: liste em um comentário
  no PR quais são reais e quais são de exemplo. Os de exemplo saem.

Ao final, escreva em docs/claims-landing.md uma tabela: afirmação → fonte que a
sustenta. Toda afirmação que sobrar na página precisa de linha nessa tabela.

Critério de aceite: nenhuma afirmação na landing sem linha correspondente em
docs/claims-landing.md.

Não faça: não "suavize" número inventado deixando ele lá (ex.: trocar 8.500 por
"milhares"), não invente depoimento, não mexa no layout/visual — só no texto.
```

### P0-4 · Rastreamento e consentimento

```
O projeto não tem nenhum rastreamento: sem GA4, sem Meta Pixel, sem GTM. Sem
isso não dá para medir CPL nem otimizar campanha por conversão, e o anúncio
vira queima de verba.

Implemente:

1. GA4 e Meta Pixel carregados via variáveis de ambiente VITE_* (IDs nunca
   hardcoded), com um módulo único em src/lib/analytics.ts que exponha
   `trackPageView` e `trackEvent`. Nada de espalhar snippet por componente.
2. Page views em mudança de rota (é uma SPA com react-router — o pageview
   nativo só dispara no primeiro load). Ver src/App.tsx.
3. Eventos de conversão do funil, com nome consistente entre GA4 e Meta:
   - view_landing
   - click_cta_landing (com origem: hero ou final)
   - click_comprar (saída para o checkout da Hotmart)
   - login_sucesso
   - primeiro_plano_gerado (a IA é o argumento de venda — medir ativação)
4. Consentimento LGPD: banner de cookies que bloqueia GA4 e Pixel até o aceite,
   com opção real de recusar (não pode ser só um "OK"). O consentimento fica
   persistido e é respeitado nos loads seguintes. Use o Consent Mode do GA4.
5. Documente em docs/rastreamento.md quais eventos existem, onde disparam e o
   que configurar no painel do Meta e do GA4 (o que precisa de ação humana).

Critério de aceite: com o consentimento recusado, nenhuma requisição sai para
google-analytics.com ou facebook.net — verifique de fato com as ferramentas de
rede do navegador. Com o consentimento aceito, os cinco eventos disparam nos
pontos certos.

Não faça: não instale GTM "para resolver depois", não dispare evento antes do
consentimento, não deixe ID de pixel commitado no repositório.
```

### P0-5 · Política de privacidade, termos de uso e LGPD

```
O projeto não tem política de privacidade nem termos de uso. Isso é exigência da
LGPD e requisito das políticas de anúncio do Meta e do Google Ads — sem isso a
conta de anúncios pode ser reprovada. Somos controladores de dado pessoal
(cadastro, e-mail, dados de compra vindos da Hotmart, conteúdo gerado).

Implemente:

1. Rotas públicas /privacidade e /termos em src/App.tsx (acessíveis SEM login —
   hoje o catch-all de deslogado joga tudo para a tela de login, cuidado com
   isso), com link no rodapé da landing e na tela de login.
2. Conteúdo em português, cobrindo: quais dados coletamos e por quê, base legal
   de cada tratamento, com quem compartilhamos (Supabase, Vercel, Render,
   Hotmart, Google/Meta se o rastreamento estiver ligado, provedores de IA),
   transferência internacional, prazo de retenção, direitos do titular e canal
   para exercê-los, e o encarregado (DPO) com e-mail de contato.
3. Um ponto que precisa estar explícito: o texto que a professora envia para a
   Teca vai para Google (Gemini) e OpenAI — ver backend/fastapi/app/services/
   ai_service.py. Isso tem que estar na política, junto com a orientação de não
   inserir dado pessoal de aluno no chat.
4. Marque com [PREENCHER] tudo que depende de decisão da empresa (razão social,
   CNPJ, endereço, e-mail do DPO, prazo de retenção). Não invente esses dados.

Critério de aceite: /privacidade e /termos abrem para visitante deslogado e
estão linkadas no rodapé da landing.

Não faça: não copie política de outro site, não afirme certificação ou prática
que não temos, não deixe o documento sem os pontos de IA e de Hotmart.
```

### P0-6 · Rota da landing e caminho do CTA

```
A landing só existe em /landing (src/App.tsx). Quem digita aulateca.com.br cai
na tela de login, porque a rota "*" de deslogado renderiza LoginPage. E os CTAs
da landing (HeroSection.tsx e FinalCTASection.tsx) apontam para "/", ou seja,
jogam o visitante do anúncio direto numa tela de login sem contexto.

Faça:

1. Visitante deslogado em "/" vê a landing. Usuário logado em "/" continua indo
   para a Home do app. A tela de login passa a viver em /entrar.
2. /landing continua funcionando com redirect 301 para "/" (pode haver link
   externo já apontando para lá).
3. Os CTAs da landing passam a apontar para o checkout da Hotmart (URL vinda de
   variável de ambiente VITE_*, não hardcoded), com o evento click_comprar do
   prompt P0-4 disparando antes da navegação. O link para /entrar fica separado,
   discreto, para quem já comprou ("já tem acesso? entrar").
4. Preserve os parâmetros de campanha (utm_*, fbclid, gclid) da URL de entrada
   até o checkout, senão a atribuição da campanha se perde.

Critério de aceite: aulateca.com.br deslogado mostra a landing; o CTA leva ao
checkout com os utm preservados; /landing redireciona; usuário logado não vê a
landing.

Não faça: não quebre a rota do app para quem está logado, não hardcode a URL do
checkout.
```

### P0-7 · E-mail transacional confiável

```
Todo o fluxo de acesso vai depender de e-mail (convite pós-compra, definição de
senha, recuperação). O projeto usa o SMTP padrão do Supabase, que tem limite
muito baixo por hora e entregabilidade ruim — com tráfego pago isso derruba
acesso de gente que pagou, silenciosamente. Além disso, o botão "Esqueceu a
senha?" em src/pages/auth/LoginPage.tsx só mostra um toast de "em breve".

Faça:

1. Implemente de verdade a recuperação de senha (resetPasswordForEmail +
   tela de definição de nova senha), incluindo a rota de retorno do link.
2. Documente em docs/email-transacional.md o passo a passo para configurar SMTP
   próprio no Supabase (Resend ou SendGrid): domínio verificado, SPF, DKIM,
   DMARC, remetente. Deixe explícito o que só pode ser feito no painel.
3. Reescreva os templates de e-mail do Supabase (convite, confirmação,
   recuperação) em português e com a identidade da AulaTeca — entregue os HTMLs
   em docs/templates-email/ prontos para colar no painel.
4. Revise o comportamento do app quando a sessão nasce por link de e-mail: o
   listener de SIGNED_IN em src/lib/context.tsx já cobre isso, confirme que o
   perfil carrega certo nesse caminho.

Critério de aceite: fluxo de "esqueci a senha" funciona de ponta a ponta em
ambiente local; o documento lista todos os registros DNS necessários.

Não faça: não deixe o SMTP padrão do Supabase valendo para produção, não mande
e-mail de domínio não verificado.
```

---

## P1 — antes de escalar verba.

### P1-8 · Infra da IA: cold start e teto de custo

```
Dois problemas no microsserviço de IA (backend/fastapi/, render.yaml):

1. Está no plano free do Render (render.yaml:7). O free hiberna após ~15 min
   ociosos e leva ~50s para voltar. Como o anúncio vende "plano de aula em 30
   segundos", o primeiro usuário depois de um vale de tráfego espera um minuto
   ou toma erro.
2. Não existe teto de custo. app/routers/chat.py tem 20 req/min por usuário
   (slowapi), mas nada de cota diária: um usuário sozinho pode consumir a cota
   paga de Gemini/OpenAI, e um pico de anúncio multiplica isso.

Faça:

1. Atualize render.yaml para um plano sem hibernação e documente o custo em
   docs/infra.md.
2. Implemente cota diária por usuário no FastAPI, persistida (não em memória do
   processo — o Render reinicia e escala), com limite configurável por env e
   resposta 429 com mensagem clara para a UI tratar sem parecer erro genérico.
3. Registre consumo por usuário (contagem de requisições e de tokens quando o
   provedor devolver) numa tabela, para dar visibilidade de custo.
4. Trate no frontend (src/services/ai.service.ts, src/lib/teca-stream.ts) o
   429 de cota diária de forma distinta do 429 de rate limit por minuto.

Critério de aceite: estourar a cota diária devolve 429 com mensagem específica;
o contador sobrevive a restart do serviço; o painel de custo tem os dados.

Não faça: não guarde a cota só em memória, não remova o rate limit por minuto
que já existe.
```

### P1-9 · Persistir os planos gerados pela IA

```
O histórico de planos da Teca é mock em memória: src/pages/create/AIPlanPage.tsx
importa `mockPlanHistory` de src/lib/data.ts e usa como estado inicial (linha
48). O usuário gera o plano, dá F5 e perde tudo. É justamente a funcionalidade
que o anúncio vende.

Faça:

1. Migration com a tabela `ai_plans` (id, user_id, título, conteúdo, metadados
   como ano/duração/BNCC, created_at), RLS ligada: cada um vê, cria e apaga só
   os próprios planos.
2. Serviço em src/services/ para salvar, listar e apagar; salvar automaticamente
   quando o streaming termina.
3. AIPlanPage passa a ler o histórico real, com empty state honesto para quem
   nunca gerou nada. Remova mockPlanHistory de src/lib/data.ts.
4. Permita renomear e excluir um plano.

Critério de aceite: gerar um plano, recarregar a página e o plano continua lá;
outro usuário não enxerga o plano alheio (teste a policy).

Não faça: não deixe fallback para mock quando a lista estiver vazia.
```

### P1-10 · SEO e compartilhamento

```
Problemas em index.html e public/:

1. index.html:21 aponta og:image para https://aulateca.com.br/og-image.png, mas
   esse arquivo não existe em public/. O preview no WhatsApp — que é onde
   professora compartilha — sai em branco. Crie a imagem (1200x630) a partir da
   identidade em docs/prompts-atividades/identidade-visual/ e coloque em public/.
2. public/robots.txt declara Sitemap: https://aulateca.com.br/sitemap.xml, que
   não existe. Como vercel.json reescreve tudo para index.html, /sitemap.xml
   responde HTML com status 200 — pior que 404 para o crawler. Gere um
   sitemap.xml real (no build, a partir das rotas públicas) e garanta que
   vercel.json não o reescreva.
3. index.html:2 tem lang="en" numa aplicação inteiramente em português. Corrija
   para pt-BR.
4. O <title> e a <meta description> são do app ("Hub Educacional"), genéricos
   para quem chega pela landing de anúncio. Ajuste o título/descrição/OG para o
   texto da oferta, alinhado com o que sobrar depois do prompt P0-3.

Critério de aceite: /sitemap.xml devolve XML; o og:image existe e abre; o
validador de compartilhamento do Facebook e o do WhatsApp mostram o card certo.

Não faça: não deixe a descrição prometendo o que o P0-3 tirou da landing.
```

### P1-11 · RLS restante e moderação

```
Três lacunas nas policies do Supabase (ver supabase/migrations/), nenhuma é
escalação de privilégio, mas todas incomodam com volume de usuário:

1. Não existe policy de UPDATE nem DELETE para o AUTOR em community_posts e
   post_comments — só o admin apaga (migration 003). O usuário não consegue
   apagar o próprio post. É UX básica e também direito do titular na LGPD.
2. `resources` aceita INSERT de qualquer autenticado e o SELECT é público
   (migration 001). Sem moderação, o tráfego do anúncio traz spam direto para
   dentro da vitrine. Restrinja a criação a admin OU adicione um estado de
   aprovação, com o SELECT público mostrando só o aprovado.
3. `public.increment_downloads` é SECURITY DEFINER sem nenhuma checagem
   (migration 001): qualquer um infla o contador de qualquer recurso. Exija
   usuário autenticado e considere registrar o download por usuário em vez de
   só incrementar um inteiro.

Faça uma migration nova, idempotente, no padrão das existentes (comentários em
português explicando o porquê de cada policy). Não altere as migrations antigas.

Critério de aceite: autor apaga o próprio post e não apaga o dos outros; usuário
comum não consegue inserir em resources (ou insere como pendente, invisível);
increment_downloads recusa chamada anônima.

Não faça: não mexa em nada relacionado a role/is_admin — isso foi resolvido na
migration 006.
```

### P1-12 · Plano do Supabase, backup e restauração

```
Este prompt é de infraestrutura e documentação — a maior parte é ação humana no
painel, então entregue um checklist executável, não código.

O projeto está no plano free do Supabase, que não tem backup gerenciado (backup
diário só a partir do Pro; PITR é add-on), pausa por inatividade e limita 500MB
de banco e 50k MAU. Com anúncio rodando e cadastro de gente que pagou, perder o
banco é perder cliente.

Entregue docs/infra-banco.md com:
1. O que muda ao subir para o Pro, com custo, e o que ainda precisa de add-on.
2. Procedimento de backup: o que o plano cobre, o que precisa ser feito à mão,
   e um script em scripts/ que faça dump lógico agendado como rede de segurança
   independente do provedor.
3. Procedimento de restauração testado, passo a passo — backup que nunca foi
   restaurado não é backup.
4. Limites do plano vs. projeção de uso com o anúncio (storage dos PDFs conta,
   e é o que mais cresce).
5. Alerta de uso próximo do limite.

Critério de aceite: o documento permite que outra pessoa restaure o banco sem
me perguntar nada.
```

---

## P2 — depois que a campanha estiver de pé.

### P2-13 · Limpeza de resíduo

```
Faxina, tudo em uma passada:

1. backend/nestjs/ é resto morto — sobrou só um .env de um backend que não
   existe mais. Remova o diretório e qualquer referência a ele
   (docker-compose.yml, docs/COMO_RODAR.md, .gitignore).
2. VITE_API_URL (em .env.local e src/services/api.ts) aponta para
   http://localhost:3000/api, que era esse backend NestJS. Remova a variável e o
   código que a consome, mantendo VITE_AI_URL, que é a que vale.
3. .env.local está versionado no git apesar de constar no .gitignore (o ignore
   não vale para arquivo já rastreado). Só tem chave pública VITE_*, então não é
   vazamento de segredo, mas tire do índice com `git rm --cached` e deixe só o
   .env.frontend.example.
4. MOCKS.txt está desatualizado: descreve arquivos em caminhos antigos
   (src/pages/HomePage.tsx, LudicActivitiesPage.tsx, OtherActivitiesPage.tsx)
   que não existem mais, e menciona um bloco de stats na Home que já foi
   removido. Atualize para o estado real ou apague se os mocks já tiverem saído
   pelo prompt P0-2.
5. README.md ainda é o template do Lovable, com links REPLACE_WITH_PROJECT_ID.
   Reescreva descrevendo o projeto real e como rodar (aponte para
   docs/COMO_RODAR.md).

Critério de aceite: `npm run build` passa, o app sobe, e não sobra referência a
NestJS nem a VITE_API_URL.
```

### P2-14 · Performance da landing e observabilidade

```
Duas frentes, ambas medidas antes de mexer — não otimize no escuro.

Performance: a landing é renderizada por JS numa SPA, o público é professora no
celular em 4G, e public/ tem ~102MB (incluindo um tutorial.mp4 em
public/landing/). LCP ruim encarece o CPC no Google Ads.
1. Meça a landing (/) com Lighthouse mobile e registre os números em
   docs/performance.md ANTES de qualquer mudança.
2. Ataque o que a medição apontar, provavelmente: o vídeo (lazy load, poster,
   não pré-carregar), as imagens (formato moderno, dimensões corretas,
   priorização só da imagem do hero), e as fontes do Google carregadas no
   index.html bloqueando a renderização.
3. Meça de novo e registre o antes/depois.

Observabilidade: não há nenhum monitoramento de erro. Com anúncio rodando, você
descobre que quebrou pelo cliente reclamando.
4. Integre Sentry (ou equivalente) no frontend e no FastAPI, com DSN em variável
   de ambiente e filtro para não enviar dado pessoal.
5. Configure alerta de uptime no serviço de IA além do /health do Render.

Critério de aceite: docs/performance.md com antes/depois; um erro provocado de
propósito aparece no Sentry nas duas pontas.

Não faça: não troque a stack (nada de migrar para Next.js aqui), não mexa no
visual da landing.
```

---

## Dependências entre os prompts

- **P0-3** depende do inventário gerado em **P0-2** (números reais da oferta).
- **P0-6** depende da URL de checkout definida na Hotmart (**P0-1**).
- **P0-2** usa a função `has_active_access()` criada em **P0-1**.
- **P1-11** assume a migration 006 já aplicada.

Ordem sugerida: P0-1 → P0-2 → P0-3 → P0-5 → P0-4 → P0-6 → P0-7 → P1.
