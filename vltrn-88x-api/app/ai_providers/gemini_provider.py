from app.config import settings

async def run_gemini(model: str, prompt: str, config: dict) -> str:
    if not settings.GOOGLE_API_KEY:
        return f"[gemini mock:{model}] " + prompt[:200]
    # TODO: implement real Gemini call (no external calls required for scaffolding)
    return f"[gemini real call placeholder:{model}] " + prompt[:200] 