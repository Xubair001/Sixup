from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", case_sensitive=False, extra="ignore")

    DATABASE_URL: str = "postgresql+asyncpg://cricket:cricket@localhost:5432/indoor_cricket"
    REDIS_URL: str = "redis://localhost:6379"

    JWT_SECRET: str = "change_me_in_production"
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRE_MINUTES: int = 60
    JWT_REFRESH_EXPIRE_DAYS: int = 7

    LOG_LEVEL: str = "INFO"
    DEBUG: bool = False

    STATIC_DIR: str = "static"
    MAX_AVATAR_SIZE_MB: int = 5

    APP_NAME: str = "Sixup"


settings = Settings()
