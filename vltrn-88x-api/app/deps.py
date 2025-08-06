from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.security import require_api_key
from app.models import Client

async def db_dep() -> AsyncSession:
    async for s in get_db():
        yield s

async def client_dep(client: Client = Depends(require_api_key)) -> Client:
    return client 