# Aulateca — Pendências para a gestão

Documento vivo: reúne tudo que depende de decisão, aprovação ou orçamento da gestão.
Cada item traz o **motivo** em linguagem de negócio, a **evidência** que o sustenta, o
**custo** e a **ação esperada**. Itens sem custo ficam separados no fim, para não se
misturarem à decisão de orçamento.

_Última atualização: 29/08/2026._

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
