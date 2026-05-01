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

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(chat.router)


@app.get("/health", tags=["health"])
def health():
    return {"status": "ok", "service": "aulateca-ai"}
