import httpx
from app.config import settings

async def run_openai(model: str, prompt: str, config: dict) -> str:
    if not settings.OPENAI_API_KEY:
        return f"[openai mock:{model}] " + prompt[:200]
    url = "https://api.openai.com/v1/chat/completions"
    headers = {"Authorization": f"Bearer {settings.OPENAI_API_KEY}"}
    payload = {
        "model": model,
        "messages": [{"role": "user", "content": prompt}],
        "temperature": config.get("temperature", 0.2),
    }
    async with httpx.AsyncClient(timeout=60) as client:
        r = await client.post(url, headers=headers, json=payload)
        r.raise_for_status()
        data = r.json()
        return data["choices"][0]["message"]["content"] 