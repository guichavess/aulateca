import json

from fastapi import APIRouter, Depends, Request
from fastapi.responses import StreamingResponse
from app.models.schemas import ChatRequest
from app.security.access import require_paid_access
from app.security.rate_limit import limiter
from app.services.ai_service import stream_ai_response

router = APIRouter(prefix="/chat", tags=["chat"])


@router.post(
    "",
    summary="Conversar com a Teca (streaming SSE)",
    description="Recebe histórico de mensagens e retorna a resposta da IA em streaming.",
)
@limiter.limit("20/minute")
async def chat(
    request: Request,
    body: ChatRequest,
    user_id: str = Depends(require_paid_access),
):
    async def event_generator():
        # Cada chunk é serializado como JSON para preservar quebras de linha,
        # espaços de borda e qualquer outro caractere que quebraria o frame SSE.
        async for chunk in stream_ai_response(body):
            yield f"data: {json.dumps(chunk, ensure_ascii=False)}\n\n"
        yield "data: [DONE]\n\n"

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream; charset=utf-8",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
        },
    )
