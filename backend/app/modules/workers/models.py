from datetime import datetime
from enum import StrEnum

from sqlalchemy import CheckConstraint, DateTime, String, func
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class WorkerStatus(StrEnum):
    ACTIVE = "active"
    INACTIVE = "inactive"


class Worker(Base):
    __tablename__ = "workers"
    __table_args__ = (
        CheckConstraint(
            "status IN ('active', 'inactive')",
            name="worker_status_valid",
        ),
    )

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    full_name: Mapped[str] = mapped_column(String(255), nullable=False)
    phone_number: Mapped[str | None] = mapped_column(String(50), nullable=True)
    role: Mapped[str | None] = mapped_column(String(100), nullable=True)
    status: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        default=WorkerStatus.ACTIVE.value,
        server_default=WorkerStatus.ACTIVE.value,
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
        onupdate=func.now(),
    )
