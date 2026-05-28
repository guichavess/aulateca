import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from app.routers import chat

load_dotenv()

app = FastAPI(
    title="Aulateca AI Service",
    description="Microsserviço de IA da Teca — geração de planos, atividades e correção de redações",
    version="1.0.0",
)

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


@app.get("/health", tags=["health"])
def health():
    return {"status": "ok", "service": "aulateca-ai"}
