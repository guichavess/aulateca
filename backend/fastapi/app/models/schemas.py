from pydantic import BaseModel
from enum import Enum
from typing import Optional


class MessageRole(str, Enum):
    user = "user"
    assistant = "assistant"


class Message(BaseModel):
    role: MessageRole
    content: str


class ChatRequest(BaseModel):
    messages: list[Message]
    grade: Optional[str] = None
    duration: Optional[str] = None
    bncc_aligned: bool = True


class IntentType(str, Enum):
    plan = "plano"
    activity = "atividade"
    correction = "correcao"
    chat = "chat"
