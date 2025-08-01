import os
from typing import Optional
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # Database
    mongodb_uri: str = "mongodb://localhost:27017"
    
    # JWT Configuration
    jwt_secret_key: str = "fallback-secret-key"
    jwt_algorithm: str = "HS256"
    jwt_access_token_expire_minutes: int = 30
    
    # Firebase
    firebase_project_id: str = ""
    
    # Security
    bcrypt_rounds: int = 12
    
    # Environment
    environment: str = "development"
    api_host: str = "localhost"
    api_port: int = 8000
    
    class Config:
        env_file = ".env"
        case_sensitive = False

# Global settings instance
settings = Settings()

# Security validation
if settings.environment == "production":
    if settings.jwt_secret_key == "fallback-secret-key":
        raise ValueError("JWT_SECRET_KEY must be set in production")