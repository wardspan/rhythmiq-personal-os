from pydantic_settings import BaseSettings
from typing import List, Optional
import os

class Settings(BaseSettings):
    # Database
    DATABASE_URL: str = "postgresql://rhythmiq_user:rhythmiq_dev_password@localhost:5432/rhythmiq"
    
    # Redis
    REDIS_URL: str = "redis://localhost:6379"
    
    # Security
    SECRET_KEY: str = "dev_secret_key_change_in_production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # AI APIs
    OPENAI_API_KEY: Optional[str] = None
    ANTHROPIC_API_KEY: Optional[str] = None
    
    # OpenWeather API Key
    OPENWEATHER_API_KEY: Optional[str] = None
    OPENWEATHER_BASE_URL: str = "http://api.openweathermap.org/data/2.5"
    
    # Default location (Dedham, MA)
    DEFAULT_LATITUDE: float = 42.2477
    DEFAULT_LONGITUDE: float = -71.1611
    DEFAULT_LOCATION: str = "Dedham, MA"
    
    # WHOOP Integration
    WHOOP_CLIENT_ID: Optional[str] = None
    WHOOP_CLIENT_SECRET: Optional[str] = None
    WHOOP_REDIRECT_URI: Optional[str] = None
    WHOOP_BASE_URL: Optional[str] = None
    WHOOP_SCOPE: Optional[str] = None
    
    # CORS
    ALLOWED_HOSTS: List[str] = ["http://localhost:3000", "http://127.0.0.1:3000"]
    
    # Application
    ENVIRONMENT: str = "development"
    DEBUG: bool = True
    
    # Nudge Engine
    N8N_WEBHOOK_BASE_URL: str = "http://localhost:5678/webhook"
    
    # Chaos Detection
    RAPID_CAPTURE_THRESHOLD: int = 3  # ideas per 10 minutes
    RAPID_CAPTURE_WINDOW: int = 600   # seconds (10 minutes)
    
    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()

def get_settings():
    return settings