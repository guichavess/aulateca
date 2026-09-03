# URLs de produção — o que cadastrar antes do lançamento

O domínio de produção é **`aulateca.com.br`**.

Este documento existe porque as URLs do Aulateca não moram no repositório: elas
são cadastradas em cinco painéis diferentes (Vercel, Supabase secrets, Supabase
Auth, Cakto, Render). Nenhum build reclama quando uma delas está errada — o
site sobe, a landing abre, e o defeito só aparece no comprador que pagou.
Antes desta página, a lista estava espalhada por quatro documentos.

**Nada aqui é conferível por código.** Cada linha é uma conferência humana no
painel correspondente.

---

## A checklist

### Vercel — variáveis do frontend

Painel do projeto → Settings → Environment Variables. Só variáveis `VITE_*`
chegam ao navegador.

| Variável | Valor | Se faltar |
|---|---|---|
| `VITE_SUPABASE_URL` | `https://jcjtkacusvufazuaemst.supabase.co` | o app sobe com tela branca |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | a anon key do projeto | idem |
| `VITE_AI_URL` | `https://aulateca-fastapi.onrender.com` | a Teca (IA) não responde |
| `VITE_CAKTO_CHECKOUT_URL` | o link da oferta na Cakto | **os CTAs da landing caem no login em vez de vender** |
| `VITE_SUPORTE_EMAIL` | o e-mail de suporte | cliente pago travado sem ninguém para chamar |
| `VITE_SUPORTE_WHATSAPP` | só dígitos, com DDI e DDD | o canal some da tela sozinho |
| `VITE_SENTRY_DSN` | o DSN do projeto | toda tela branca em produção fica invisível |

⚠️ O `VITE_CAKTO_CHECKOUT_URL` está configurado **só na máquina de
desenvolvimento**. É a pendência registrada em `pendencias-gestao.md`, e é
invisível: o site publicado continua abrindo normalmente, só não vende.

⚠️ Trocar o host do Sentry ou do Supabase exige mexer também no `connect-src`
do `vercel.json` — o CSP bloqueia em silêncio o que não estiver lá.

### Supabase — secrets das Edge Functions

```bash
supabase secrets set APP_URL='https://aulateca.com.br'
```

`APP_URL` é a base do link do e-mail pós-compra. O código tem
`https://aulateca.com.br` como default (`cakto-webhook/index.ts`), então o
esquecimento **não quebra nada hoje** — mas passa a quebrar tudo no dia em que
o domínio mudar, e aí o comprador recebe um link para um domínio que não existe.
Cadastrar explicitamente é o que torna a troca de domínio uma mudança de
configuração em vez de uma mudança de código.

### Supabase — Authentication → URL Configuration

```
Site URL:       https://aulateca.com.br
Redirect URLs:  https://aulateca.com.br/redefinir-senha
                http://localhost:3000/redefinir-senha
```

A etapa mais fácil de esquecer, porque nada no repositório aponta para ela e a
falha acontece do lado errado: o e-mail de recuperação **sai normalmente**, e o
GoTrue só recusa quando a pessoa clica. Detalhes em `integracao-cakto.md`,
seção 5.

### Cakto — painel do produto

| O quê | Valor |
|---|---|
| Webhook / método de entrega | `https://jcjtkacusvufazuaemst.supabase.co/functions/v1/cakto-webhook` |
| Redirect pós-compra | `https://aulateca.com.br/criar-acesso` |

⚠️ O redirect é **por oferta**, não por produto. Com mais de uma oferta ativa
(hoje há a de teste e a de R$ 37,90 — ver `src/lib/oferta.ts`), configurar uma e
esquecer a outra faz o retorno funcionar em alguns compradores e não em outros.
Foi exatamente esse o sintoma relatado no teste humano de 03/09/2026.

E vale a expectativa correta: **o redirect da Cakto nunca é garantido.** PIX e
boleto não redirecionam (o pagamento ainda está pendente quando a pessoa sai do
checkout), e quem fecha a aba antes do temporizador também não volta. O caminho
que sempre funciona é o e-mail com o link de `/criar-acesso` — por isso os dois
existem.

### Render — backend de IA (FastAPI)

`FRONTEND_URL` já está fixado no `render.yaml`:

```
https://aulateca.com.br,https://www.aulateca.com.br
```

É a lista de CORS. Publicar o site em qualquer outra origem — uma URL de
preview da Vercel, por exemplo — derruba a Teca ali, e só ali: o resto do app
continua funcionando, o que faz o defeito parecer um problema da IA.

### DNS de `aulateca.com.br` — Resend

SPF, DKIM e DMARC publicados, e o domínio verificado no Resend. Sem isso o
e-mail de acesso cai em spam ou nem sai. É pendência de gestão em aberto
(`pendencias-gestao.md`), e bloqueia o único caminho confiável de retorno do
comprador.

---

## Conferência depois de publicar

1. Clicar num CTA da landing publicada e chegar ao checkout com o preço certo.
2. Fazer uma compra de teste e conferir se o redirect leva a `/criar-acesso`.
3. Conferir se o e-mail chegou:
   ```sql
   select email, access_email_sent_at, access_email_error
   from public.cakto_entitlements
   order by created_at desc limit 5;
   ```
4. Pedir recuperação de senha e **clicar no link do e-mail** — é o único jeito
   de testar a URL Configuration; o envio bem-sucedido não prova nada.
5. Abrir a Teca (IA) logado, para exercitar o CORS do Render.
