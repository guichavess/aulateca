"""Autenticação do microsserviço de IA.

O endpoint /chat consome as chaves pagas de Gemini/OpenAI, então exige um
usuário autenticado. Reaproveitamos o JWT que o Supabase já emite no login do
frontend — ele é assinado (HS256) com o "JWT Secret" do projeto Supabase
(Dashboard → Settings → API → JWT Secret), exposto aqui via SUPABASE_JWT_SECRET.
"""
import os

import jwt
from fastapi import Depends, HTTPException, Request, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

_JWT_SECRET = os.getenv("SUPABASE_JWT_SECRET", "")

# auto_error=False: tratamos a ausência de credencial nós mesmos, com mensagem própria.
_bearer = HTTPBearer(auto_error=False)


def get_current_user(
    request: Request,
    credentials: HTTPAuthorizationCredentials | None = Depends(_bearer),
) -> str:
    """Valida o Bearer token do Supabase e devolve o id do usuário (claim `sub`).

    Falha *fechada*: se o segredo não estiver configurado, recusa em vez de
    liberar o acesso — evita que um deploy mal configurado exponha a IA.
    """
    if not _JWT_SECRET:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Serviço de IA temporariamente indisponível (configuração ausente).",
        )

    if credentials is None or not credentials.credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Autenticação necessária.",
        )

    try:
        payload = jwt.decode(
            credentials.credentials,
            _JWT_SECRET,
            algorithms=["HS256"],
            audience="authenticated",
        )
    except jwt.PyJWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Sessão inválida ou expirada.",
        )

    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token sem identificação de usuário.",
        )

    # Disponibiliza o id para o rate-limiter (chave por usuário).
    request.state.user_id = user_id
    return user_id
