from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import String, ForeignKey, Integer, Boolean, JSON, Text
from app.database import Base

class Client(Base):
    __tablename__ = "clients"
    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(120), unique=True)
    api_key: Mapped[str] = mapped_column(String(128), unique=True)  # random token per tenant
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    domains: Mapped[list["Domain"]] = relationship(back_populates="client")

class Domain(Base):
    __tablename__ = "domains"
    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    client_id: Mapped[int] = mapped_column(ForeignKey("clients.id", ondelete="CASCADE"), index=True)
    name: Mapped[str] = mapped_column(String(120))
    type: Mapped[str] = mapped_column(String(50))  # marketing, finance, ops, etc.
    config: Mapped[dict] = mapped_column(JSON, default={})
    client: Mapped["Client"] = relationship(back_populates="domains")
    agents: Mapped[list["Agent"]] = relationship(back_populates="domain")

class Agent(Base):
    __tablename__ = "agents"
    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    domain_id: Mapped[int] = mapped_column(ForeignKey("domains.id", ondelete="CASCADE"), index=True)
    name: Mapped[str] = mapped_column(String(120))
    provider: Mapped[str] = mapped_column(String(50))  # openai|gemini|venice
    model: Mapped[str] = mapped_column(String(120))
    role: Mapped[str] = mapped_column(String(120))  # e.g., content, compliance
    config: Mapped[dict] = mapped_column(JSON, default={})
    domain: Mapped["Domain"] = relationship(back_populates="agents")
    tasks: Mapped[list["Task"]] = relationship(back_populates="agent")

class Task(Base):
    __tablename__ = "tasks"
    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    agent_id: Mapped[int] = mapped_column(ForeignKey("agents.id", ondelete="SET NULL"), nullable=True)
    client_id: Mapped[int] = mapped_column(ForeignKey("clients.id", ondelete="CASCADE"), index=True)
    input: Mapped[str] = mapped_column(Text)
    output: Mapped[str | None] = mapped_column(Text, nullable=True)
    status: Mapped[str] = mapped_column(String(20), default="queued")  # queued|running|done|error
    error: Mapped[str | None] = mapped_column(Text, nullable=True)
    meta: Mapped[dict] = mapped_column(JSON, default={})
    agent: Mapped["Agent"] = relationship(back_populates="tasks") 