from pydantic import BaseModel, Field, model_validator
from enum import Enum
from typing import Optional


# Tetos de payload. O /chat gasta chave paga por token enviado, e sem limite
# 20 requisições por minuto (o teto do rate-limiter) podem ser 20 requisições de
# megabytes cada. O Pydantic recusa sozinho, com 422, antes de qualquer chamada
# ao modelo.
MAX_CHARS_POR_MENSAGEM = 8_000
MAX_MENSAGENS = 30
# Sem este, 30 mensagens de 8.000 ainda passariam 240.000 caracteres adiante.
MAX_CHARS_TOTAL = 24_000
# `grade` e `duration` entram no system prompt (services/prompts.py); são
# rótulos curtos do tipo "5º ano" / "50 minutos", não texto livre.
MAX_CHARS_ROTULO = 40


class MessageRole(str, Enum):
    user = "user"
    assistant = "assistant"


class Message(BaseModel):
    role: MessageRole
    content: str = Field(max_length=MAX_CHARS_POR_MENSAGEM)


class ChatRequest(BaseModel):
    messages: list[Message] = Field(min_length=1, max_length=MAX_MENSAGENS)
    grade: Optional[str] = Field(default=None, max_length=MAX_CHARS_ROTULO)
    duration: Optional[str] = Field(default=None, max_length=MAX_CHARS_ROTULO)
    bncc_aligned: bool = True
    use_aulateca: bool = False

    @model_validator(mode="after")
    def _limitar_conversa(self) -> "ChatRequest":
        total = sum(len(m.content) for m in self.messages)
        if total > MAX_CHARS_TOTAL:
            raise ValueError(
                f"conversa longa demais: {total} caracteres (máximo {MAX_CHARS_TOTAL})"
            )
        return self


class IntentType(str, Enum):
    plan = "plano"
    activity = "atividade"
    correction = "correcao"
    chat = "chat"
