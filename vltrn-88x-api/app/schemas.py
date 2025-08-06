from pydantic import BaseModel, Field

class DomainCreate(BaseModel):
    name: str
    type: str
    config: dict = Field(default_factory=dict)

class DomainOut(BaseModel):
    id: int
    name: str
    type: str
    config: dict
    class Config: from_attributes = True

class AgentCreate(BaseModel):
    domain_id: int
    name: str
    provider: str  # openai|gemini|venice
    model: str
    role: str
    config: dict = Field(default_factory=dict)

class AgentOut(BaseModel):
    id: int
    domain_id: int
    name: str
    provider: str
    model: str
    role: str
    config: dict
    class Config: from_attributes = True

class TaskCreate(BaseModel):
    agent_id: int
    input: str
    meta: dict = Field(default_factory=dict)

class TaskOut(BaseModel):
    id: int
    agent_id: int | None
    client_id: int
    input: str
    output: str | None
    status: str
    error: str | None
    meta: dict
    class Config: from_attributes = True 