# Configurar o login com Google

O código do "Entrar com Google" já está implementado (`src/services/auth.service.ts`,
`src/pages/AuthCallbackPage.tsx`). O que falta é registrar o app no Google e ligar
o provider no Supabase — e isso só pode ser feito pelos painéis web.

São 4 etapas. **Este documento cobre a Etapa 1.**

| Etapa | Onde | O que faz |
|---|---|---|
| **1** | Google Cloud Console | Registra o app e gera Client ID + Secret |
| 2 | Supabase → Auth Providers | Liga o provider Google com as credenciais |
| 3 | Supabase → URL Configuration | Autoriza as URLs de retorno |
| 4 | Banco | Aplica a migration `005` (foto do perfil) |

---

## Etapa 1 — Google Cloud Console

> **Nota sobre a interface:** o Google reorganizou essa área e renomeou "APIs &
> Services → OAuth consent screen" para **"Google Auth Platform"**, com as
> subpáginas *Branding*, *Audience* e *Clients*. Dependendo da conta, você pode
> ver um layout ou o outro. Abaixo indico os dois caminhos — o conteúdo a
> preencher é o mesmo.

### 1.1 Criar (ou escolher) o projeto

1. Acesse [console.cloud.google.com](https://console.cloud.google.com) com a conta
   Google que vai administrar o app.
2. No seletor de projetos (topo da página, ao lado do logo "Google Cloud"), clique
   e escolha **New Project**.
3. Nome: `Aulateca`. Deixe *Location* como está (`No organization` é normal em
   conta pessoal).
4. Clique em **Create** e aguarde alguns segundos.
5. **Importante:** confirme que o seletor no topo está mostrando `Aulateca` antes
   de continuar. É o erro mais comum — configurar no projeto errado.

### 1.2 Configurar a tela de consentimento

Essa é a tela que o usuário vê ("O Aulateca quer acessar sua Conta do Google").

**Navegação:** menu ☰ → **APIs & Services → OAuth consent screen**
*(ou, no layout novo: menu ☰ → **Google Auth Platform → Branding**)*

1. Se pedir o **User Type**, escolha **External** e clique em **Create**.
   - *External* = qualquer pessoa com conta Google pode entrar. É o que vocês querem.
   - *Internal* só aparece/funciona com Google Workspace e restringe ao domínio da
     organização.

2. Preencha os campos obrigatórios:

   | Campo | Valor |
   |---|---|
   | App name | `Aulateca` |
   | User support email | seu e-mail (aparece na tela de consentimento) |
   | App logo | opcional — se subir, exige verificação depois; pode deixar vazio agora |
   | Application home page | `https://aulateca.com.br` |
   | Privacy policy link | **deixe vazio** (ver nota abaixo) |
   | Terms of service link | **deixe vazio** (ver nota abaixo) |
   | Authorized domains | `aulateca.com.br` |
   | Developer contact email | seu e-mail |

   > ⚠️ **Privacidade e Termos:** verifiquei o código — **essas páginas ainda não
   > existem no Aulateca** (não há rota `/privacidade` nem `/termos`). Preencher
   > com URLs que dão 404 é pior que deixar vazio, então deixe os dois campos em
   > branco por enquanto. São campos opcionais em modo *Testing*.
   >
   > Antes de publicar o app para o público (passo 1.5), o ideal é criar as duas
   > páginas e voltar aqui para preencher — é boa prática e requisito se um dia
   > vocês precisarem de escopos sensíveis. Me avise que eu implemento as rotas.

3. **Scopes:** avance sem adicionar nada. Os escopos padrão (`openid`, `email`,
   `profile`) já vêm no fluxo e são tudo que o Aulateca precisa — o Supabase pede
   exatamente esses. Adicionar escopos extras dispara revisão do Google sem
   necessidade.

4. **Test users:** enquanto o app estiver em *Testing*, **somente** os e-mails
   listados aqui conseguem logar. Adicione o seu e o de quem for testar
   (limite de 100). Clique em **+ Add users**.

5. Revise e salve.

### 1.3 Criar as credenciais OAuth

**Navegação:** menu ☰ → **APIs & Services → Credentials**
*(ou: **Google Auth Platform → Clients**)*

1. Clique em **+ Create Credentials** → **OAuth client ID**.
2. **Application type:** `Web application`.
3. **Name:** `Aulateca Web` (uso interno, o usuário não vê).
4. **Authorized JavaScript origins** — pode deixar **vazio**. O fluxo aqui é
   redirect via Supabase, não JS direto do browser para o Google.
5. **Authorized redirect URIs** → **+ Add URI** e cole **exatamente** isto:

   ```
   https://jcjtkacusvufazuaemst.supabase.co/auth/v1/callback
   ```

   Esse é o callback do *seu* projeto Supabase (id `jcjtkacusvufazuaemst`, lido do
   `.env.local`). Detalhes que quebram o login se errados:
   - `https`, nunca `http`
   - sem barra `/` no final
   - **não** é `aulateca.com.br` aqui — o Google devolve para o Supabase, e o
     Supabase depois devolve para o seu site (isso é a Etapa 3)

6. Clique em **Create**.

### 1.4 Guardar Client ID e Client Secret

Abre um modal **OAuth client created** com dois valores:

- **Client ID** — algo como `1234567890-abc...apps.googleusercontent.com`
- **Client Secret** — algo como `GOCSPX-...`

**Copie os dois agora.** O Secret não é exibido novamente depois de fechar o
modal (só é possível gerar um novo). Guarde em gerenciador de senhas ou no cofre
de segredos do time.

> 🔒 **Nunca** comitar o Client Secret no repositório nem colocar em variável
> `VITE_*` — tudo com prefixo `VITE_` vai para o bundle e fica público. O Secret
> só é usado no passo seguinte, dentro do painel do Supabase (lado servidor).

### 1.5 Publicar o app (quando for abrir para o público)

Enquanto estiver em **Testing**, só os *test users* do passo 1.2.4 entram — todos
os outros levam erro `403: access_denied`. É o esperado durante o desenvolvimento.

Para liberar para qualquer professor:

1. Volte em **OAuth consent screen** (ou **Google Auth Platform → Audience**).
2. Clique em **Publish app** → confirme.
3. Como o Aulateca usa apenas os escopos básicos (`openid`, `email`, `profile`),
   que o Google classifica como *non-sensitive*, **não há processo de verificação**
   — a publicação vale na hora. Verificação só é exigida com escopos sensíveis
   (Gmail, Drive, Calendar) ou logo customizado.

---

## Checklist da Etapa 1

- [ ] Projeto `Aulateca` criado e **selecionado** no topo do console
- [ ] Consent screen configurada como **External**, com `aulateca.com.br` em
      Authorized domains
- [ ] Seu e-mail adicionado em **Test users**
- [ ] OAuth client tipo **Web application** criado
- [ ] Redirect URI = `https://jcjtkacusvufazuaemst.supabase.co/auth/v1/callback`
- [ ] **Client ID** e **Client Secret** copiados e guardados em local seguro

Com o Client ID e o Secret em mãos, siga para a Etapa 2 (Supabase → Auth Providers).
