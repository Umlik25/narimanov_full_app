from __future__ import annotations

from datetime import datetime
from enum import StrEnum

from sqlalchemy import (
    Boolean,
    BigInteger,
    CheckConstraint,
    DateTime,
    Float,
    ForeignKey,
    Integer,
    String,
    Text,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class IssueCategory(StrEnum):
    FLOODING = "flooding"
    GARBAGE = "garbage"
    LIGHTING = "lighting"
    ROADS = "roads"
    WATER = "water"
    ELECTRICITY = "electricity"
    GAS = "gas"
    PUBLIC_SPACE_DAMAGE = "public_space_damage"
    EMERGENCY = "emergency"


class IssueSeverity(StrEnum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class IssueSource(StrEnum):
    MOBILE_REPORT = "mobile_report"
    AI_DETECTION = "ai_detection"
    INSPECTOR_REPORT = "inspector_report"
    STREET_CAMERA = "street_camera"
    CITIZEN_REPORT = "citizen_report"


class IssueAuditTrailTone(StrEnum):
    BLUE = "blue"
    GREEN = "green"
    PURPLE = "purple"
    ORANGE = "orange"
    RED = "red"


class IssueStatus(StrEnum):
    OPEN = "open"
    ASSIGNED = "assigned"
    IN_PROGRESS = "in_progress"
    RESOLVED = "resolved"


class IssueModerationStatus(StrEnum):
    SUBMITTED = "submitted"
    UNDER_REVIEW = "under_review"
    ACCEPTED = "accepted"
    REJECTED = "rejected"
    DUPLICATE = "duplicate"


class Issue(Base):
    __tablename__ = "issues"
    __table_args__ = (
        CheckConstraint(
            "status IN ('open', 'assigned', 'in_progress', 'resolved')",
            name="issue_status_valid",
        ),
        CheckConstraint(
            (
                "category IN ('flooding', 'garbage', 'lighting', 'roads', "
                "'water', 'electricity', 'gas', 'public_space_damage', 'emergency')"
            ),
            name="issue_category_valid",
        ),
        CheckConstraint(
            "severity IN ('low', 'medium', 'high', 'critical')",
            name="issue_severity_valid",
        ),
        CheckConstraint(
            (
                "source IN "
                "('mobile_report', 'ai_detection', 'inspector_report', "
                "'street_camera', 'citizen_report')"
            ),
            name="issue_source_valid",
        ),
        CheckConstraint(
            (
                "moderation_status IN "
                "('submitted', 'under_review', 'accepted', 'rejected', 'duplicate')"
            ),
            name="issue_moderation_status_valid",
        ),
    )

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    category: Mapped[str] = mapped_column(String(50), nullable=False)
    severity: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        default=IssueSeverity.MEDIUM.value,
        server_default=IssueSeverity.MEDIUM.value,
    )
    address: Mapped[str | None] = mapped_column(String(255), nullable=True)
    district: Mapped[str | None] = mapped_column(String(255), nullable=True)
    source: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
        default=IssueSource.CITIZEN_REPORT.value,
        server_default=IssueSource.CITIZEN_REPORT.value,
    )
    department_id: Mapped[int | None] = mapped_column(
        ForeignKey("departments.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    deadline: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )
    latitude: Mapped[float] = mapped_column(Float, nullable=False)
    longitude: Mapped[float] = mapped_column(Float, nullable=False)
    status: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        default=IssueStatus.OPEN.value,
        server_default=IssueStatus.OPEN.value,
    )
    moderation_status: Mapped[str] = mapped_column(
        String(30),
        nullable=False,
        default=IssueModerationStatus.SUBMITTED.value,
        server_default=IssueModerationStatus.SUBMITTED.value,
    )
    is_public: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=False,
        server_default="false",
    )
    moderation_note: Mapped[str | None] = mapped_column(Text, nullable=True)
    duplicate_of_issue_id: Mapped[int | None] = mapped_column(
        ForeignKey("issues.id"),
        nullable=True,
    )
    assigned_worker_id: Mapped[int | None] = mapped_column(
        ForeignKey("workers.id"),
        nullable=True,
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

    department: Mapped[Department | None] = relationship(
        "Department",
        back_populates="issues",
    )
    images: Mapped[list[IssueImage]] = relationship(
        "IssueImage",
        back_populates="issue",
        cascade="all, delete-orphan",
    )
    audit_trail: Mapped[list[IssueAuditTrail]] = relationship(
        "IssueAuditTrail",
        back_populates="issue",
        cascade="all, delete-orphan",
    )


class IssueImage(Base):
    __tablename__ = "issue_images"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    issue_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("issues.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    is_primary: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=False,
        server_default="false",
    )
    bucket_name: Mapped[str] = mapped_column(String(255), nullable=False)
    object_key: Mapped[str] = mapped_column(String(1024), nullable=False, unique=True)
    original_filename: Mapped[str | None] = mapped_column(String(255), nullable=True)
    content_type: Mapped[str] = mapped_column(String(100), nullable=False)
    size_bytes: Mapped[int] = mapped_column(BigInteger, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
    )

    issue: Mapped[Issue] = relationship("Issue", back_populates="images")


class Department(Base):
    __tablename__ = "departments"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)

    issues: Mapped[list[Issue]] = relationship("Issue", back_populates="department")


class IssueAuditTrail(Base):
    __tablename__ = "issue_audit_trail"
    __table_args__ = (
        CheckConstraint(
            "tone IN ('blue', 'green', 'purple', 'orange', 'red')",
            name="issue_audit_trail_tone_valid",
        ),
    )

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    issue_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("issues.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    subtitle: Mapped[str] = mapped_column(Text, nullable=False)
    actor_role: Mapped[str] = mapped_column(String(100), nullable=False)
    actor_name: Mapped[str] = mapped_column(String(255), nullable=False)
    tone: Mapped[str | None] = mapped_column(String(20), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
    )

    issue: Mapped[Issue] = relationship("Issue", back_populates="audit_trail")
