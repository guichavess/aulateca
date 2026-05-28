import json

from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from app.models.schemas import ChatRequest
from app.services.ai_service import stream_ai_response

router = APIRouter(prefix="/chat", tags=["chat"])


@router.post(
    "",
    summary="Conversar com a Teca (streaming SSE)",
    description="Recebe histórico de mensagens e retorna a resposta da IA em streaming.",
)
async def chat(request: ChatRequest):
    async def event_generator():
        # Cada chunk é serializado como JSON para preservar quebras de linha,
        # espaços de borda e qualquer outro caractere que quebraria o frame SSE.
        async for chunk in stream_ai_response(request):
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
