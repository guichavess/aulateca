import os
from typing import AsyncGenerator
from openai import AsyncOpenAI
from app.models.schemas import ChatRequest, IntentType
from app.services.intent_detector import detect_intent
from app.services.prompts import get_system_prompt

# Gemini via OpenAI-compatible endpoint
gemini_client = AsyncOpenAI(
    api_key=os.getenv("GEMINI_API_KEY", ""),
    base_url="https://generativelanguage.googleapis.com/v1beta/openai/",
)

openai_client = AsyncOpenAI(
    api_key=os.getenv("OPENAI_API_KEY", ""),
)

INTENT_MODEL_MAP = {
    IntentType.plan: ("gemini", "gemini-2.0-flash"),
    IntentType.activity: ("gemini", "gemini-2.0-flash"),
    IntentType.correction: ("openai", "gpt-4o-mini"),
    IntentType.chat: ("gemini", "gemini-2.0-flash"),
}


async def stream_ai_response(request: ChatRequest) -> AsyncGenerator[str, None]:
    last_user_message = next(
        (m.content for m in reversed(request.messages) if m.role == "user"), ""
    )
    intent = detect_intent(last_user_message)

    provider, model = INTENT_MODEL_MAP[intent]
    system_prompt = get_system_prompt(
        intent.value,
        request.grade,
        request.duration,
        request.bncc_aligned,
        request.use_aulateca,
    )

    messages = [{"role": "system", "content": system_prompt}]
    messages += [{"role": m.role.value, "content": m.content} for m in request.messages]

    client = gemini_client if provider == "gemini" else openai_client

    stream = await client.chat.completions.create(
        model=model,
        messages=messages,
        stream=True,
        temperature=0.7,
        max_tokens=2048,
    )

    async for chunk in stream:
        delta = chunk.choices[0].delta.content
        if delta:
            yield delta
