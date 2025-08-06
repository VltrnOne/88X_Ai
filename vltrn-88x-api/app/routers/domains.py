from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.deps import db_dep, client_dep
from app.models import Domain
from app.schemas import DomainCreate, DomainOut
from app.models import Client

router = APIRouter()

@router.get("/", response_model=list[DomainOut])
async def list_domains(db: AsyncSession = Depends(db_dep), client: Client = Depends(client_dep)):
    stmt = select(Domain).where(Domain.client_id == client.id)
    res = await db.execute(stmt)
    return res.scalars().all()

@router.post("/", response_model=DomainOut)
async def create_domain(payload: DomainCreate, db: AsyncSession = Depends(db_dep), client: Client = Depends(client_dep)):
    dom = Domain(client_id=client.id, name=payload.name, type=payload.type, config=payload.config)
    db.add(dom)
    await db.commit()
    await db.refresh(dom)
    return dom 