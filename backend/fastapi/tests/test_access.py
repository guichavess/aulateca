"""Checagem de acesso pago do /chat.

O ponto do teste é o comportamento na falha: se o Supabase não responde, o
endpoint NÃO pode liberar. Um bug aqui não aparece em uso normal — aparece
como conta de IA de quem já pediu reembolso.
"""
import asyncio
from types import SimpleNamespace

import httpx
import pytest
from fastapi import HTTPException

from app.security import access


class _RespostaFalsa:
    def __init__(self, status_code=200, payload=True, json_quebrado=False):
        self.status_code = status_code
        self._payload = payload
        self._quebrado = json_quebrado

    def json(self):
        if self._quebrado:
            raise ValueError("resposta não é JSON")
        return self._payload


def _cliente_falso(resposta=None, erro=None, chamadas=None):
    """Substitui `httpx.AsyncClient` dentro do módulo access."""

    class _Cliente:
        def __init__(self, *args, **kwargs):
            pass

        async def __aenter__(self):
            return self

        async def __aexit__(self, *args):
            return False

        async def post(self, url, **kwargs):
            if chamadas is not None:
                chamadas.append((url, kwargs))
            if erro is not None:
                raise erro
            return resposta

    return _Cliente


@pytest.fixture(autouse=True)
def _ambiente(monkeypatch):
    monkeypatch.setenv("SUPABASE_URL", "https://projeto.supabase.co")
    monkeypatch.setenv("SUPABASE_ANON_KEY", "anon-de-teste")
    access._limpar_cache()
    yield
    access._limpar_cache()


def _request(token="token-do-usuario"):
    return SimpleNamespace(state=SimpleNamespace(access_token=token))


def _chamar(user_id="user-1", token="token-do-usuario"):
    return asyncio.run(access.require_paid_access(_request(token), user_id=user_id))


def test_libera_quem_tem_acesso(monkeypatch):
    monkeypatch.setattr(access.httpx, "AsyncClient", _cliente_falso(_RespostaFalsa(payload=True)))
    assert _chamar() == "user-1"


def test_recusa_com_403_e_code_estavel(monkeypatch):
    monkeypatch.setattr(access.httpx, "AsyncClient", _cliente_falso(_RespostaFalsa(payload=False)))
    with pytest.raises(HTTPException) as e:
        _chamar()
    assert e.value.status_code == 403
    assert e.value.detail["code"] == "sem_acesso"


def test_manda_o_token_do_usuario_e_nao_pergunta_por_terceiro(monkeypatch):
    chamadas: list = []
    monkeypatch.setattr(
        access.httpx,
        "AsyncClient",
        _cliente_falso(_RespostaFalsa(payload=True), chamadas=chamadas),
    )
    _chamar(token="jwt-do-fulano")

    url, kwargs = chamadas[0]
    assert url == "https://projeto.supabase.co/rest/v1/rpc/has_active_access"
    assert kwargs["headers"]["Authorization"] == "Bearer jwt-do-fulano"
    assert kwargs["headers"]["apikey"] == "anon-de-teste"
    # Sem `p_user`: o default auth.uid() resolve pelo próprio JWT, então não há
    # como consultar o acesso de outra pessoa por esta porta.
    assert kwargs["json"] == {}


@pytest.mark.parametrize(
    "cliente",
    [
        _cliente_falso(erro=httpx.ConnectTimeout("estourou")),
        _cliente_falso(erro=httpx.ConnectError("recusou")),
        _cliente_falso(_RespostaFalsa(status_code=500, payload=None)),
        _cliente_falso(_RespostaFalsa(json_quebrado=True)),
        _cliente_falso(_RespostaFalsa(payload="sim")),  # resposta que não é boolean
    ],
)
def test_falha_fechada_com_503(monkeypatch, cliente):
    monkeypatch.setattr(access.httpx, "AsyncClient", cliente)
    with pytest.raises(HTTPException) as e:
        _chamar()
    assert e.value.status_code == 503


def test_falha_fechada_sem_configuracao(monkeypatch):
    monkeypatch.delenv("SUPABASE_URL", raising=False)
    monkeypatch.setattr(access.httpx, "AsyncClient", _cliente_falso(_RespostaFalsa(payload=True)))
    with pytest.raises(HTTPException) as e:
        _chamar()
    assert e.value.status_code == 503


def test_cache_evita_consulta_repetida(monkeypatch):
    chamadas: list = []
    monkeypatch.setattr(
        access.httpx,
        "AsyncClient",
        _cliente_falso(_RespostaFalsa(payload=True), chamadas=chamadas),
    )
    _chamar()
    _chamar()
    _chamar()
    assert len(chamadas) == 1


def test_cache_e_por_usuario(monkeypatch):
    chamadas: list = []
    monkeypatch.setattr(
        access.httpx,
        "AsyncClient",
        _cliente_falso(_RespostaFalsa(payload=True), chamadas=chamadas),
    )
    _chamar(user_id="user-1")
    _chamar(user_id="user-2")
    assert len(chamadas) == 2


def test_negativo_expira_antes_do_positivo():
    """A compra recém-liberada não pode esperar 5 minutos para valer."""
    assert access._TTL_SEM_ACESSO < access._TTL_COM_ACESSO


def test_cache_negativo_expira_e_reconsulta(monkeypatch):
    """Depois do TTL curto, um `false` cacheado é reconsultado — e vira acesso."""
    respostas = [_RespostaFalsa(payload=False), _RespostaFalsa(payload=True)]

    class _Cliente:
        def __init__(self, *a, **k):
            pass

        async def __aenter__(self):
            return self

        async def __aexit__(self, *a):
            return False

        async def post(self, url, **kwargs):
            return respostas.pop(0)

    monkeypatch.setattr(access.httpx, "AsyncClient", _Cliente)

    with pytest.raises(HTTPException):
        _chamar()

    # Empurra o relógio do cache para além do TTL negativo.
    relogio = [access.time.monotonic() + access._TTL_SEM_ACESSO + 1]
    monkeypatch.setattr(access.time, "monotonic", lambda: relogio[0])

    assert _chamar() == "user-1"
