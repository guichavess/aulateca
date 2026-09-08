# Aulateca — Pendências para a gestão

Documento vivo: reúne tudo que depende de decisão, aprovação ou orçamento da gestão.
Cada item traz o **motivo** em linguagem de negócio, a **evidência** que o sustenta, o
**custo** e a **ação esperada**. Itens sem custo ficam separados no fim, para não se
misturarem à decisão de orçamento.

_Última atualização: 01/09/2026._

## Resumo das ações

| # | Item | Custo | Ação da gestão |
|---|---|---|---|
| 1 | Upgrade do Supabase para o plano Pro | US$ 25/mês | Assinar o plano na organização `jcgroup` |

---

## 1. Upgrade do Supabase para o plano Pro

**Assunto:** o banco de dados do Aulateca está em plano gratuito e isso bloqueia o
lançamento comercial
**Custo:** US$ 25/mês por organização (confirmar valor e câmbio na contratação)

### Resumo em um parágrafo

O Aulateca roda hoje sobre a conta gratuita do Supabase, que é o serviço onde ficam
**todos os dados do produto**: contas de professores, materiais publicados, favoritos e
arquivos. O plano gratuito tem três limitações que deixam de ser aceitáveis a partir do
momento em que o produto é vendido: **o sistema sai do ar sozinho após 7 dias sem uso**,
**não existe backup automático** e **a proteção contra senhas vazadas é bloqueada**.
A correção é a assinatura do plano Pro, de US$ 25 por mês.

---

### Os três problemas

#### 1. O sistema desliga sozinho — e já aconteceu aqui

No plano gratuito, o Supabase **pausa o projeto após 7 dias sem atividade**. Pausado, o
site não abre: ninguém entra, nada carrega. Voltar exige alguém entrar no painel e
religar manualmente, o que leva alguns minutos.

Isto não é hipótese. Na nossa própria organização, **2 dos 3 projetos já estão pausados
neste momento** por esse motivo.

Por que importa comercialmente:

- **Demonstração para escola.** Uma semana entre a reunião de apresentação e a proposta é
  o intervalo normal de uma venda. O produto estaria fora do ar exatamente quando o
  cliente resolvesse olhar sozinho.
- **Férias escolares.** Julho e janeiro são períodos longos de baixo uso. O sistema
  desligaria durante as férias e voltaria quebrado na volta às aulas — o pior momento
  possível.
- **Não há aviso ao usuário.** O professor não vê "sistema em manutenção". Ele vê uma
  página que não carrega, e conclui que o produto não funciona.

No plano Pro **não há pausa por inatividade**.

#### 2. Não existe backup automático

O plano gratuito **não faz cópia de segurança diária**. Se houver perda de dados — erro
humano, falha de aplicação, exclusão acidental — **não há de onde restaurar**.

O que se perde: as contas dos professores e os materiais que eles próprios criaram. Esse
conteúdo é o que prende o cliente ao produto; perdê-lo não é um incidente técnico, é a
perda da relação com a escola. E é o tipo de falha que não se explica para um cliente
pagante.

O plano Pro inclui **backup diário automático**, com retenção de 7 dias.

#### 3. A proteção contra senhas vazadas é exclusiva do plano pago

O Supabase oferece a checagem de senhas contra a base do **HaveIBeenPwned** — que reúne
centenas de milhões de senhas expostas em vazamentos reais. Quando ligada, o sistema
recusa no cadastro qualquer senha que já tenha vazado em outro serviço.

No painel, a opção aparece com a marcação: *"Only available on Pro plan and above"*.

Por que importa aqui especificamente: **professores reutilizam senha entre serviços**, e
uma conta invadida no Aulateca dá acesso a dados pessoais de profissionais de educação —
matéria da **LGPD**, com nós na posição de controladores dos dados. Já implementamos no
código as defesas possíveis (mínimo de 10 caracteres, bloqueio de senhas óbvias e de
senhas que contenham o nome ou e-mail do usuário, confirmação de senha atual antes de
trocar e-mail ou senha). A checagem contra vazamentos é a única camada que **não
conseguimos implementar por conta própria** — depende de base de dados que só o
fornecedor tem.

---

### Limites que vamos encostar no crescimento

Além dos três problemas acima, o plano gratuito tem tetos que hoje folgam mas apertam com
a venda. Consumo atual da organização, medido no painel:

| Recurso | Uso hoje | Limite Free | Limite Pro |
|---|---|---|---|
| Tamanho do banco | 27 MB | 500 MB | 8 GB |
| Armazenamento de arquivos | 0 GB | 1 GB | 100 GB |
| Tráfego de saída | 0 MB | 5 GB | 250 GB |
| Usuários ativos por mês | 1 | 50.000 | 100.000 |
| Projetos ativos por organização | 1 (+2 pausados) | 2 | sem limite prático |

O ponto de atenção é **armazenamento de arquivos: 1 GB**. O produto distribui PDFs e
imagens de atividades, e acabamos de habilitar **upload de foto de perfil**. Mil
professores com foto e alguns materiais em PDF consomem isso rápido. É o primeiro teto a
estourar.

---

### O que a gestão precisa fazer

**Uma ação, feita uma vez:**

1. Acessar `supabase.com/dashboard`, entrar na organização **jcgroup**
2. Clicar em **Upgrade to Pro** (o botão está no painel de uso, à direita)
3. Informar cartão corporativo e confirmar

A assinatura é **por organização, não por projeto** — os três projetos da conta passam a
ser cobertos pela mesma mensalidade.

**Custo:** US$ 25/mês (aprox. R$ 135–150/mês, conforme o câmbio; o valor exato deve ser
confirmado no ato da contratação). O plano inclui uma cota de computação; uso além dela é
cobrado à parte, mas no volume atual isso não se aplica.

**Depois do upgrade**, o time técnico executa em minutos, sem novo custo:
- ligar a proteção contra senhas vazadas
- confirmar que a pausa por inatividade foi removida
- confirmar que o backup diário está ativo

---

### Se a resposta for "ainda não"

Alternativa honesta, para registro: dá para adiar o upgrade **enquanto o produto não tiver
cliente pagante**. Nesse cenário, é preciso aceitar explicitamente que:

- o sistema pode estar fora do ar em qualquer demonstração não agendada;
- uma perda de dados é definitiva, sem restauração possível;
- o cadastro aceita senhas já vazadas publicamente.

O que **não** dá para fazer é vender o produto para uma escola mantendo essas três
condições. O upgrade precisa acontecer, no mais tardar, **antes do primeiro contrato
assinado**.

---

## Itens sem custo

Pendências técnicas que **não dependem de orçamento**, listadas aqui apenas para
visibilidade da gestão. A execução é do time técnico.

### Três informações que a gestão precisa fornecer antes do lançamento (01/09/2026)

O app ganhou canal de suporte e monitoramento de erro. O código está pronto; o que
falta são três valores que só a gestão tem, configurados nas variáveis do projeto no
Vercel. **Enquanto não forem preenchidos, o recurso simplesmente não aparece** — sem
erro, sem aviso.

| Variável | O que é | O que acontece sem ela |
|---|---|---|
| `VITE_SUPORTE_EMAIL` | E-mail de atendimento ao professor — **definido: `aulatecabr@gmail.com`** | O bloco "falar com a gente" some. Cliente pago bloqueado volta a não ter com quem falar |
| `VITE_SUPORTE_WHATSAPP` | Número com DDI e DDD, só dígitos | O atalho do WhatsApp some. O e-mail continua, se estiver preenchido |
| `VITE_SENTRY_DSN` | Endereço do projeto no Sentry (plano gratuito) | Nenhum erro é reportado. Toda tela branca volta a ser invisível |

O e-mail já está configurado no ambiente local. **Falta preenchê-lo nas variáveis
do Vercel** — é lá que o professor vai vê-lo. O WhatsApp e o Sentry seguem em aberto;
o app funciona sem eles, apenas sem o atalho e sem o monitoramento.

**Por que isso importa comercialmente:** até aqui, um erro de tela derrubava o app em
silêncio e o professor não tinha nenhum canal para avisar — nem na tela de acesso
bloqueado, que chegava a dizer "fale com a gente" sem oferecer ninguém. Os dois
buracos se alimentavam: falha invisível de um lado, cliente sem saída do outro.

Depois de configurar, **conferir na prática**: abrir a tela `/acesso` e clicar nos dois
canais; e provocar um erro para ver o evento chegar no painel do Sentry. O CSP do site
bloqueia envio para host não autorizado **sem dar erro visível** — se o DSN for de uma
região fora da lista em `vercel.json`, o painel fica vazio parecendo que nada quebrou.

### O acervo de demonstração agora é uma escolha, não um acidente

Antes, quando o banco de dados voltava vazio — inclusive **por estar fora do ar** — o
app preenchia a tela com o acervo fictício embutido no próprio site. O professor via a
grade cheia, clicava, e o download não acontecia: os arquivos de verdade dependem do
banco que estava caído. Um erro honesto virava um produto que parece funcionar.

Agora isso só acontece com `VITE_DEMO_FALLBACK="true"`, e a tela avisa em letras que é
demonstração. **Em produção fica desligado.** Ligar apenas para apresentação comercial
com banco vazio — e lembrar de desligar depois.

### A busca de recursos existe, a paginação ainda não

A tela "Explorar" ganhou busca por texto (era o jeito como o professor procura: pelo
assunto da aula de amanhã, não pela categoria). Ela carrega até 60 materiais de uma vez,
o que cobre o acervo atual de 54 com folga.

**Quando o acervo passar de ~60 fichas, isso vira um problema**: o professor deixa de
ver o que passar do limite, sem nenhum aviso na tela. O que a página vai precisar aí é
de paginação de verdade — não de um número maior. Registrado aqui para não ser
descoberto pelo cliente.

### Dois freios de abuso que ficaram de fora da varredura de 30/08/2026

A varredura de segurança de 30/08/2026 fechou sete pontos (entre eles o mais grave:
**a IA da Teca não sabia o que era acesso pago** — quem pedia reembolso perdia o acervo
mas continuava gastando as chaves pagas de IA para sempre). Dois itens foram
deliberadamente deixados de fora, e ficam registrados aqui para não se perderem.

**1. Login e "esqueci minha senha" não têm freio próprio.** Hoje quem tenta adivinhar
senha na tela de entrada, ou dispara e-mails de recuperação em massa, esbarra só nos
limites nativos do serviço de autenticação do Supabase (o GoTrue) — que existem, mas não
são nossos, não são configuráveis e não deixam registro que a gente consiga consultar. O
banco já tem a tabela para registrar essas tentativas (`access_attempts`) e já prevê o
tipo `recuperar_senha`, mas **ninguém grava nela nesse caso**. A saída é uma função
própria de recuperação de senha, que passa a registrar as tentativas antes de repassar ao
Supabase. É trabalho do time técnico, sem custo; ficou fora por ser mudança de fluxo de
login, e mexer em login junto com sete outras correções é como se descobre tarde que a
porta de entrada quebrou.

**2. O limite de requisições da IA zera quando o servidor hiberna.** O microsserviço da
Teca conta as requisições **na própria memória**. O plano gratuito do Render desliga o
serviço quando ele fica ocioso, e ao voltar a contagem começa do zero — então o teto de 20
requisições por minuto é, na prática, furado. Resolver de verdade exigiria um serviço
externo de contagem (Redis), que é custo novo. **Não é urgente**, e a razão é o que foi
feito nesta mesma leva: a IA agora só responde a quem tem compra viva, e cada pedido tem
teto de tamanho. Um contador furado protegendo uma porta trancada custa muito menos do que
custava ontem.

### Pixel da Meta instalado em 01/09/2026 — uma decisão ficou em aberto

O código base do Pixel `869796945790520` ("PIXEL APOSTILA") entrou no `index.html`,
disparando `PageView`. Como o site é uma página só (SPA), o pixel valeria para o site
inteiro — e foi aí que apareceu um problema que valia a pena resolver antes de subir.

**O pixel manda para a Meta a URL completa de cada página visitada.** Três rotas do
Aulateca carregam dado do comprador na própria URL:

- `/criar-acesso?e=...` — o link que o comprador recebe por e-mail depois de pagar. O
  `e=` é **o e-mail dele em base64**, que é codificação e não criptografia: qualquer
  pessoa decodifica em um segundo. Sem a trava, o e-mail de cada comprador iria para a
  Meta no momento em que ele clicasse no link da compra.
- `/redefinir-senha` e `/recuperar-senha` — trazem o código do link de recuperação.

Nenhuma das três tem valor de marketing (quem chega nelas já comprou), então **o pixel
simplesmente não roda nessas rotas** — nem carrega o script da Meta. O teste
`src/test/metaPixel.test.ts` trava isso, junto com a assinatura de segurança que
autoriza o pixel a rodar: mexer no bloco sem regerar a assinatura derrubaria o pixel só
em produção, onde ninguém olha o console.

Fica **uma decisão para a gestão**, no painel da Meta, não no código:

**Correspondência avançada automática.** O último passo da instalação oferece ligar esse
recurso: ele envia à Meta os dados que o visitante digita nos formulários do site
(e-mail, telefone), embaralhados, para casar a visita com a conta dele. Melhora a
atribuição de conversões e, com isso, a otimização das campanhas — e é tratamento de dado
pessoal de professor, com o dever de constar na política de privacidade (LGPD). **Foi
deixado desligado**; ligar é decisão da gestão. Vale notar a incoerência de ligar isso
depois do parágrafo acima: a trava de rotas existe justamente para o e-mail do comprador
não chegar à Meta.

Os eventos de conversão **foram instrumentados** depois deste registro, e o funil hoje
sai completo do site: `PageView` na visita, `InitiateCheckout` no clique do CTA (com o
valor total que a Cakto cobra) e `Purchase` quando o pagamento é confirmado. O
`Purchase` não sai do navegador, e sim do webhook da Cakto pela API de Conversões da
Meta — quem clica no CTA ainda pode desistir com o cartão na mão, e contar isso como
compra faria a Meta otimizar para quem clica em vez de quem paga. Reembolso, chargeback
e cancelamento não viram evento: não são venda negativa para a Meta, e mandá-los
inventaria receita.

Restam **duas coisas**, e as duas dependem da gestão:

- **`META_PIXEL_ID` e `META_CAPI_TOKEN` precisam ser cadastrados** como segredos do
  Supabase (`supabase secrets set`), não da Vercel. O token sai do Gerenciador de
  Eventos → pixel → Configurações → API de Conversões → Gerar token. Enquanto isso não
  for feito, a venda continua funcionando normalmente, mas o `Purchase` não chega ao
  painel da Meta — e sem ele a campanha não consegue otimizar por compra.
- **`Lead` (criou acesso) não existe**, e é decisão de gestão se vale medir. Ele mede
  quem chegou até o cadastro, o que só é útil se houver alguma campanha otimizando por
  isso.

### Decisão pendente: o bloco de oferta pedido para o CTA da landing

Pedido do gestor, via Caio, em 26/08/2026: reproduzir no CTA final da landing um bloco de
oferta — preço riscado, preço promocional e lista de benefícios — a partir de uma captura
de tela do site `apostilasef.shop`, que é **de outro produto**.

**O bloco foi implementado** com a identidade do AulaTeca (a referência serviu de
layout, não de conteúdo) e com o preço de **R$ 37,90** definido pelo gestor. Os
benefícios listados descrevem o produto real; nenhuma frase da captura foi reaproveitada.

**Resta uma divergência aberta, e ela precisa ser fechada antes de publicar.** O checkout
que a aplicação realmente abre (`VITE_CAKTO_CHECKOUT_URL`) ainda cobra outra coisa:

| O que a landing passa a anunciar | O que o checkout cobra hoje |
|---|---|
| R$ 37,90/mês (+ R$ 0,99 de taxa = R$ 38,89) | **R$ 5,00/mês** (+ R$ 0,99 = R$ 5,99) |

E, para registro, o que da captura **não** foi aproveitado, por descrever outro produto:
"+300 páginas de atividades" (contagem, e de outro acervo), "acesso vitalício" (o oposto
de assinatura), "material atualizado 2025" (estamos em 2026) e "somente hoje" (urgência que
se repetiria todo dia). Um teste automático reprova a volta de qualquer uma delas.

Enquanto essa oferta na Cakto não for trocada, **a landing anuncia R$ 37,90 e o checkout
cobra R$ 5,00/mês**. Anunciar um valor e cobrar outro é problema mesmo quando o cobrado é
mais barato: quebra a confiança exatamente no passo do cartão. Um sinal de que a oferta de
R$ 5,00 está mesmo obsoleta é que o próprio checkout a exibe como **"Oferta finalizada"**,
com o cronômetro zerado.

**Quatro coisas precisam de resposta da gestão:**

1. **Trocar a oferta na Cakto para R$ 37,90**, ou mandar o link da oferta nova para
   substituir `VITE_CAKTO_CHECKOUT_URL`. Sem isso, quem clicar compra a oferta antiga.
2. **É assinatura mensal ou compra única?** Hoje o card escreve "R$ 37,90/mês, com
   renovação automática", porque assinatura é o que o produto vende (o próprio código
   trata `kind: 'subscription'` e cancelamento valendo até o fim do período pago). Se os
   R$ 37,90 forem **cobrança única**, é uma linha para mudar — mas precisa vir do gestor,
   porque muda o que o cliente paga.
3. **Conferir a taxa de serviço da oferta nova.** Os R$ 0,99 exibidos foram medidos na
   oferta de R$ 5,00. A Cakto calcula a taxa por oferta; se mudar, o total anunciado fica
   errado.
4. **Os R$ 97 valem como preço riscado?** O gestor confirmou que foram praticados, e o
   card já sabe desenhar o riscado — está desligado esperando **a data** em que valeram.
   Preço-âncora é o item que se questiona depois, e a defesa é a data.

**Um achado colateral, e é o mais sério.** Este documento registra que "Cancele quando
quiser" saiu do CTA final porque **"não existe assinatura"**. Existe: o checkout cobra
renovação mensal. A remoção foi feita sobre premissa errada, e o resultado é que **a
landing não avisa em lugar nenhum que a cobrança é recorrente**. Cobrança recorrente não
informada antes da compra é problema por si só, sem nenhuma relação com o bloco de
desconto pedido. Precisa ser corrigido mesmo que a oferta nova nunca saia do papel.

### O catálogo esteve aberto ao público até 29/08/2026

Achado da varredura de 29/08/2026. É o item mais grave levantado até aqui e não constava
deste documento, por isso entra agora.

**O que aconteceu.** Qualquer pessoa com o endereço do banco conseguia ler o catálogo
inteiro do Aulateca — as 54 fichas, com título, descrição, categoria e faixa de ano —
**sem conta, sem login e sem ter comprado**. As regras de acesso pago estavam escritas e
testadas no repositório, mas **nunca chegaram ao banco de produção**: ele parou de receber
atualizações cinco versões atrás. O paywall existia no código e não existia no ar.

**Evidência.** Uma consulta à tabela de materiais feita em 29/08/2026 **sem nenhuma
credencial de usuário** devolveu as 66 linhas do catálogo. A tabela que registra tentativas
de acesso indevido — criada pela mesma atualização que liga o bloqueio — não existia.

**Qual foi o dano real.** Os PDFs **não vazaram por essa porta**: eles ainda não tinham
sido enviados ao servidor de arquivos, então não havia o que baixar. O que ficou exposto
foi a **lista do que o produto oferece** — o equivalente ao sumário, não ao material. E
como ainda não há cliente pagante, ninguém pagou por um acesso que estava aberto. O
prejuízo é de vantagem competitiva, não de dado pessoal nem de conteúdo.

**Como foi corrigido.** Aplicando ao banco de produção as cinco atualizações que faltavam.
O estado após a correção está registrado no item "Senha do banco de produção", abaixo.

**O que continua frágil.** Nada avisa quando o repositório e o banco divergem — foi
exatamente essa divergência silenciosa que produziu o problema. A conferência é manual
hoje. Transformá-la em verificação automática a cada publicação é trabalho do time técnico,
sem custo, e vale fazer antes do primeiro cliente.

### ~~Ambiente de produção indefinido~~ — resolvido em 29/08/2026

**Qual projeto é o de produção: `jcjtkacusvufazuaemst`.** Não há ambiguidade: o
`config.toml`, o `.env.local` da aplicação e o CLI do Supabase (que está linkado a esse
projeto) apontam todos para ele. O `egjvtionimijdzhxiwjd` citado antes não é um segundo
ambiente — era um resquício de configuração.

O segundo ponto — **o login com Google desabilitado no painel** — deixou de ser pendência:
não existe login com Google no produto. Verificado em 29/08/2026, não há botão na tela de
entrada nem chamada de OAuth no código. A decisão do gestor é que **a conta nasce da
venda**: quem compra na Cakto recebe o link, cria a senha e entra. Um provedor externo de
login não tem papel nesse fluxo, e a opção pode continuar desligada no painel.

### ~~Senha do banco de produção~~ — resolvido em 29/08/2026

O banco de produção estava **cinco versões atrasado** em relação ao repositório: parou na
atualização `012` e não recebeu as de `013` a `017`. Cada uma que faltava tinha uma
consequência visível no produto:

| O que faltava | O que isso causava |
|---|---|
| `013` — todo material vira PDF | 6 materiais ainda constavam como vídeo, formato que o produto não usa mais |
| `014` — remoção do acervo de demonstração | 12 fichas fictícias, inventadas para teste, continuavam listadas como se fossem material real |
| `015` — regras de acesso pago | **Nenhum bloqueio de acesso.** Ver o item "O catálogo esteve aberto ao público", acima |
| `016` — arquivos no armazenamento privado | Os PDFs continuavam apontando para o endereço público antigo, que não existe mais |
| `017` — painel de vendas | A área de acompanhamento de vendas não funcionava |

As cinco foram aplicadas em 29/08/2026, e o resultado foi conferido consulta a consulta: o
catálogo passou a responder vazio para quem não tem acesso, ficou com as 54 fichas reais
(nenhuma fictícia, nenhuma em vídeo) e os 60 arquivos foram publicados no armazenamento
privado.

### Acesso ao DNS do domínio e conta de e-mail transacional (Resend)

O fluxo "pagou na Cakto → recebe o link → cria a senha → entra" depende de **e-mail
transacional**, e o SMTP padrão do Supabase entrega ~2 a 4 mensagens por hora — o
suficiente para testar, não para vender. A escolha técnica é o **Resend**, cujo plano
gratuito cobre 3.000 e-mails/mês e 100/dia, folgado para o volume previsto. **Não há
custo hoje**; passa a haver se o volume crescer.

O que depende da gestão:

1. **Acesso ao DNS de `aulateca.com.br`** para publicar os registros SPF, DKIM e DMARC.
   Sem domínio verificado, os e-mails caem em spam ou nem saem — e o e-mail que não chega
   é a venda que não vira acesso.
2. **Definir o e-mail de suporte** que vai no `reply-to` (o remetente será
   `nao-responda@aulateca.com.br`). É para onde vai escrever quem pagou e não conseguiu
   entrar.
3. ~~**O link do checkout do produto na Cakto.**~~ — **resolvido em 29/08/2026.** O link
   chegou e está configurado na máquina de desenvolvimento (`VITE_CAKTO_CHECKOUT_URL`).
   Com isso, o lado do pagamento está completo: link de compra, webhook, criação de conta
   e liberação de acesso.

   **Falta um passo de publicação, e ele é invisível:** o link está configurado *localmente*.
   Para que os botões da landing **publicada** levem ao checkout, a mesma variável precisa
   estar cadastrada no painel da Vercel — o serviço que hospeda o site. Se não estiver, o
   site no ar continua mandando quem quer comprar para a tela de login, com todo o resto
   pronto. É conferência de um minuto no painel, sem custo.

### ~~Chave de serviço do Supabase para publicar o acervo~~ — resolvido em 29/08/2026

A credencial chegou e os 60 PDFs pagos (54 fichas lúdicas + 6 avaliações diagnósticas)
foram enviados para o armazenamento privado do projeto de produção. O botão "Baixar
Recurso" passa a entregar arquivo de verdade, por um link temporário de 60 segundos gerado
na hora, e só para quem tem acesso pago.

A chave continua sendo a credencial de maior privilégio do banco — ela ignora todas as
regras de acesso. Ela **não** entrou no repositório, não vai para o navegador e não deve
circular por e-mail ou chat. Fica só na máquina de quem publica o acervo.

### As 6 avaliações diagnósticas não aparecem, mesmo depois do upload

Registro para não virar surpresa: subir os PDFs das 6 avaliações diagnósticas para o
bucket **não as torna visíveis no produto**. Elas não estão em
`scripts/atividades.manifest.json` e, por isso, não têm linha na tabela de atividades —
sem essa linha, nenhum card aparece na Home e não há de onde clicar para baixar. O arquivo
fica no bucket, correto e inacessível.

Para publicá-las é preciso descrevê-las no manifesto (título, categoria, faixa de ano,
duração) como as outras 54. É trabalho do time técnico, mas depende de a gestão dizer
**em que categoria** cada uma entra — hoje não existe uma categoria "avaliação".

### ~~Duas categorias na navegação estão vazias~~ — resolvido em 29/08/2026

"Atividades de Sondagem" e "Datas Comemorativas" apareciam no menu e na barra lateral sem
nenhuma ficha: quem clicava caía numa tela vazia. Por decisão do gestor, **saíram da
navegação** até existir material.

Nada foi perdido: o banco continua aceitando as duas categorias, e voltar ao menu é
acrescentar a linha de volta no mesmo commit em que a primeira ficha for publicada. Um
teste automático agora reprova qualquer categoria anunciada sem conteúdo, então o
problema não volta sozinho.

### Decisão pendente: as promessas da landing

**Já resolvido nesta leva:** "Comece grátis" e "Cancele quando quiser" saíram do hero e do
CTA final (não existe tier gratuito nem assinatura), e o passo "Crie sua conta grátis" do
"como funciona" passou a descrever o fluxo real — comprar, receber o link, criar a senha.
Ficou só "7 dias de garantia", que é o direito de arrependimento do CDC (art. 49).

**Também resolvido em 29/08/2026: os números da landing.** A página prometia "226+
atividades / 37 jogos / 47 exercícios" e "mais de 8.500 professoras". Agora anuncia **54
atividades, 30 jogos lúdicos e 24 exercícios** — a contagem do acervo real — e a menção às
8.500 professoras saiu inteira, por não ter cliente nenhum que a sustente. A copy passou a
se apoiar no material.

Os números não estão mais digitados na página: saem de `src/lib/acervo.stats.ts`, gerado
pelo mesmo script que monta os PDFs. **Se o acervo crescer, o texto da landing acompanha
sozinho** — e um teste automático reprova o build se algum número exibido deixar de bater
com o acervo. A gestão não precisa se lembrar de atualizar a página a cada leva de fichas.

**Um resto dessa correção só apareceu em 29/08/2026, ao conferir o produto rodando:** a
**tela de login** continuava anunciando o total antigo, quatro vezes maior que o acervo
real. Ela não fica na landing, e por isso escapou tanto da correção quanto do teste que
deveria tê-la pego — o teste varria só as seções da página de vendas. A tela foi corrigida
para ler o mesmo acervo, e a verificação passou a varrer **todas** as telas do produto, não
uma lista de arquivos escolhida a dedo. É a primeira tela que o cliente vê depois de
comprar; era o pior lugar possível para uma promessa inflada sobreviver.

---

## Virada PDF-only, sem IA e sem PRO

Decisão do gestor, executada nesta leva: toda atividade do produto é PDF (não existe
mais vídeo); o card "Aulateca PRO" saiu da interface; a IA (rota `/ai-plan`, CTA da Home,
seção da landing) saiu da interface, mas o código continua no repositório sem nenhum
import ativo — religar é só reconectar a rota; o acervo inicial passou a ser as **54
fichas** reais da pasta `atividades ludicas` do gestor, convertidas para PDF e
guardadas hoje no bucket privado `atividades` do Supabase — não mais em
`public/atividades/`, de onde qualquer pessoa com o link baixava sem ter comprado.
Só as capas dos cards continuam públicas (3,7 MB versionados).

Cada ficha virou um PDF A4 de página única — 43 em paisagem e 11 em retrato, conforme o
formato da arte original. A classificação por categoria e por faixa de ano das 54 fichas
está em `scripts/atividades.manifest.json`, um arquivo só, feito para a gestão revisar e
corrigir sem tocar em código: mudar o manifesto e rodar `node scripts/build-atividades.mjs`
regenera assets, seed do banco e catálogo do app juntos.

Três inconsistências que a mudança expôs e que **não foram alteradas** por estarem fora
do pedido — ficam registradas para decisão da gestão:

- ~~**A landing promete garantia e plano grátis que não existem.**~~ Corrigido em
  29/08/2026: "Comece grátis" e "Cancele quando quiser" saíram do hero, do CTA final e do
  menu de navegação (ver "Decisão pendente: as promessas da landing", acima). Ficaram só os
  "7 dias de garantia", que é o direito de arrependimento previsto no CDC (art. 49).
- ~~**Os números da landing não batem com o acervo real desta leva.**~~ Corrigido em
  29/08/2026: a landing passou a ler a contagem do próprio acervo (ver "Decisão pendente:
  as promessas da landing", acima).
- **Seis fichas são, na verdade, duas páginas espremidas numa folha só.** Nas artes
  originais de "Monstro das Emoções — Monte e Conte", "Missão dos Piratas", "Parque dos
  Dinossauros", "Laboratório do Cientista", "Fábrica de Super-Heróis" e "Construa um
  Castelo", o desenho mostra duas páginas lado a lado (a folha de atividade à esquerda e
  a folha de peças para recortar à direita). Elas foram publicadas como estão — um PDF
  A4 paisagem por ficha, igual ao PNG que o gestor entregou. Impressas assim, cada metade
  sai em cerca de meia folha, o que reduz o tamanho das peças de recorte. Cortá-las em
  duas páginas exigiria adivinhar onde está a dobra em cada arte, e o teste automático
  que fiz erra nas duas direções (aponta dobra onde não há e não vê onde há), então
  qualquer corte automático arriscaria decepar desenho. A correção limpa é refazer a arte
  dessas seis em dois arquivos separados — decisão de quem produz o material.

---

## Segunda leva do acervo (07/09/2026): 74 fichas novas

A pasta `atividades ludicas` do gestor tinha 135 arquivos; 54 já estavam no produto.
Dos 81 restantes, **74 entraram** e **7 ficaram de fora por serem a mesma atividade que
o acervo já tem, redesenhada** na identidade "Atividades 4D": Correio das Frases,
Quebra-Cabeça dos Parágrafos, Máquina do Antes e Depois, Cartas das Emoções, Hospital
das Frases, Fábrica de Personagens e Guarda-Roupa das Palavras. O conteúdo pedagógico é
o mesmo dos PNGs de agosto — mudou só a arte.

**Decisão da gestão pendente:** publicar a versão nova dessas 7 no lugar da antiga é
troca de arte, não atividade nova. Vale fazer? Se sim, é substituir o `source` no
manifesto e rodar o build; o uuid, o slug e os favoritos de quem já usa continuam os
mesmos. Se não, os 7 arquivos ficam parados na pasta.

O acervo passou de **54 para 128 fichas** (79 lúdicas, 34 de produção de texto, 15 de
interpretação). As capas versionadas em `public/` foram de 3,7 MB para 10,6 MB.

Três pontos que a leva trouxe e que ficam registrados:

- **As fichas novas já vieram em PDF.** Não houve conversão: cada arquivo é um PDF de
  uma página com a ficha inteira embutida como imagem, e vai inteiro para o bucket. O
  `scripts/build-atividades.mjs` ganhou esse caminho — para fonte PDF ele copia o
  arquivo e extrai a imagem só para gerar a capa do card. Fonte PNG continua igual.
- **O seed novo é a migration 019, não a 012.** A 012 já rodou em produção e migration
  aplicada não roda de novo; acrescentar linhas nela deixaria repositório e banco
  divergentes de novo. A 019 traz só as 74 linhas novas.
- **Repetição dentro do próprio acervo.** Entre as fichas novas há quatro variações de
  "Classifique as Palavras", quatro de "Varal das Frases" e cinco caça-palavras
  temáticos. São folhas diferentes (outro banco de palavras, outro layout) e viraram
  cards separados, com o título diferenciado por subtítulo para a professora saber qual
  é qual na busca. Se a gestão preferir agrupar variações num card só, isso muda o
  modelo de dados — hoje é um PDF por card.

**Falta subir os PDFs para o bucket.** `node scripts/upload-atividades.mjs` precisa da
`SUPABASE_SERVICE_ROLE_KEY` no `.env` da raiz e grava direto em produção, então não foi
executado aqui. Sem ele as 74 fichas aparecem no catálogo e o botão "Baixar Recurso"
não acha o arquivo. Rodar o upload **e** aplicar a migration 019 antes de anunciar as
atividades novas.

### Sobre a lista de benefícios da página de compras

A mesma lista de dez benefícios de 03/09 foi proposta de novo. Continuam fora, pelos
motivos já registrados em `OfertaCard.tsx`: a contagem de atividades (a landing não
anuncia quantidade, por decisão de 29/08, e o número proposto segue maior que o acervo
real mesmo depois de ele dobrar), "1° ao 9° ano" (o acervo vai do 1° ao 5°), "IA
pedagógica" (a tela existe no repositório mas não tem rota) e "novas atividades
adicionadas" (verdadeiro sobre hoje, mas numa assinatura é lido como promessa de
cadência, e cadência nenhuma foi combinada).

Entrou **"Menos tempo criando atividades do zero"** — descreve o resultado sem afirmar
quantidade nem funcionalidade. E a linha de matérias virou **"Gramática, produção de
texto e interpretação"**: a leva nova é majoritariamente gramática, e a ordem antiga
prometia mais redação do que o acervo hoje tem.

**Decisão da gestão pendente:** se a intenção é mesmo anunciar cadência de novas
atividades, defina a periodicidade (mensal? quinzenal?) e a linha volta para o card.
