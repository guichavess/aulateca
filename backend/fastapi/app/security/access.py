"""Acesso pago do microsserviço de IA.

O JWT do Supabase prova *quem* é o usuário, não que ele *pagou*. Sem esta
camada, quem pediu reembolso perde o acervo pela RLS (migration 015) mas segue
queimando as chaves de Gemini/OpenAI para sempre — o token continua válido até
expirar e nada mais o impede.

A regra de "tem acesso" já existe em SQL, uma só, usada também pelas policies
das tabelas pagas: `public.has_active_access(uuid default auth.uid())`
(migration 011). Aqui nós apenas a chamamos — não reescrevemos a regra, para
não haver duas versões dela para divergirem.

A chamada vai com o token do próprio usuário, sem argumento `p_user`: o default
`auth.uid()` resolve pelo JWT, então não há como perguntar pelo acesso de
terceiro por esta porta.
"""
import os
import time

import httpx
from fastapi import Depends, HTTPException, Request, status

from app.security.auth import get_current_user

# TTLs assimétricos. O positivo é longo porque um acesso vivo raramente morre no
# meio da conversa; o negativo é curto porque é ele que decide quanto tempo uma
# compra recém-liberada fica esperando para valer.
_TTL_COM_ACESSO = 300.0
_TTL_SEM_ACESSO = 30.0

# Uma instabilidade do Supabase não pode segurar o worker: o /chat é streaming e
# os workers são poucos no plano free do Render.
_TIMEOUT_S = 5.0

# user_id -> (tem_acesso, expira_em). Cache de processo: some no restart e não é
# compartilhado entre instâncias, o que é aceitável — o pior caso é uma consulta
# a mais ao PostgREST.
_cache: dict[str, tuple[bool, float]] = {}


def _limpar_cache() -> None:
    """Usado pelos testes; em produção o cache expira sozinho por TTL."""
    _cache.clear()


async def _consultar_acesso(token: str) -> bool:
    supabase_url = os.getenv("SUPABASE_URL", "").rstrip("/")
    anon_key = os.getenv("SUPABASE_ANON_KEY", "")

    if not supabase_url or not anon_key:
        # Falha fechada, igual ao segredo do JWT ausente: um deploy mal
        # configurado não pode virar IA liberada.
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Não foi possível confirmar seu acesso agora.",
        )

    try:
        async with httpx.AsyncClient(timeout=_TIMEOUT_S) as client:
            resp = await client.post(
                f"{supabase_url}/rest/v1/rpc/has_active_access",
                headers={
                    "apikey": anon_key,
                    "Authorization": f"Bearer {token}",
                    "Content-Type": "application/json",
                },
                json={},
            )
    except httpx.HTTPError:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Não foi possível confirmar seu acesso agora.",
        )

    if resp.status_code != 200:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Não foi possível confirmar seu acesso agora.",
        )

    try:
        liberado = resp.json()
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Não foi possível confirmar seu acesso agora.",
        )

    # A função é `returns boolean`; qualquer outra coisa é resposta que não
    # entendemos, e não entender também é falhar fechado.
    if not isinstance(liberado, bool):
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Não foi possível confirmar seu acesso agora.",
        )

    return liberado


async def require_paid_access(
    request: Request,
    user_id: str = Depends(get_current_user),
) -> str:
    """Deixa passar só quem tem compra viva. Devolve o id do usuário.

    401 (sem token / token inválido) já veio de `get_current_user`.
    403 `sem_acesso` — autenticado, mas sem compra viva.
    503 — não deu para confirmar; nunca liberamos no escuro.
    """
    agora = time.monotonic()
    em_cache = _cache.get(user_id)
    if em_cache is not None and em_cache[1] > agora:
        liberado = em_cache[0]
    else:
        token = getattr(request.state, "access_token", "")
        liberado = await _consultar_acesso(token)
        ttl = _TTL_COM_ACESSO if liberado else _TTL_SEM_ACESSO
        _cache[user_id] = (liberado, agora + ttl)

    if not liberado:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={
                "code": "sem_acesso",
                "message": "Seu acesso ao Aulateca não está ativo.",
            },
        )

    return user_id
