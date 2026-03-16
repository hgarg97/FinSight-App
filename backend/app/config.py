from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application-wide configuration, overridable via environment variables or .env."""

    DATABASE_URL: str = "sqlite:///./data/finsight.db"
    SECRET_KEY: str = "change-me-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440  # 24 hours
    OPENAI_API_KEY: str = "sk-xxx"
    DEBUG: bool = True

    LLM_MODEL: str = "gpt-4o"

    class Config:
        env_file = ".env"
        extra = "ignore"


settings = Settings()
