# Como rodar o Aulateca localmente

## Arquitetura (resumo)

```
Frontend (Vite/React)  ──►  Supabase (auth, banco, RLS)   ← nuvem, tudo aqui
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

## 1. Frontend

```bash
cp .env.frontend.example .env.local
# preencha VITE_SUPABASE_URL, VITE_SUPABASE_PUBLISHABLE_KEY e VITE_AI_URL
npm install
npm run dev            # http://localhost:5173
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

## Serviços

| Serviço        | URL                          |
|----------------|------------------------------|
| Frontend       | http://localhost:5173        |
| FastAPI (IA)   | http://localhost:8000        |
| FastAPI docs   | http://localhost:8000/docs   |
| Supabase       | seu projeto na nuvem         |

## Notas

- O endpoint `POST /chat` exige o **JWT do Supabase** (usuário logado) e tem
  **rate-limit de 20 req/min por usuário** — proteção contra abuso das chaves de IA.
- Segredos de IA ficam **só no backend**. No frontend, apenas variáveis `VITE_*`.
