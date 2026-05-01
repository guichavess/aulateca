import re
from app.models.schemas import IntentType


INTENT_PATTERNS = {
    IntentType.plan: [
        r"\bplano de aula\b",
        r"\bplanejamento\b",
        r"\bsequência didática\b",
        r"\bsequencia didatica\b",
    ],
    IntentType.activity: [
        r"\batividade\b",
        r"\bexercício\b",
        r"\bexercicio\b",
        r"\btarefa\b",
        r"\bdinâmica\b",
        r"\bdinamica\b",
    ],
    IntentType.correction: [
        r"\bcorrig",
        r"\bcorreção\b",
        r"\bcorrecao\b",
        r"\bavaliar?\b",
        r"\brevisão\b",
        r"\brevisao\b",
        r"\bfeedback\b",
    ],
}


def detect_intent(text: str) -> IntentType:
    text_lower = text.lower()
    for intent, patterns in INTENT_PATTERNS.items():
        for pattern in patterns:
            if re.search(pattern, text_lower):
                return intent
    return IntentType.chat
