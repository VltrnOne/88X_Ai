from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.deps import db_dep, client_dep
from app.models import Task, Agent, Domain, Client
from app.schemas import TaskCreate, TaskOut
from app.services.orchestrator import execute_task

router = APIRouter()

@router.get("/", response_model=list[TaskOut])
async def list_tasks(db: AsyncSession = Depends(db_dep), client: Client = Depends(client_dep)):
    stmt = select(Task).where(Task.client_id == client.id).order_by(Task.id.desc())
    res = await db.execute(stmt)
    return res.scalars().all()

@router.post("/", response_model=TaskOut)
async def create_and_run_task(payload: TaskCreate, db: AsyncSession = Depends(db_dep), client: Client = Depends(client_dep)):
    agent = await db.get(Agent, payload.agent_id)
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")
    dom = await db.get(Domain, agent.domain_id)
    if not dom or dom.client_id != client.id:
        raise HTTPException(status_code=404, detail="Agent does not belong to client")
    task = Task(agent_id=agent.id, client_id=client.id, input=payload.input, meta=payload.meta, status="queued")
    db.add(task)
    await db.commit()
    await db.refresh(task)
    # execute inline for MVP; move to background worker later
    task = await execute_task(db, task)
    return task 