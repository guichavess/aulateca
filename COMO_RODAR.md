# Como rodar o Aulateca localmente

## Pré-requisitos
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) instalado e rodando
- Chaves de API: Google AI Studio (Gemini) e OpenAI

## 1. Configurar variáveis de ambiente

```bash
cp .env.example .env
```

Abra o `.env` e preencha:
- `JWT_SECRET` → qualquer string longa e aleatória
- `GEMINI_API_KEY` → obtenha em https://aistudio.google.com/app/apikey
- `OPENAI_API_KEY` → obtenha em https://platform.openai.com/api-keys

## 2. Subir os serviços com Docker

```bash
docker compose up --build
```

Aguarde até ver as mensagens:
- `🚀 NestJS rodando em http://localhost:3000`
- `INFO: Application startup complete` (FastAPI)

## 3. Acessar os serviços

| Serviço | URL |
|---------|-----|
| NestJS API | http://localhost:3000/api |
| Swagger (docs) | http://localhost:3000/docs |
| FastAPI AI | http://localhost:8000 |
| FastAPI docs | http://localhost:8000/docs |
| Frontend | http://localhost:5173 (rodar separado) |

## 4. Configurar e rodar o frontend

```bash
cp .env.frontend.example .env.local
# .env.local já vem preenchido para desenvolvimento local
npm run dev
```

## Comandos úteis

```bash
# Ver logs em tempo real
docker compose logs -f

# Parar tudo
docker compose down

# Parar e apagar banco de dados (CUIDADO: perde os dados)
docker compose down -v

# Rodar migrations manualmente
docker compose exec nestjs npx prisma migrate dev
```

## Estrutura dos serviços

```
NestJS (porta 3000)      ← Frontend consome aqui
├── POST /api/auth/register
├── POST /api/auth/login
├── GET  /api/resources
├── POST /api/resources
├── GET  /api/favorites
├── POST /api/favorites/:id
├── GET  /api/community/posts
├── POST /api/community/posts
└── GET  /api/users/me

FastAPI (porta 8000)     ← NestJS (ou frontend) consome aqui
└── POST /chat           ← streaming SSE com a Teca
```
