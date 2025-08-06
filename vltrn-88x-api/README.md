# VLTRN/88X Orchestrator API (Scaffold)

## 1) Install
```bash
python -m venv .venv
. .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
```

Edit .env with your Postgres and SECRET_KEY_BASE64

Generate a 32-byte base64 key:
```bash
openssl rand -base64 32
```

## 2) Database
Create the Postgres DB and user that match .env, then run:
```bash
python -m app.seed_demo
```

This creates a demo tenant, domain, and agent, and prints an API key.

## 3) Run
```bash
uvicorn app.main:app --reload --port 8000
```

## 4) Quick test
Replace {API_KEY} with the seed value.

List domains:
```bash
curl -s http://localhost:8000/domains/ -H "X-API-Key: {API_KEY}"
```

Create a task (will run via OpenAI provider stub or real key if set):
```bash
curl -s -X POST http://localhost:8000/tasks/ \
-H "Content-Type: application/json" \
-H "X-API-Key: {API_KEY}" \
-d '{"agent_id": 1, "input": "Write 3 short posts about our weekend sale.", "meta": {"channel":"social"}}'
```

List tasks:
```bash
curl -s http://localhost:8000/tasks/ -H "X-API-Key: {API_KEY}"
```

## Notes
- For real model calls, set OPENAI_API_KEY / GOOGLE_API_KEY / VENICE_API_KEY in .env.
- This MVP executes tasks inline. For production, move execution to a background worker (RQ/Celery) and add Alembic migrations.
- Multi-tenant isolation is enforced by API key. For stricter isolation, create per-tenant DB schemas. 