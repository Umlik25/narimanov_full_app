from mimetypes import guess_extension
from uuid import uuid4

from fastapi import UploadFile
from starlette.concurrency import run_in_threadpool

from app.core.config import settings
from app.core.exceptions import BadRequestError, NotFoundError
from app.core.s3 import S3Storage
from app.modules.issues.models import (
    Issue,
    IssueImage,
    IssueModerationStatus,
    IssueSource,
)
from app.modules.issues.repository import IssueRepository
from app.modules.issues.schemas import (
    IssueAssignmentUpdate,
    IssueCreate,
    IssueAuditTrailResponse,
    IssueDepartmentResponse,
    IssueDetailsImageResponse,
    IssueDetailsResponse,
    IssueImageResponse,
    IssueModerationUpdate,
    IssueUpdate,
)
from app.modules.issues.models import IssueStatus
from app.modules.workers.models import WorkerStatus
from app.modules.workers.repository import WorkerRepository


class IssueService:
    def __init__(
        self,
        repository: IssueRepository,
        worker_repository: WorkerRepository,
        s3_storage: S3Storage | None = None,
    ) -> None:
        self.repository = repository
        self.worker_repository = worker_repository
        self.s3_storage = s3_storage

    async def create_issue(self, payload: IssueCreate) -> Issue:
        issue_data = payload.model_dump(mode="python")
        await self._ensure_department_exists(issue_data.get("department_id"))
        issue = await self.repository.create(issue_data)
        await self._create_audit_event(
            issue_id=issue.id,
            title="Issue submitted",
            subtitle="Issue report was created",
            actor_role="reporter",
            actor_name="System",
            tone="blue",
        )
        return issue

    async def get_issue(self, issue_id: int) -> Issue:
        issue = await self.repository.get_by_id(issue_id)
        if issue is None:
            raise NotFoundError(f"Issue {issue_id} not found")
        return issue

    async def get_visible_issue(self, issue_id: int) -> Issue:
        issue = await self.repository.get_visible_by_id(issue_id)
        if issue is None:
            raise NotFoundError(f"Issue {issue_id} not found")
        return issue

    async def get_issue_details(self, issue_id: int) -> IssueDetailsResponse:
        issue = await self.repository.get_details_by_id(issue_id)
        if issue is None:
            raise NotFoundError(f"Issue {issue_id} not found")

        department = None
        if getattr(issue, "department", None) is not None:
            department = IssueDepartmentResponse.model_validate(issue.department)

        images = sorted(
            getattr(issue, "images", []),
            key=lambda image: (
                not getattr(image, "is_primary", False),
                getattr(image, "created_at", None),
                getattr(image, "id", 0),
            ),
        )
        audit_entries = sorted(
            getattr(issue, "audit_trail", []),
            key=lambda entry: (
                getattr(entry, "created_at", None),
                getattr(entry, "id", 0),
            ),
        )

        return IssueDetailsResponse(
            id=issue.id,
            title=issue.title,
            description=issue.description,
            category=issue.category,
            severity=issue.severity,
            latitude=issue.latitude,
            longitude=issue.longitude,
            status=issue.status,
            moderation_status=issue.moderation_status,
            is_public=issue.is_public,
            moderation_note=issue.moderation_note,
            duplicate_of_issue_id=issue.duplicate_of_issue_id,
            assigned_worker_id=issue.assigned_worker_id,
            created_at=issue.created_at,
            updated_at=issue.updated_at,
            address=issue.address,
            district=issue.district,
            source=issue.source or IssueSource.CITIZEN_REPORT.value,
            department=department,
            deadline=issue.deadline,
            images=[self._issue_details_image_response(image) for image in images],
            audit_trail=[
                IssueAuditTrailResponse.model_validate(entry) for entry in audit_entries
            ],
        )

    async def list_issues(self, limit: int, offset: int) -> tuple[list[Issue], int]:
        return await self.repository.list(limit=limit, offset=offset)

    async def list_issues_for_moderation(
        self,
        limit: int,
        offset: int,
        moderation_status: IssueModerationStatus | None = None,
    ) -> tuple[list[Issue], int]:
        return await self.repository.list_for_moderation(
            limit=limit,
            offset=offset,
            moderation_status=moderation_status,
        )

    async def list_issues_assigned_to_worker(
        self,
        worker_id: int,
        limit: int,
        offset: int,
    ) -> tuple[list[Issue], int]:
        worker = await self.worker_repository.get_by_id(worker_id)
        if worker is None:
            raise NotFoundError(f"Worker {worker_id} not found")

        return await self.repository.list_assigned_to_worker(
            worker_id=worker_id,
            limit=limit,
            offset=offset,
        )

    async def list_issues_in_window(
        self,
        min_lat: float,
        min_lon: float,
        max_lat: float,
        max_lon: float,
    ) -> list[Issue]:
        return await self.repository.list_in_window(
            min_latitude=min_lat,
            min_longitude=min_lon,
            max_latitude=max_lat,
            max_longitude=max_lon,
        )

    async def upload_issue_images(
        self,
        issue_id: int,
        files: list[UploadFile],
    ) -> list[IssueImageResponse]:
        if self.s3_storage is None:
            raise BadRequestError("S3 storage is not configured")

        await self.get_issue(issue_id)

        images: list[IssueImageResponse] = []
        for file in files:
            image = await self._upload_issue_image(issue_id, file)
            images.append(self._image_response(image))

        image_count = len(images)
        await self._create_audit_event(
            issue_id=issue_id,
            title="Images uploaded",
            subtitle=(
                f"{image_count} image uploaded"
                if image_count == 1
                else f"{image_count} images uploaded"
            ),
            actor_role="reporter",
            actor_name="System",
            tone="purple",
        )
        return images

    async def list_issue_images(self, issue_id: int) -> list[IssueImageResponse]:
        await self.get_issue(issue_id)
        images = await self.repository.list_images(issue_id)
        return [self._image_response(image) for image in images]

    async def get_issue_image(
        self,
        issue_id: int,
        image_id: int,
    ) -> IssueImageResponse:
        await self.get_issue(issue_id)
        image = await self.repository.get_image(issue_id, image_id)
        if image is None:
            raise NotFoundError(f"Image {image_id} not found")
        return self._image_response(image)

    async def delete_issue_image(self, issue_id: int, image_id: int) -> None:
        if self.s3_storage is None:
            raise BadRequestError("S3 storage is not configured")

        await self.get_issue(issue_id)
        image = await self.repository.delete_image(issue_id, image_id)
        if image is None:
            raise NotFoundError(f"Image {image_id} not found")

        await run_in_threadpool(self.s3_storage.delete_file, image.object_key)
        await self._create_audit_event(
            issue_id=issue_id,
            title="Image removed",
            subtitle=f"Image {image_id} was removed",
            actor_role="operator",
            actor_name="System",
            tone="red",
        )

    async def update_issue(self, issue_id: int, payload: IssueUpdate) -> Issue:
        issue = await self.get_issue(issue_id)
        update_data = payload.model_dump(exclude_unset=True, mode="python")
        if "department_id" in update_data:
            await self._ensure_department_exists(update_data.get("department_id"))
        if update_data.get("status") == IssueStatus.IN_PROGRESS.value:
            if issue.assigned_worker_id is None:
                raise BadRequestError("Only assigned issues can be started")
            if issue.moderation_status != IssueModerationStatus.ACCEPTED.value:
                raise BadRequestError("Only accepted issues can be started")
        updated_issue = await self.repository.update(issue, update_data)
        if update_data:
            if update_data.get("status") == IssueStatus.IN_PROGRESS.value:
                await self._create_audit_event(
                    issue_id=issue_id,
                    title="Work started",
                    subtitle="Assigned team started work on the issue",
                    actor_role="dispatcher",
                    actor_name="System",
                    tone="blue",
                )
                return updated_issue
            await self._create_audit_event(
                issue_id=issue_id,
                title="Issue updated",
                subtitle=self._updated_fields_subtitle(update_data),
                actor_role="operator",
                actor_name="System",
                tone="orange",
            )
        return updated_issue

    async def moderate_issue(
        self,
        issue_id: int,
        payload: IssueModerationUpdate,
    ) -> Issue:
        issue = await self.get_issue(issue_id)

        if payload.duplicate_of_issue_id is not None:
            if payload.duplicate_of_issue_id == issue_id:
                raise BadRequestError("Issue cannot be marked as duplicate of itself")

            duplicate_target = await self.repository.get_by_id(
                payload.duplicate_of_issue_id
            )
            if duplicate_target is None:
                raise NotFoundError(
                    f"Issue {payload.duplicate_of_issue_id} not found"
                )

        update_data = payload.model_dump(exclude_unset=True, mode="python")
        moderation_status = payload.moderation_status

        if moderation_status == IssueModerationStatus.ACCEPTED:
            update_data.setdefault("is_public", True)
        else:
            update_data.setdefault("is_public", False)

        if moderation_status != IssueModerationStatus.DUPLICATE:
            update_data["duplicate_of_issue_id"] = None

        updated_issue = await self.repository.update(issue, update_data)
        await self._create_moderation_audit_event(
            issue_id=issue_id,
            moderation_status=moderation_status,
            moderation_note=payload.moderation_note,
            duplicate_of_issue_id=payload.duplicate_of_issue_id,
        )
        return updated_issue

    async def assign_issue(
        self,
        issue_id: int,
        payload: IssueAssignmentUpdate,
    ) -> Issue:
        issue = await self.get_issue(issue_id)
        if issue.moderation_status != IssueModerationStatus.ACCEPTED.value:
            raise BadRequestError("Only accepted issues can be assigned")

        worker = await self.worker_repository.get_by_id(payload.worker_id)
        if worker is None:
            raise NotFoundError(f"Worker {payload.worker_id} not found")

        if worker.status != WorkerStatus.ACTIVE.value:
            raise BadRequestError("Only active workers can be assigned")

        if (
            issue.assigned_worker_id == payload.worker_id
            and issue.status in {IssueStatus.ASSIGNED.value, IssueStatus.IN_PROGRESS.value}
        ):
            return issue

        updated_issue = await self.repository.update(
            issue,
            {
                "assigned_worker_id": payload.worker_id,
                "status": IssueStatus.ASSIGNED.value,
            },
        )
        worker_name = getattr(worker, "full_name", None) or f"Worker {worker.id}"
        await self._create_audit_event(
            issue_id=issue_id,
            title="Issue assigned",
            subtitle=f"Assigned to {worker_name}",
            actor_role="dispatcher",
            actor_name="System",
            tone="green",
        )
        return updated_issue

    async def unassign_issue(self, issue_id: int) -> Issue:
        issue = await self.get_issue(issue_id)
        update_data: dict[str, object] = {"assigned_worker_id": None}

        if issue.status in {IssueStatus.ASSIGNED.value, IssueStatus.IN_PROGRESS.value}:
            update_data["status"] = IssueStatus.OPEN.value

        updated_issue = await self.repository.update(issue, update_data)
        await self._create_audit_event(
            issue_id=issue_id,
            title="Assignment removed",
            subtitle="Issue assignment was removed",
            actor_role="dispatcher",
            actor_name="System",
            tone="orange",
        )
        return updated_issue

    async def delete_issue(self, issue_id: int) -> None:
        images = await self.repository.list_images(issue_id)
        deleted = await self.repository.delete(issue_id)
        if not deleted:
            raise NotFoundError(f"Issue {issue_id} not found")

        if self.s3_storage is not None:
            for image in images:
                await run_in_threadpool(self.s3_storage.delete_file, image.object_key)

    async def _upload_issue_image(
        self,
        issue_id: int,
        file: UploadFile,
    ) -> IssueImage:
        if self.s3_storage is None:
            raise BadRequestError("S3 storage is not configured")

        content_type = file.content_type or "application/octet-stream"
        if not content_type.startswith("image/"):
            raise BadRequestError("Only image uploads are supported")

        content = await file.read()
        if not content:
            raise BadRequestError("Uploaded image cannot be empty")

        object_key = self._build_image_object_key(
            issue_id=issue_id,
            filename=file.filename,
            content_type=content_type,
        )
        try:
            await run_in_threadpool(
                self.s3_storage.upload_file,
                object_key,
                content,
                content_type,
            )
        except Exception as exc:
            raise BadRequestError("Image storage is unavailable") from exc

        return await self.repository.create_image(
            {
                "issue_id": issue_id,
                "is_primary": False,
                "bucket_name": settings.s3_bucket_name,
                "object_key": object_key,
                "original_filename": file.filename,
                "content_type": content_type,
                "size_bytes": len(content),
            }
        )

    def _build_image_object_key(
        self,
        issue_id: int,
        filename: str | None,
        content_type: str,
    ) -> str:
        extension = guess_extension(content_type) or ""
        if not extension and filename and "." in filename:
            extension = "." + filename.rsplit(".", 1)[1]

        return f"issues/{issue_id}/images/{uuid4().hex}{extension}"

    def _image_response(self, image: IssueImage) -> IssueImageResponse:
        if self.s3_storage is None:
            raise BadRequestError("S3 storage is not configured")

        return IssueImageResponse(
            id=image.id,
            issue_id=image.issue_id,
            is_primary=image.is_primary,
            bucket_name=image.bucket_name,
            object_key=image.object_key,
            original_filename=image.original_filename,
            content_type=image.content_type,
            size_bytes=image.size_bytes,
            url=self.s3_storage.create_presigned_get_url(image.object_key),
            created_at=image.created_at,
        )

    async def _ensure_department_exists(self, department_id: object) -> None:
        if department_id is None:
            return

        department = await self.repository.get_department_by_id(int(department_id))
        if department is None:
            raise NotFoundError(f"Department {department_id} not found")

    async def _create_audit_event(
        self,
        issue_id: int,
        title: str,
        subtitle: str,
        actor_role: str,
        actor_name: str,
        tone: str,
    ) -> None:
        await self.repository.create_audit_trail(
            {
                "issue_id": issue_id,
                "title": title,
                "subtitle": subtitle,
                "actor_role": actor_role,
                "actor_name": actor_name,
                "tone": tone,
            }
        )

    async def _create_moderation_audit_event(
        self,
        issue_id: int,
        moderation_status: IssueModerationStatus,
        moderation_note: str | None,
        duplicate_of_issue_id: int | None,
    ) -> None:
        event_map = {
            IssueModerationStatus.SUBMITTED: (
                "Issue resubmitted",
                "Issue was moved back to submitted",
                "blue",
            ),
            IssueModerationStatus.UNDER_REVIEW: (
                "Issue under review",
                "Issue was moved into moderation review",
                "orange",
            ),
            IssueModerationStatus.ACCEPTED: (
                "Issue accepted",
                "Issue was approved and made public",
                "green",
            ),
            IssueModerationStatus.REJECTED: (
                "Issue rejected",
                moderation_note or "Issue was rejected during moderation",
                "red",
            ),
            IssueModerationStatus.DUPLICATE: (
                "Issue marked duplicate",
                (
                    f"Marked as duplicate of issue {duplicate_of_issue_id}"
                    if duplicate_of_issue_id is not None
                    else "Issue was marked as duplicate"
                ),
                "purple",
            ),
        }
        title, subtitle, tone = event_map[moderation_status]
        await self._create_audit_event(
            issue_id=issue_id,
            title=title,
            subtitle=subtitle,
            actor_role="moderator",
            actor_name="System",
            tone=tone,
        )

    def _updated_fields_subtitle(self, update_data: dict[str, object]) -> str:
        field_names = {
            "assigned_worker_id": "assignment",
            "department_id": "department",
            "duplicate_of_issue_id": "duplicate link",
            "is_public": "visibility",
            "moderation_note": "moderation note",
            "moderation_status": "moderation status",
        }
        labels = [
            field_names.get(field, field.replace("_", " "))
            for field in sorted(update_data)
        ]
        return "Updated " + ", ".join(labels)

    def _issue_details_image_response(
        self,
        image: IssueImage,
    ) -> IssueDetailsImageResponse:
        if self.s3_storage is None:
            raise BadRequestError("S3 storage is not configured")

        return IssueDetailsImageResponse(
            id=image.id,
            url=self.s3_storage.create_presigned_get_url(image.object_key),
            is_primary=image.is_primary,
        )
