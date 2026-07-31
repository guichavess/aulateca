import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded

from app.routers import chat, health
from app.security.rate_limit import limiter

load_dotenv()

app = FastAPI(
    title="Aulateca AI Service",
    description="Microsserviço de IA da Teca — geração de planos, atividades e correção de redações",
    version="1.0.0",
)

# Rate-limit: registra o limiter e o handler que devolve 429 quando estourado.
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

_default_origins = "http://localhost:3000,http://localhost:5173,http://localhost:8080"
allowed_origins = [
    o.strip()
    for o in os.getenv("FRONTEND_URL", _default_origins).split(",")
    if o.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(chat.router)
app.include_router(health.router)
