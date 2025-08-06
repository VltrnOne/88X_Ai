from pydantic_settings import BaseSettings
from pydantic import Field

class Settings(BaseSettings):
    APP_ENV: str = "dev"
    APP_DEBUG: bool = True

    DB_HOST: str
    DB_PORT: int = 5432
    DB_NAME: str
    DB_USER: str
    DB_PASSWORD: str

    SECRET_KEY_BASE64: str

    OPENAI_API_KEY: str | None = None
    GOOGLE_API_KEY: str | None = None
    VENICE_API_KEY: str | None = None

    class Config:
        env_file = ".env"

settings = Settings() 