from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models import Agent, Task
from app.ai_providers.openai_provider import run_openai
from app.ai_providers.gemini_provider import run_gemini
from app.ai_providers.venice_provider import run_venice

async def execute_task(db: AsyncSession, task: Task) -> Task:
    stmt = select(Agent).where(Agent.id == task.agent_id)
    res = await db.execute(stmt)
    agent = res.scalar_one_or_none()
    if not agent:
        task.status, task.error = "error", "Agent not found"
        await db.commit()
        return task

    task.status = "running"
    await db.commit()

    try:
        if agent.provider == "openai":
            out = await run_openai(agent.model, task.input, agent.config)
        elif agent.provider == "gemini":
            out = await run_gemini(agent.model, task.input, agent.config)
        elif agent.provider == "venice":
            out = await run_venice(agent.model, task.input, agent.config)
        else:
            raise ValueError("Unknown provider")

        task.output, task.status = out, "done"
    except Exception as e:
        task.status, task.error = "error", str(e)
    finally:
        await db.commit()
    return task 