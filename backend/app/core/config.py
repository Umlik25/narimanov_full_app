from functools import lru_cache
from typing import Annotated

from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, NoDecode, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "City Dispatch API"
    debug: bool = False
    database_url: str = Field(
        default="postgresql+asyncpg://postgres:postgres@localhost:5432/city_dispatch",
        validation_alias="DATABASE_URL",
    )
    redis_url: str = Field(
        default="redis://localhost:6379/0",
        validation_alias="REDIS_URL",
    )
    cors_origins: Annotated[list[str], NoDecode] = Field(
        default=["*"],
        validation_alias="CORS_ORIGINS",
    )
    worker_location_ttl_seconds: int = Field(
        default=60,
        validation_alias="WORKER_LOCATION_TTL_SECONDS",
    )
    s3_endpoint_url: str = Field(
        default="http://localhost:30990",
        validation_alias="S3_ENDPOINT_URL",
    )
    s3_public_endpoint_url: str = Field(
        default="http://main-server:30990",
        validation_alias="S3_PUBLIC_ENDPOINT_URL",
    )
    s3_access_key_id: str = Field(
        default="admin",
        validation_alias="S3_ACCESS_KEY_ID",
    )
    s3_secret_access_key: str = Field(
        default="change-me",
        validation_alias="S3_SECRET_ACCESS_KEY",
    )
    s3_bucket_name: str = Field(
        default="issue-images",
        validation_alias="S3_BUCKET_NAME",
    )
    s3_region_name: str = Field(
        default="us-east-1",
        validation_alias="S3_REGION_NAME",
    )
    s3_presigned_url_expires_seconds: int = Field(
        default=3600,
        validation_alias="S3_PRESIGNED_URL_EXPIRES_SECONDS",
    )
    water_management_forecast_cache_ttl_seconds: int = Field(
        default=600,
        validation_alias="WATER_MANAGEMENT_FORECAST_CACHE_TTL_SECONDS",
    )
    water_management_overlay_cache_ttl_seconds: int = Field(
        default=300,
        validation_alias="WATER_MANAGEMENT_OVERLAY_CACHE_TTL_SECONDS",
    )
    water_management_forecast_timeout_seconds: float = Field(
        default=3.0,
        validation_alias="WATER_MANAGEMENT_FORECAST_TIMEOUT_SECONDS",
    )

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    @field_validator("debug", mode="before")
    @classmethod
    def parse_debug(cls, value: object) -> object:
        if isinstance(value, str):
            normalized_value = value.strip().lower()
            if normalized_value in {"release", "prod", "production"}:
                return False
            if normalized_value in {"dev", "development", "debug"}:
                return True
        return value

    @field_validator("cors_origins", mode="before")
    @classmethod
    def parse_cors_origins(cls, value: object) -> object:
        if isinstance(value, str):
            return [origin.strip() for origin in value.split(",") if origin.strip()]
        return value


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
