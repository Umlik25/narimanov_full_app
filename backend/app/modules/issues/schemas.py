from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field, model_validator

from app.modules.issues.models import (
    IssueCategory,
    IssueAuditTrailTone,
    IssueModerationStatus,
    IssueSeverity,
    IssueSource,
    IssueStatus,
)


class IssueBase(BaseModel):
    title: str = Field(min_length=1, max_length=255)
    description: str = Field(min_length=1)
    category: IssueCategory
    severity: IssueSeverity = IssueSeverity.MEDIUM
    latitude: float = Field(ge=-90, le=90)
    longitude: float = Field(ge=-180, le=180)


class IssueCreate(IssueBase):
    model_config = ConfigDict(extra="forbid")

    status: IssueStatus = IssueStatus.OPEN
    address: str | None = Field(default=None, max_length=255)
    district: str | None = Field(default=None, max_length=255)
    source: IssueSource = IssueSource.CITIZEN_REPORT
    department_id: int | None = Field(default=None, gt=0)
    deadline: datetime | None = None


class IssueUpdate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    title: str | None = Field(default=None, min_length=1, max_length=255)
    description: str | None = Field(default=None, min_length=1)
    category: IssueCategory | None = None
    severity: IssueSeverity | None = None
    address: str | None = Field(default=None, max_length=255)
    district: str | None = Field(default=None, max_length=255)
    source: IssueSource | None = None
    department_id: int | None = Field(default=None, gt=0)
    deadline: datetime | None = None
    latitude: float | None = Field(default=None, ge=-90, le=90)
    longitude: float | None = Field(default=None, ge=-180, le=180)
    status: IssueStatus | None = None


class IssueModerationUpdate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    moderation_status: IssueModerationStatus
    category: IssueCategory | None = None
    is_public: bool | None = None
    moderation_note: str | None = Field(default=None, max_length=2000)
    duplicate_of_issue_id: int | None = Field(default=None, gt=0)

    @model_validator(mode="after")
    def validate_duplicate_target(self) -> "IssueModerationUpdate":
        if (
            self.moderation_status == IssueModerationStatus.DUPLICATE
            and self.duplicate_of_issue_id is None
        ):
            raise ValueError("duplicate_of_issue_id is required for duplicate issues")
        return self


class IssueResponse(IssueBase):
    id: int
    status: IssueStatus
    moderation_status: IssueModerationStatus
    is_public: bool
    moderation_note: str | None
    duplicate_of_issue_id: int | None
    assigned_worker_id: int | None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class IssueListResponse(BaseModel):
    items: list[IssueResponse]
    limit: int
    offset: int
    total: int


class IssueWindowResponse(BaseModel):
    items: list[IssueResponse]
    total: int


class IssueAssignmentUpdate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    worker_id: int = Field(gt=0)


class IssueImageResponse(BaseModel):
    id: int
    issue_id: int
    is_primary: bool = False
    bucket_name: str
    object_key: str
    original_filename: str | None
    content_type: str
    size_bytes: int
    url: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class IssueImageListResponse(BaseModel):
    items: list[IssueImageResponse]
    total: int


class IssueDepartmentResponse(BaseModel):
    id: int
    name: str

    model_config = ConfigDict(from_attributes=True)


class IssueDetailsImageResponse(BaseModel):
    id: int
    url: str
    is_primary: bool | None = None

    model_config = ConfigDict(from_attributes=True)


class IssueAuditTrailResponse(BaseModel):
    id: int
    title: str
    subtitle: str
    actor_role: str
    actor_name: str
    created_at: datetime
    tone: IssueAuditTrailTone | None = None

    model_config = ConfigDict(from_attributes=True)


class IssueDetailsResponse(IssueResponse):
    address: str | None
    district: str | None
    source: IssueSource
    department: IssueDepartmentResponse | None = None
    deadline: datetime | None = None
    images: list[IssueDetailsImageResponse]
    audit_trail: list[IssueAuditTrailResponse]

    model_config = ConfigDict(from_attributes=True)
