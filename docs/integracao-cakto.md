# Integração Cakto → acesso → login

Como uma venda na Cakto vira uma pessoa logada dentro do Aulateca, o que
configurar para isso funcionar, e o que fazer quando não funciona.

O produto é vendido **exclusivamente** pela Cakto. Não existe cadastro público:
quem não comprou não cria conta.

---

## O caminho completo

```
Cakto (checkout pago)
   │  POST com { secret, event, data }
   ▼
Edge Function  cakto-webhook          ── grava cakto_events (log cru)
   │                                  ── grava cakto_entitlements (o acesso)
   │                                  ── responde 200 à Cakto
   │                                  ── DEPOIS de responder, envia o e-mail
   ▼
E-mail "crie sua senha"  +  redirect do checkout
   │  ambos levam para
   ▼
/criar-acesso  ──►  Edge Function criar-acesso (service_role)
   │                  confere se aquele e-mail comprou
   │                  cria a conta já confirmada
   ▼
login automático  ──►  o app, com PaidGuard liberado
```

Duas coisas são **separadas de propósito** e confundi-las é a origem de quase
todo chamado de suporte:

- **acesso pago** = linha em `cakto_entitlements`, criada pela venda;
- **conta** = usuário em `auth.users`, criada quando a pessoa escolhe a senha.

Quem pagou e nunca criou a senha tem acesso e mesmo assim não entra. Essa fila
tem tela própria: **/admin/vendas**.

---

## As peças

| Peça | Onde | O que faz |
|---|---|---|
| `cakto-webhook` | `supabase/functions/cakto-webhook/` | recebe a Cakto, concede/revoga acesso, dispara o e-mail |
| `criar-acesso` | `supabase/functions/criar-acesso/` | cria a conta só para quem comprou |
| `cakto_events` | migration 011 | log cru de tudo que a Cakto mandou |
| `cakto_entitlements` | migration 011 + 015 | o acesso em si, com o controle do e-mail |
| `access_attempts` | migration 015 | rate limit de `criar-acesso` e recuperação de senha |
| `has_active_access()` | migration 011 | a regra de acesso, usada pelas policies |
| `cakto_access_overview` | migrations 011 e 017 | a visão do admin |
| bucket `atividades` | migration 015 | os PDFs pagos, privados |

Escrita em `cakto_entitlements` **não tem policy nenhuma**: quem grava é a Edge
Function com a `service_role`. Um acesso concedido sem venda é fraude, e o único
jeito de criar um é com a chave secreta do projeto.

---

## Eventos que a Cakto envia

| Evento | O que fazemos |
|---|---|
| `purchase_approved` | concede acesso (`status = active`) |
| `subscription_renewed` | renova: empurra `expires_at` para a próxima cobrança |
| `subscription_canceled` | marca `canceled`, mas **mantém o acesso até `expires_at`** — o período corrente já foi pago |
| `refund` | revoga na hora (`status = revoked`) |
| `chargeback` | revoga na hora |
| qualquer outro | só registra em `cakto_events`, sem tocar no acesso |

Evento desconhecido não é erro: a Cakto adiciona eventos e campos com o tempo, e
derrubar o webhook por causa disso perderia venda válida na mesma leva.

> **A Cakto não faz retry.** Se a função responder erro, aquele evento **se
> perde**. Por isso o webhook responde 200 assim que grava, e o e-mail sai
> depois, em `EdgeRuntime.waitUntil` — falha de e-mail nunca vira evento
> perdido.

---

## Configuração

### 1. Segredos das Edge Functions

```bash
supabase secrets set CAKTO_WEBHOOK_SECRET='<segredo longo e aleatório>'
supabase secrets set CAKTO_PRODUCT_IDS='<id do produto>'
supabase secrets set RESEND_API_KEY='re_...'
supabase secrets set ACCESS_LINK_SECRET='<outro segredo longo e aleatório>'
supabase secrets set APP_URL='https://aulateca.com.br'
supabase secrets set SUPPORT_EMAIL='suporte@aulateca.com.br'
supabase secrets set ACCESS_EMAIL_FROM='Aulateca <nao-responda@aulateca.com.br>'
```

`SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY` já existem no ambiente das funções;
não precisam ser criados.

O que cada um faz:

- **`CAKTO_WEBHOOK_SECRET`** — a Cakto manda o segredo **no corpo** do POST, não
  numa assinatura HMAC de header. É o que separa uma venda real de um POST
  forjado, então trate como senha. Aceita vários separados por vírgula, o que
  permite trocar o segredo sem janela de queda.
- **`CAKTO_PRODUCT_IDS`** — restringe quais produtos liberam acesso. Vazio =
  qualquer produto da conta libera.
- **`ACCESS_LINK_SECRET`** — assina o link do e-mail e também tempera o hash de
  IP do rate limit. Trocar invalida os links já enviados.
- **`APP_URL`** — a base do link do e-mail. Errar aqui manda o comprador para
  um domínio que não existe.

### 2. Publicar as funções

```bash
supabase functions deploy cakto-webhook --no-verify-jwt
supabase functions deploy criar-acesso --no-verify-jwt
```

`--no-verify-jwt` nos dois casos, por motivos diferentes: a Cakto não manda
token nenhum, e quem cria acesso ainda **não tem** conta para ter token. As duas
se defendem sozinhas — o webhook pelo segredo no corpo, a `criar-acesso` pelo
entitlement + rate limit.

### 3. Painel da Cakto

Cadastrar como método de entrega / webhook:

```
https://<project-ref>.supabase.co/functions/v1/cakto-webhook
```

com o **mesmo** `CAKTO_WEBHOOK_SECRET`, e marcar os eventos da tabela acima.

O **redirect pós-compra** deve apontar para:

```
https://aulateca.com.br/criar-acesso
```

Redirect e e-mail levam ao mesmo lugar de propósito: quem cria a senha na hora
não depende de e-mail nenhum, e quem fechou a aba ainda recebe o link.

### 4. E-mail (Resend)

O SMTP padrão do Supabase entrega poucas mensagens por hora — serve para testar,
não para vender. O envio do link de acesso usa a API do **Resend** direto da
Edge Function.

Antes de qualquer envio real, o domínio `aulateca.com.br` precisa estar
**verificado no Resend** (SPF, DKIM e DMARC publicados no DNS). Sem isso o
e-mail cai em spam ou nem sai — e e-mail que não chega é venda que não vira
acesso.

Vale configurar também o **SMTP customizado do Supabase Auth**, que é o
responsável pelo e-mail de **recuperação de senha** (`/recuperar-senha`) — esse
não passa pela nossa função.

### 5. URLs permitidas do Supabase Auth

Dashboard → Authentication → **URL Configuration**:

```
Site URL:       https://aulateca.com.br
Redirect URLs:  https://aulateca.com.br/redefinir-senha
                http://localhost:3000/redefinir-senha
```

Esta etapa é fácil de esquecer porque nada no repositório aponta para ela, e a
falha é silenciosa do lado errado: o e-mail de recuperação **sai normalmente**,
e só quando a pessoa clica é que o GoTrue recusa o destino.

O front pede o retorno com a própria origem — `redirectTo:
${window.location.origin}/redefinir-senha`, em `src/services/auth.service.ts` —
e a Edge Function `recuperar-senha` confere que o caminho é `/redefinir-senha`.
Nenhuma das duas decide nada: quem aceita ou recusa a URL é esta lista. Uma
origem que não esteja aqui devolve o comprador para a Site URL sem o token, e
ele vê a tela de redefinição pedindo um código que nunca chegou.

O `localhost` na lista é o que mantém o fluxo testável na máquina de
desenvolvimento sem uma variável de ambiente por origem.

### 6. Desligar o cadastro público

**Por último, e só depois de a `criar-acesso` estar publicada e testada:**
Dashboard → Authentication → Providers → Email → desmarcar *Enable signup*.

Fora de ordem, isso derruba o único caminho de entrada que existe.

### 7. Subir o acervo pago

Os PDFs não estão no repositório: vivem no bucket privado `atividades`.

```bash
node scripts/build-atividades.mjs      # gera os PDFs em build/ (fora do git)
node scripts/upload-atividades.mjs     # credenciais saem do .env da raiz
```

Enquanto o upload não rodar, o bucket fica vazio e **"Baixar Recurso" falha para
todo mundo, inclusive para quem pagou**. O `file_url` de cada recurso guarda o
caminho dentro do bucket (`ludica/<slug>/<slug>.pdf`), e o app troca isso por uma
URL assinada de 60 segundos — que a policy só concede a quem tem acesso ativo.

---

## Operação

### A tela /admin/vendas

Mostra cada venda em duas colunas que respondem perguntas diferentes:

- **Acesso** — ativa, assinatura ativa, cancelada (com data), reembolsada,
  chargeback, expirada.
- **Conta** — conta criada, link enviado (senha ainda não criada), e-mail não
  enviado, e-mail falhou.

O cartão **"Pagou e não entra"** é a fila de trabalho: dinheiro recebido sem
produto entregue. Se ele estiver em zero, não há nada a fazer nesta tela.

### Reenviar o acesso à mão

Não existe botão de reenvio — o envio automático acontece uma vez, na venda.
Quando alguém pagou e não recebeu:

1. Confirme na `/admin/vendas` que o acesso está ativo (se não estiver, o
   problema é a venda, não o e-mail).
2. Mande à pessoa o link, direto:

   ```
   https://aulateca.com.br/criar-acesso
   ```

   Ela informa **o e-mail que usou no pagamento** e escolhe a senha. A
   `criar-acesso` confere o entitlement na hora; nenhum token é necessário.
3. Depois que a conta aparecer como criada, marque o envio como resolvido para a
   linha sair da fila:

   ```sql
   update public.cakto_entitlements
   set access_email_sent_at = now(), access_email_error = null
   where lower(email) = lower('cliente@exemplo.com');
   ```

### Conferir o que a Cakto mandou

```sql
select received_at, event, customer_email, status, process_error
from public.cakto_events
order by received_at desc
limit 20;
```

Eventos que entraram e não foram processados:

```sql
select id, event, customer_email, received_at, process_error
from public.cakto_events
where processed_at is null
order by received_at;
```

---

## Quando dá errado

| Sintoma | Causa provável | O que fazer |
|---|---|---|
| Comprou e nada acontece | webhook não cadastrado, ou segredo diferente | conferir a URL no painel da Cakto e `CAKTO_WEBHOOK_SECRET`; a venda **não** é reenviada, então o acesso precisa ser conferido em `cakto_events` |
| Evento chega, acesso não é criado | `CAKTO_PRODUCT_IDS` não bate com o produto vendido | conferir o id do produto; o evento fica em `cakto_events` com o motivo |
| `/criar-acesso` responde "não encontramos sua compra" | e-mail digitado diferente do e-mail do pagamento | conferir o e-mail em `/admin/vendas`; a Cakto envia como a pessoa digitou no checkout, e nós normalizamos para minúsculas |
| "Muitas tentativas" | rate limit (5 por e-mail / 10 por IP por hora) | esperar a janela; é intencional, porque a função responde se um e-mail comprou ou não |
| E-mail não sai, `access_email_error` preenchido | `RESEND_API_KEY` ausente ou domínio não verificado | conferir o segredo e o DNS; reenviar à mão pelo procedimento acima |
| "Baixar Recurso" falha para quem tem acesso | bucket vazio | rodar `scripts/upload-atividades.mjs` |
| Reembolsou e a pessoa continua entrando | evento `refund` não chegou | conferir em `cakto_events`; a revogação é imediata quando o evento chega |

---

## Testes

```bash
npx vitest run                                   # frontend + serviços
deno test supabase/functions/cakto-webhook/      # normalização, decisão, e-mail
deno test supabase/functions/criar-acesso/       # senha, rate limit, papéis
```

A política de senha existe **duas vezes** — `src/lib/password.ts` (navegador) e
`supabase/functions/criar-acesso/conta.ts` (Deno) — porque os dois runtimes não
compartilham módulo. Há um teste de paridade comparando as duas implementações
caso a caso; se você mudar uma, ele quebra até a outra acompanhar. Não conserte
o teste: conserte o espelho.

---

## Decisões que parecem erro e não são

- **A `criar-acesso` responde `sem_compra` para e-mail que não comprou.** Isso
  permite descobrir se um e-mail é cliente. A alternativa — responder sempre
  "enviamos um link" — deixaria quem digitou o e-mail errado esperando um e-mail
  que nunca vem, no exato momento em que a pessoa acabou de pagar. Escolhemos a
  clareza e compensamos com rate limit obrigatório.
- **`ADMIN` nunca é atribuível por quem cria a conta.** O papel vem do corpo do
  POST; qualquer valor fora de professor/pai/terapeuta vira `PROFESSOR`.
- **Assinatura cancelada continua valendo até a data.** O cliente pagou o período
  corrente; cortar antes seria calote nosso.
- **O webhook responde à Cakto antes de mandar o e-mail.** Sem retry do outro
  lado, um e-mail lento não pode custar uma venda.
