import os
from typing import List
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    DATABASE_URL: str
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    CLIENT_ORIGINS: List[str] = ["http://localhost:3000", "http://localhost", "http://localhost:5173", "http://localhost:8000", "http://localhost:8080"]

    CELERY_BROKER_URL: str = "redis://redis:6379/0"
    CELERY_RESULT_BACKEND: str = "redis://redis:6379/0"

    class Config:
        env_file = ".env"
        extra = 'ignore'

settings = Settings()
