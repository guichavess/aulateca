# Como rodar o Aulateca localmente

## Arquitetura (resumo)

```
Frontend (Vite/React)  ──►  Supabase (auth, banco, RLS)   ← nuvem, tudo aqui
        │                        ▲
        │                        └── Edge Functions (Deno)
        │                              cakto-webhook  ← recebe a venda
        │                              criar-acesso   ← cria a conta de quem comprou
        │
        └──────────────►  FastAPI (porta 8000)  ← só a IA da Teca (Gemini/OpenAI)
```

Não há mais banco Postgres local nem backend NestJS: os dados vivem no Supabase.
O único serviço que você sobe localmente é a IA.

## Pré-requisitos
- Node 20+ e npm
- (Opcional) Docker Desktop — só se for rodar a IA em container
- Um projeto no [Supabase](https://supabase.com) com as migrations de `supabase/migrations` aplicadas
- Chaves de API: Google AI Studio (Gemini) e OpenAI

> **Os PDFs das atividades não estão no repositório.** Desde a migração para o
> bucket privado `atividades`, o acervo pago vive no Supabase Storage — em
> `public/` ficaram só as capas. Num projeto novo, "Baixar Recurso" só funciona
> depois de rodar `scripts/upload-atividades.mjs`. Ver
> [integracao-cakto.md](integracao-cakto.md#6-subir-o-acervo-pago).

## 1. Frontend

```bash
cp .env.frontend.example .env.local
# preencha VITE_SUPABASE_URL, VITE_SUPABASE_PUBLISHABLE_KEY e VITE_AI_URL
npm install
npm run dev            # http://localhost:3000
```

## 2. Backend de IA (FastAPI)

```bash
cp .env.example .env
# preencha GEMINI_API_KEY, OPENAI_API_KEY e SUPABASE_JWT_SECRET
#   SUPABASE_JWT_SECRET → Supabase Dashboard → Settings → API → JWT Secret
```

Com Docker:

```bash
docker compose up --build     # FastAPI em http://localhost:8000
```

Ou direto com Python:

```bash
cd backend/fastapi
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

## 3. Edge Functions (venda e criação de acesso)

Rodam no Supabase, não na sua máquina — mas dá para servir localmente:

```bash
supabase functions serve cakto-webhook --no-verify-jwt
supabase functions serve criar-acesso  --no-verify-jwt
```

Testes (precisam do Deno instalado):

```bash
deno test supabase/functions/cakto-webhook/
deno test supabase/functions/criar-acesso/
```

Segredos, publicação, configuração do painel da Cakto e o que fazer quando
alguém paga e não consegue entrar: **[integracao-cakto.md](integracao-cakto.md)**.

## Serviços

| Serviço        | URL                          |
|----------------|------------------------------|
| Frontend       | http://localhost:3000        |
| FastAPI (IA)   | http://localhost:8000        |
| FastAPI docs   | http://localhost:8000/docs   |
| Supabase       | seu projeto na nuvem         |

## Notas

- O endpoint `POST /chat` exige o **JWT do Supabase** (usuário logado) e tem
  **rate-limit de 20 req/min por usuário** — proteção contra abuso das chaves de IA.
- Segredos de IA ficam **só no backend**. No frontend, apenas variáveis `VITE_*`.
- **Não existe cadastro público.** Conta só é criada por quem comprou, pela Edge
  Function `criar-acesso`. Para ter um usuário de teste sem passar pela Cakto,
  crie-o no Dashboard → Authentication → Users e insira à mão uma linha em
  `cakto_entitlements` — sem ela, o `PaidGuard` manda a sessão para `/acesso`.

## Primeiro admin

Ninguém vira ADMIN sozinho: a migration 006 filtra o papel que vem do cadastro e
bloqueia qualquer troca de papel feita por usuário logado. Num banco novo não
existe admin nenhum, e nenhuma tela resolve isso — o caminho é a service role
key, na sua máquina.

Preencha uma vez no `.env` da raiz (gitignorado; `.env.example` tem o modelo):

```
SUPABASE_URL="https://<ref>.supabase.co"
SUPABASE_SERVICE_ROLE_KEY="<service_role do Dashboard → Settings → API>"
```

Depois é só rodar — sem prefixo de variável, que é sintaxe de bash e no
PowerShell falha com "Faltam credenciais":

```bash
node scripts/criar-admin.mjs voce@dominio.com
```

Cria a conta já confirmada, promove a ADMIN e imprime a senha gerada **uma única
vez** — guarde no cofre de senhas e troque no primeiro acesso, em `/perfil`. Se o
e-mail já tiver conta, o script só promove e não toca na senha. `--listar` mostra
quem já é admin; `--nome "Fulana"` define o nome do perfil.
