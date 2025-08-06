from app.config import settings

async def run_venice(model: str, prompt: str, config: dict) -> str:
    if not settings.VENICE_API_KEY:
        return f"[venice mock:{model}] " + prompt[:200]
    # TODO: implement real Venice call
    return f"[venice real call placeholder:{model}] " + prompt[:200] 