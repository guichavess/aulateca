# Aulateca — Pendências para a gestão

Documento vivo: reúne tudo que depende de decisão, aprovação ou orçamento da gestão.
Cada item traz o **motivo** em linguagem de negócio, a **evidência** que o sustenta, o
**custo** e a **ação esperada**. Itens sem custo ficam separados no fim, para não se
misturarem à decisão de orçamento.

_Última atualização: 27/08/2026._

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

### Ambiente de produção indefinido

1. **Qual projeto é o de produção.** O arquivo de configuração do repositório aponta para
   um projeto (`egjvtionimijdzhxiwjd`) diferente do que a aplicação usa
   (`jcjtkacusvufazuaemst`), e o primeiro não é acessível pela nossa conta.
2. **O login com Google aparece como desabilitado** no projeto que a aplicação usa,
   embora o recurso esteja implementado. Se ele funciona hoje em produção, existe um
   terceiro ambiente que não mapeamos.

Ambas precisam ser resolvidas antes do lançamento, mas nenhuma tem custo.

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
3. **O link do checkout do produto na Cakto.** É o destino dos botões de compra da landing
   (`VITE_CAKTO_CHECKOUT_URL`). Enquanto ele não existir, os CTAs caem na tela de login em
   vez de vender — a página fica no ar sem caminho de compra.

### Chave de serviço do Supabase para publicar o acervo

Os 60 PDFs pagos (54 fichas lúdicas + 6 avaliações diagnósticas) saíram do
repositório e passaram a viver no bucket privado `atividades`. Enquanto eles não
forem enviados para o projeto de produção, **o botão "Baixar Recurso" não acha
arquivo nenhum — inclusive para quem pagou**.

O envio é um comando só (`node scripts/upload-atividades.mjs`), mas exige a
**service role key** do projeto (Dashboard → Settings → API). É a credencial de
maior privilégio do banco: ela ignora todas as regras de acesso, então não entra
no repositório, não vai para o navegador e não circula por e-mail ou chat.

O que depende da gestão: decidir **quem executa** — passar a chave por um cofre
de senhas para o time técnico rodar, ou rodar o comando na máquina de quem já
tem acesso ao painel. Sem custo; é uma decisão de quem segura a credencial.

### Decisão pendente: as promessas da landing

**Já resolvido nesta leva:** "Comece grátis" e "Cancele quando quiser" saíram do hero e do
CTA final (não existe tier gratuito nem assinatura), e o passo "Crie sua conta grátis" do
"como funciona" passou a descrever o fluxo real — comprar, receber o link, criar a senha.
Ficou só "7 dias de garantia", que é o direito de arrependimento do CDC (art. 49).

**Continua pendente de decisão da gestão:** os números da landing. A página promete
"226+ atividades / 37 jogos / 47 exercícios" e "8.500 professoras"; o acervo real são as
54 fichas desta leva. Com a venda no ar, isso deixa de ser inconsistência de texto e passa
a ser propaganda em página de venda. Ou os números mudam, ou o acervo cresce até eles —
mas a página não pode continuar prometendo o que o produto não entrega.

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

- **A landing promete garantia e plano grátis que não existem.** "✓ 7 dias de garantia ·
  ✓ Cancele quando quiser · ✓ Comece grátis" aparece no hero e no CTA final, mas o produto
  não tem assinatura, checkout nem tier gratuito implementado.
- **Os números da landing não batem com o acervo real desta leva.** A página promete
  "226+ atividades / 37 jogos / 47 exercícios" e "8.500 professoras"; o acervo real
  entregue agora são as 54 fichas da pasta lúdica.
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
