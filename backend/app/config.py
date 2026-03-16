from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    DATABASE_URL: str = "sqlite:///./data/finsight.db"
    SECRET_KEY: str = "change-me"
    OPENAI_API_KEY: str = "sk-xxx"
    DEBUG: bool = True

    class Config:
        env_file = ".env"


settings = Settings()
