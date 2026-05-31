from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

from app.modules.workers.models import WorkerStatus


class WorkerBase(BaseModel):
    full_name: str = Field(min_length=1, max_length=255)
    phone_number: str | None = Field(default=None, max_length=50)
    role: str | None = Field(default=None, max_length=100)


class WorkerCreate(WorkerBase):
    status: WorkerStatus = WorkerStatus.ACTIVE


class WorkerUpdate(BaseModel):
    full_name: str | None = Field(default=None, min_length=1, max_length=255)
    phone_number: str | None = Field(default=None, max_length=50)
    role: str | None = Field(default=None, max_length=100)
    status: WorkerStatus | None = None


class WorkerResponse(WorkerBase):
    id: int
    status: WorkerStatus
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class WorkerListResponse(BaseModel):
    items: list[WorkerResponse]
    limit: int
    offset: int
    total: int


class WorkerLocationUpdate(BaseModel):
    latitude: float = Field(ge=-90, le=90)
    longitude: float = Field(ge=-180, le=180)


class WorkerLocationResponse(WorkerLocationUpdate):
    worker_id: int
    direction: float | None = None
    updated_at: datetime | None = None


class WorkerWindowItemResponse(BaseModel):
    worker_id: int
    latitude: float
    longitude: float
    direction: float | None = None


class WorkerWindowResponse(BaseModel):
    items: list[WorkerWindowItemResponse]
    total: int
