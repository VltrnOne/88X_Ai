import asyncio, secrets
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import init_db, SessionLocal
from app.models import Client, Domain, Agent

async def seed():
    await init_db()
    async with SessionLocal() as db:  # type: AsyncSession
        # Create demo client
        api_key = "demo_" + secrets.token_urlsafe(24)
        client = Client(name="Demo Co", api_key=api_key, is_active=True)
        db.add(client)
        await db.commit(); await db.refresh(client)

        # Marketing domain
        dom = Domain(client_id=client.id, name="Marketing", type="marketing", config={})
        db.add(dom); await db.commit(); await db.refresh(dom)

        # Content agent (OpenAI by default)
        agent = Agent(domain_id=dom.id, name="ContentAgent", provider="openai", model="gpt-4o-mini", role="content", config={"temperature": 0.2})
        db.add(agent); await db.commit()

        print("Seed complete.")
        print("API Key:", api_key)

if __name__ == "__main__":
    asyncio.run(seed()) 