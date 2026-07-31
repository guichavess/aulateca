"""Rate-limit do microsserviço de IA.

Limita por usuário autenticado (claim `sub` do JWT, colocado em
`request.state.user_id` pela dependência de auth). Caso o id ainda não esteja
disponível, cai para o IP de origem — assim uma requisição barrada na própria
autenticação também não escapa do limite.
"""
from slowapi import Limiter
from slowapi.util import get_remote_address
from starlette.requests import Request


def _user_key(request: Request) -> str:
    user_id = getattr(request.state, "user_id", None)
    return user_id or get_remote_address(request)


limiter = Limiter(key_func=_user_key)
