from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.deps import db_dep, client_dep
from app.models import Agent, Domain, Client
from app.schemas import AgentCreate, AgentOut

router = APIRouter()

@router.get("/", response_model=list[AgentOut])
async def list_agents(db: AsyncSession = Depends(db_dep), client: Client = Depends(client_dep)):
    stmt = (
        select(Agent)
        .join(Domain, Agent.domain_id == Domain.id)
        .where(Domain.client_id == client.id)
    )
    res = await db.execute(stmt)
    return res.scalars().all()

@router.post("/", response_model=AgentOut)
async def create_agent(payload: AgentCreate, db: AsyncSession = Depends(db_dep), client: Client = Depends(client_dep)):
    dom = await db.get(Domain, payload.domain_id)
    if not dom or dom.client_id != client.id:
        raise HTTPException(status_code=404, detail="Domain not found")
    agent = Agent(
        domain_id=payload.domain_id,
        name=payload.name,
        provider=payload.provider,
        model=payload.model,
        role=payload.role,
        config=payload.config,
    )
    db.add(agent)
    await db.commit()
    await db.refresh(agent)
    return agent 