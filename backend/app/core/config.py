from pydantic_settings import BaseSettings
from typing import List
import os


class Settings(BaseSettings):
    PROJECT_NAME: str = "RecoveryOS API"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # Database
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL", 
        "sqlite:///./recovery_os.db"
    )
    
    # Redis & Celery
    REDIS_URL: str = os.getenv("REDIS_URL", "redis://localhost:6379/0")
    
    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://localhost:8000",
        "*"
    ]
    
    # LLM Settings (Optional API keys, fallback to built-in rule-grounded AI generator)
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    
    class Config:
        case_sensitive = True
        env_file = ".env"


settings = Settings()
