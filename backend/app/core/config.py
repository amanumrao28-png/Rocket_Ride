import os
from typing import List
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    ENVIRONMENT: str = "development"
    PROJECT_NAME: str = "Warranty & Returns Arbiter API"
    API_V1_STR: str = "/api/v1"

    # Database (MongoDB)
    MONGODB_URI: str = os.getenv("MONGODB_URI", "mongodb://root:example_password@localhost:27017/")
    MONGODB_DB_NAME: str = os.getenv("MONGODB_DB_NAME", "warranty_arbiter_db")

    # JWT Tokens
    JWT_SECRET: str = os.getenv("JWT_SECRET", "arbiter_jwt_super_secret_access_key_2026_x98f")
    JWT_REFRESH_SECRET: str = os.getenv("JWT_REFRESH_SECRET", "arbiter_jwt_super_secret_refresh_key_2026_q41k")
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "15"))
    REFRESH_TOKEN_EXPIRE_DAYS: int = int(os.getenv("REFRESH_TOKEN_EXPIRE_DAYS", "7"))
    BCRYPT_ROUNDS: int = int(os.getenv("BCRYPT_ROUNDS", "12"))

    # Email & Verification Settings
    EMAIL_PROVIDER: str = os.getenv("EMAIL_PROVIDER", "console")
    SMTP_HOST: str = os.getenv("SMTP_HOST", "localhost")
    SMTP_PORT: int = int(os.getenv("SMTP_PORT", "587"))
    SMTP_USER: str = os.getenv("SMTP_USER", "")
    SMTP_PASS: str = os.getenv("SMTP_PASS", "")
    EMAIL_FROM_ADDRESS: str = os.getenv("EMAIL_FROM_ADDRESS", "noreply@warrantyarbiter.com")

    # CORS
    CORS_ORIGINS: str = os.getenv("CORS_ORIGINS", "http://localhost:3000,http://127.0.0.1:3000")

    # Bootstrap Seed Manager
    SEED_MANAGER_EMAIL: str = os.getenv("SEED_MANAGER_EMAIL", "manager@warrantyarbiter.demo")
    SEED_MANAGER_PASSWORD: str = os.getenv("SEED_MANAGER_PASSWORD", "demo1234")
    SEED_MANAGER_NAME: str = os.getenv("SEED_MANAGER_NAME", "Marcus Vance")

    @property
    def cors_origins_list(self) -> List[str]:
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]

    class Config:
        case_sensitive = True
        env_file = ".env"
        extra = "ignore"

settings = Settings()
