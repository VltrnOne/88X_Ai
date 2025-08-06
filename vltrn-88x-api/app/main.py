from fastapi import FastAPI
from app.routers import health, domains, agents, tasks
from app.database import init_db

app = FastAPI(title="VLTRN/88X Orchestrator API", version="0.1.0")

app.include_router(health.router, prefix="/health", tags=["health"])
app.include_router(domains.router, prefix="/domains", tags=["domains"])
app.include_router(agents.router, prefix="/agents", tags=["agents"])
app.include_router(tasks.router, prefix="/tasks", tags=["tasks"])

@app.on_event("startup")
async def startup():
    await init_db() 