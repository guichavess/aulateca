"""Tetos de payload do /chat.

Regra pura: nenhum I/O, nenhuma chave de IA. O que se verifica aqui é que o
Pydantic recusa sozinho (422 na borda HTTP) antes de a requisição virar token
pago no Gemini/OpenAI.
"""
import pytest
from pydantic import ValidationError

from app.models.schemas import (
    MAX_CHARS_POR_MENSAGEM,
    MAX_CHARS_ROTULO,
    MAX_CHARS_TOTAL,
    MAX_MENSAGENS,
    ChatRequest,
)


def _msgs(n: int, tamanho: int = 1) -> list[dict]:
    return [{"role": "user", "content": "a" * tamanho} for _ in range(n)]


def test_aceita_conversa_normal():
    req = ChatRequest(messages=_msgs(3, 100), grade="5º ano", duration="50 minutos")
    assert len(req.messages) == 3


def test_recusa_lista_vazia():
    with pytest.raises(ValidationError):
        ChatRequest(messages=[])


def test_recusa_mensagens_demais():
    ChatRequest(messages=_msgs(MAX_MENSAGENS))  # o teto exato passa
    with pytest.raises(ValidationError):
        ChatRequest(messages=_msgs(MAX_MENSAGENS + 1))


def test_recusa_mensagem_longa_demais():
    ChatRequest(messages=_msgs(1, MAX_CHARS_POR_MENSAGEM))
    with pytest.raises(ValidationError):
        ChatRequest(messages=_msgs(1, MAX_CHARS_POR_MENSAGEM + 1))


def test_recusa_soma_acima_do_teto():
    """O caso que os limites individuais deixam passar.

    30 mensagens de 8.000 caracteres respeitam os dois tetos e ainda assim são
    240.000 caracteres — é para isto que existe o validador de modelo.
    """
    cabe = MAX_CHARS_TOTAL // 4
    ChatRequest(messages=_msgs(4, cabe))
    with pytest.raises(ValidationError):
        ChatRequest(messages=_msgs(4, cabe + 1))
    with pytest.raises(ValidationError):
        ChatRequest(messages=_msgs(MAX_MENSAGENS, MAX_CHARS_POR_MENSAGEM))


def test_recusa_rotulos_longos():
    """`grade` e `duration` vão para o system prompt — são rótulos, não texto."""
    for campo in ("grade", "duration"):
        ChatRequest(messages=_msgs(1), **{campo: "x" * MAX_CHARS_ROTULO})
        with pytest.raises(ValidationError):
            ChatRequest(messages=_msgs(1), **{campo: "x" * (MAX_CHARS_ROTULO + 1)})
