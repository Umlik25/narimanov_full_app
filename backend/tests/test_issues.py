from datetime import UTC, datetime
from types import SimpleNamespace
from unittest.mock import patch
from unittest import IsolatedAsyncioTestCase

from fastapi import UploadFile

from app.core.exceptions import BadRequestError, NotFoundError
from app.modules.issues.models import (
    IssueModerationStatus,
    IssueSeverity,
    IssueStatus,
)
from app.modules.issues.schemas import (
    IssueAssignmentUpdate,
    IssueCreate,
    IssueModerationUpdate,
    IssueUpdate,
)
from app.modules.issues.service import IssueService
from app.modules.workers.models import WorkerStatus


async def immediate_run_in_threadpool(func, *args, **kwargs):
    return func(*args, **kwargs)


class FakeIssueRepository:
    def __init__(self) -> None:
        self.issues: dict[int, SimpleNamespace] = {}
        self.departments: dict[int, SimpleNamespace] = {}
        self.images: dict[int, SimpleNamespace] = {}
        self.audit_trail: dict[int, SimpleNamespace] = {}
        self.list_result: tuple[list[SimpleNamespace], int] = ([], 0)
        self.moderation_result: tuple[list[SimpleNamespace], int] = ([], 0)
        self.assigned_result: tuple[list[SimpleNamespace], int] = ([], 0)

    async def create(self, issue_data: dict[str, object]) -> SimpleNamespace:
        issue = SimpleNamespace(
            id=len(self.issues) + 1,
            title=issue_data["title"],
            description=issue_data["description"],
            category=issue_data["category"],
            severity=issue_data.get("severity", IssueSeverity.MEDIUM.value),
            address=issue_data.get("address"),
            district=issue_data.get("district"),
            source=issue_data.get("source", "citizen_report"),
            department_id=issue_data.get("department_id"),
            deadline=issue_data.get("deadline"),
            latitude=issue_data["latitude"],
            longitude=issue_data["longitude"],
            status=issue_data.get("status", IssueStatus.OPEN.value),
            moderation_status=issue_data.get(
                "moderation_status",
                IssueModerationStatus.SUBMITTED.value,
            ),
            is_public=issue_data.get("is_public", False),
            moderation_note=issue_data.get("moderation_note"),
            duplicate_of_issue_id=issue_data.get("duplicate_of_issue_id"),
            assigned_worker_id=issue_data.get("assigned_worker_id"),
            created_at=datetime.now(UTC),
            updated_at=datetime.now(UTC),
            department=None,
            images=[],
            audit_trail=[],
        )
        self.issues[issue.id] = issue
        return issue

    async def create_department(self, department_data: dict[str, object]) -> SimpleNamespace:
        department = SimpleNamespace(
            id=len(self.departments) + 1,
            name=department_data["name"],
        )
        self.departments[department.id] = department
        return department

    async def create_audit_trail(
        self,
        audit_trail_data: dict[str, object],
    ) -> SimpleNamespace:
        entry = SimpleNamespace(
            id=len(self.audit_trail) + 1,
            issue_id=audit_trail_data["issue_id"],
            title=audit_trail_data["title"],
            subtitle=audit_trail_data["subtitle"],
            actor_role=audit_trail_data["actor_role"],
            actor_name=audit_trail_data["actor_name"],
            tone=audit_trail_data.get("tone"),
            created_at=datetime.now(UTC),
        )
        self.audit_trail[entry.id] = entry
        issue = self.issues.get(entry.issue_id)
        if issue is not None:
            issue.audit_trail.append(entry)
        return entry

    async def get_by_id(self, issue_id: int) -> SimpleNamespace | None:
        return self.issues.get(issue_id)

    async def get_details_by_id(self, issue_id: int) -> SimpleNamespace | None:
        return self.issues.get(issue_id)

    async def get_department_by_id(
        self,
        department_id: int,
    ) -> SimpleNamespace | None:
        return self.departments.get(department_id)

    async def get_visible_by_id(self, issue_id: int) -> SimpleNamespace | None:
        issue = self.issues.get(issue_id)
        if (
            issue is not None
            and issue.moderation_status == IssueModerationStatus.ACCEPTED.value
            and issue.is_public is True
        ):
            return issue
        return None

    async def list(
        self,
        limit: int,
        offset: int,
    ) -> tuple[list[SimpleNamespace], int]:
        return self.list_result

    async def list_for_moderation(
        self,
        limit: int,
        offset: int,
        moderation_status: IssueModerationStatus | None = None,
    ) -> tuple[list[SimpleNamespace], int]:
        return self.moderation_result

    async def list_assigned_to_worker(
        self,
        worker_id: int,
        limit: int,
        offset: int,
    ) -> tuple[list[SimpleNamespace], int]:
        return self.assigned_result

    async def list_in_window(
        self,
        min_latitude: float,
        min_longitude: float,
        max_latitude: float,
        max_longitude: float,
    ) -> list[SimpleNamespace]:
        return [issue for issue in self.issues.values() if issue.is_public]

    async def update(
        self,
        issue: SimpleNamespace,
        issue_data: dict[str, object],
    ) -> SimpleNamespace:
        for field, value in issue_data.items():
            setattr(issue, field, value)
        return issue

    async def delete(self, issue_id: int) -> bool:
        return self.issues.pop(issue_id, None) is not None

    async def create_image(self, image_data: dict[str, object]) -> SimpleNamespace:
        image = SimpleNamespace(
            id=len(self.images) + 1,
            issue_id=image_data["issue_id"],
            is_primary=image_data.get("is_primary", False),
            bucket_name=image_data["bucket_name"],
            object_key=image_data["object_key"],
            original_filename=image_data["original_filename"],
            content_type=image_data["content_type"],
            size_bytes=image_data["size_bytes"],
            created_at=datetime.now(UTC),
        )
        self.images[image.id] = image
        issue = self.issues.get(image.issue_id)
        if issue is not None:
            issue.images.append(image)
        return image

    async def get_image(self, issue_id: int, image_id: int) -> SimpleNamespace | None:
        image = self.images.get(image_id)
        if image is not None and image.issue_id == issue_id:
            return image
        return None

    async def list_images(self, issue_id: int) -> list[SimpleNamespace]:
        return [image for image in self.images.values() if image.issue_id == issue_id]

    async def delete_image(
        self,
        issue_id: int,
        image_id: int,
    ) -> SimpleNamespace | None:
        image = await self.get_image(issue_id, image_id)
        if image is None:
            return None
        self.images.pop(image_id, None)
        return image


class FakeWorkerRepository:
    def __init__(self) -> None:
        self.workers: dict[int, SimpleNamespace] = {}

    async def get_by_id(self, worker_id: int) -> SimpleNamespace | None:
        return self.workers.get(worker_id)


class FakeS3Storage:
    def __init__(self) -> None:
        self.uploaded: list[tuple[str, bytes, str]] = []
        self.deleted: list[str] = []
        self.bucket_name = "issue-images"

    def upload_file(self, object_key: str, content: bytes, content_type: str) -> None:
        self.uploaded.append((object_key, content, content_type))

    def create_presigned_get_url(self, object_key: str) -> str:
        return f"https://example.test/{object_key}"

    def delete_file(self, object_key: str) -> None:
        self.deleted.append(object_key)


class IssueServiceTests(IsolatedAsyncioTestCase):
    def setUp(self) -> None:
        self.issue_repository = FakeIssueRepository()
        self.worker_repository = FakeWorkerRepository()
        self.s3_storage = FakeS3Storage()
        self.run_in_threadpool_patch = patch(
            "app.modules.issues.service.run_in_threadpool",
            new=immediate_run_in_threadpool,
        )
        self.run_in_threadpool_patch.start()
        self.service = IssueService(
            repository=self.issue_repository,
            worker_repository=self.worker_repository,
            s3_storage=self.s3_storage,
        )

    def tearDown(self) -> None:
        self.run_in_threadpool_patch.stop()

    async def test_create_issue_uses_repository(self) -> None:
        issue = await self.service.create_issue(
            IssueCreate(
                title="Pothole",
                description="Big one",
                category="roads",
                latitude=40.4,
                longitude=49.8,
            )
        )

        self.assertEqual(issue.title, "Pothole")
        self.assertEqual(issue.status, IssueStatus.OPEN.value)
        self.assertEqual(issue.severity, IssueSeverity.MEDIUM.value)
        self.assertEqual(len(self.issue_repository.audit_trail), 1)
        self.assertEqual(
            self.issue_repository.audit_trail[1].title,
            "Issue submitted",
        )

    async def test_create_issue_requires_existing_department(self) -> None:
        with self.assertRaisesRegex(NotFoundError, "Department 99 not found"):
            await self.service.create_issue(
                IssueCreate(
                    title="Pothole",
                    description="Big one",
                    category="roads",
                    latitude=40.4,
                    longitude=49.8,
                    department_id=99,
                )
            )

    async def test_update_issue_can_change_severity(self) -> None:
        issue = await self.issue_repository.create(
            {
                "title": "Needs attention",
                "description": "Severity should change",
                "category": "roads",
                "severity": IssueSeverity.LOW.value,
                "latitude": 40.4,
                "longitude": 49.8,
            }
        )

        updated_issue = await self.service.update_issue(
            issue.id,
            IssueUpdate(severity=IssueSeverity.CRITICAL),
        )

        self.assertEqual(updated_issue.severity, IssueSeverity.CRITICAL.value)
        self.assertEqual(len(self.issue_repository.audit_trail), 1)
        self.assertEqual(
            self.issue_repository.audit_trail[1].title,
            "Issue updated",
        )

    async def test_update_issue_requires_existing_department(self) -> None:
        issue = await self.issue_repository.create(
            {
                "title": "Needs attention",
                "description": "Department should be checked",
                "category": "roads",
                "severity": IssueSeverity.LOW.value,
                "latitude": 40.4,
                "longitude": 49.8,
            }
        )

        with self.assertRaisesRegex(NotFoundError, "Department 99 not found"):
            await self.service.update_issue(
                issue.id,
                IssueUpdate(department_id=99),
            )

    async def test_get_visible_issue_requires_public_accepted_issue(self) -> None:
        issue = await self.issue_repository.create(
            {
                "title": "Visible",
                "description": "Visible issue",
                "category": "roads",
                "severity": IssueSeverity.HIGH.value,
                "latitude": 40.4,
                "longitude": 49.8,
                "status": IssueStatus.OPEN.value,
                "moderation_status": IssueModerationStatus.ACCEPTED.value,
                "is_public": True,
            }
        )

        visible_issue = await self.service.get_visible_issue(issue.id)

        self.assertEqual(visible_issue.id, issue.id)

    async def test_get_visible_issue_rejects_private_issue(self) -> None:
        issue = await self.issue_repository.create(
            {
                "title": "Hidden",
                "description": "Hidden issue",
                "category": "roads",
                "severity": IssueSeverity.LOW.value,
                "latitude": 40.4,
                "longitude": 49.8,
            }
        )

        with self.assertRaisesRegex(NotFoundError, f"Issue {issue.id} not found"):
            await self.service.get_visible_issue(issue.id)

    async def test_get_issue_details_returns_core_and_related_fields(self) -> None:
        department = await self.issue_repository.create_department(
            {"name": "Road Maintenance"}
        )
        issue = await self.issue_repository.create(
            {
                "title": "Collapsed road",
                "description": "The asphalt is broken near the crossing",
                "category": "roads",
                "severity": IssueSeverity.HIGH.value,
                "address": "123 Main St",
                "district": "Narimanov",
                "source": "mobile_report",
                "department_id": department.id,
                "deadline": datetime(2026, 6, 2, tzinfo=UTC),
                "latitude": 40.4,
                "longitude": 49.8,
                "moderation_status": IssueModerationStatus.ACCEPTED.value,
                "is_public": True,
            }
        )
        issue.department = department
        image = await self.issue_repository.create_image(
            {
                "issue_id": issue.id,
                "is_primary": True,
                "bucket_name": self.s3_storage.bucket_name,
                "object_key": "issues/1/images/primary.jpg",
                "original_filename": "primary.jpg",
                "content_type": "image/jpeg",
                "size_bytes": 12,
            }
        )
        audit_entry = await self.issue_repository.create_audit_trail(
            {
                "issue_id": issue.id,
                "title": "Accepted",
                "subtitle": "Issue accepted by moderator",
                "actor_role": "moderator",
                "actor_name": "Aysel",
                "tone": "green",
            }
        )

        details = await self.service.get_issue_details(issue.id)

        self.assertEqual(details.id, issue.id)
        self.assertEqual(details.title, issue.title)
        self.assertEqual(details.description, issue.description)
        self.assertEqual(details.category, issue.category)
        self.assertEqual(details.severity, issue.severity)
        self.assertEqual(details.latitude, issue.latitude)
        self.assertEqual(details.longitude, issue.longitude)
        self.assertEqual(details.status, issue.status)
        self.assertEqual(details.moderation_status, issue.moderation_status)
        self.assertTrue(details.is_public)
        self.assertEqual(details.address, "123 Main St")
        self.assertEqual(details.district, "Narimanov")
        self.assertEqual(details.source, "mobile_report")
        self.assertIsNotNone(details.department)
        self.assertEqual(details.department.id, department.id)
        self.assertEqual(details.department.name, department.name)
        self.assertEqual(details.deadline, datetime(2026, 6, 2, tzinfo=UTC))
        self.assertEqual(len(details.images), 1)
        self.assertEqual(details.images[0].id, image.id)
        self.assertEqual(details.images[0].url, "https://example.test/issues/1/images/primary.jpg")
        self.assertTrue(details.images[0].is_primary)
        self.assertEqual(len(details.audit_trail), 1)
        self.assertEqual(details.audit_trail[0].id, audit_entry.id)
        self.assertEqual(details.audit_trail[0].title, "Accepted")
        self.assertEqual(details.audit_trail[0].tone, "green")

    async def test_get_issue_details_returns_empty_related_lists(self) -> None:
        issue = await self.issue_repository.create(
            {
                "title": "Bare issue",
                "description": "No extras yet",
                "category": "roads",
                "severity": IssueSeverity.MEDIUM.value,
                "latitude": 40.4,
                "longitude": 49.8,
            }
        )

        details = await self.service.get_issue_details(issue.id)

        self.assertEqual(details.id, issue.id)
        self.assertEqual(details.images, [])
        self.assertEqual(details.audit_trail, [])
        self.assertIsNone(details.department)

    async def test_get_issue_details_rejects_missing_issue(self) -> None:
        with self.assertRaisesRegex(NotFoundError, "Issue 999 not found"):
            await self.service.get_issue_details(999)

    async def test_list_issues_delegates_to_repository(self) -> None:
        issue = SimpleNamespace(id=1)
        self.issue_repository.list_result = ([issue], 1)

        issues, total = await self.service.list_issues(limit=20, offset=0)

        self.assertEqual(issues, [issue])
        self.assertEqual(total, 1)

    async def test_list_issues_in_window_delegates_to_repository(self) -> None:
        issue = SimpleNamespace(id=2, is_public=True)
        self.issue_repository.issues[issue.id] = issue

        issues = await self.service.list_issues_in_window(
            min_lat=40.0,
            min_lon=49.0,
            max_lat=41.0,
            max_lon=50.0,
        )

        self.assertEqual(issues, [issue])

    async def test_moderate_issue_marks_accepted_issue_public(self) -> None:
        issue = await self.issue_repository.create(
            {
                "title": "Moderate me",
                "description": "Needs review",
                "category": "roads",
                "severity": IssueSeverity.MEDIUM.value,
                "latitude": 40.4,
                "longitude": 49.8,
            }
        )

        moderated_issue = await self.service.moderate_issue(
            issue.id,
            IssueModerationUpdate(moderation_status=IssueModerationStatus.ACCEPTED),
        )

        self.assertEqual(moderated_issue.moderation_status, IssueModerationStatus.ACCEPTED.value)
        self.assertTrue(moderated_issue.is_public)
        self.assertIsNone(moderated_issue.duplicate_of_issue_id)
        self.assertEqual(len(self.issue_repository.audit_trail), 1)
        self.assertEqual(
            self.issue_repository.audit_trail[1].title,
            "Issue accepted",
        )
        self.assertEqual(self.issue_repository.audit_trail[1].tone, "green")

    async def test_moderate_issue_records_rejected_audit_event(self) -> None:
        issue = await self.issue_repository.create(
            {
                "title": "Moderate me",
                "description": "Needs review",
                "category": "roads",
                "severity": IssueSeverity.MEDIUM.value,
                "latitude": 40.4,
                "longitude": 49.8,
            }
        )

        await self.service.moderate_issue(
            issue.id,
            IssueModerationUpdate(
                moderation_status=IssueModerationStatus.REJECTED,
                moderation_note="Not enough evidence",
            ),
        )

        self.assertEqual(len(self.issue_repository.audit_trail), 1)
        self.assertEqual(
            self.issue_repository.audit_trail[1].title,
            "Issue rejected",
        )
        self.assertEqual(
            self.issue_repository.audit_trail[1].subtitle,
            "Not enough evidence",
        )
        self.assertEqual(self.issue_repository.audit_trail[1].tone, "red")

    async def test_assign_issue_requires_accepted_status(self) -> None:
        issue = await self.issue_repository.create(
            {
                "title": "Assign me",
                "description": "Not accepted yet",
                "category": "roads",
                "severity": IssueSeverity.HIGH.value,
                "latitude": 40.4,
                "longitude": 49.8,
            }
        )
        self.worker_repository.workers[7] = SimpleNamespace(
            id=7,
            status=WorkerStatus.ACTIVE.value,
        )

        with self.assertRaisesRegex(BadRequestError, "Only accepted issues"):
            await self.service.assign_issue(
                issue.id,
                IssueAssignmentUpdate(worker_id=7),
            )

    async def test_upload_issue_images_uploads_and_returns_metadata(self) -> None:
        issue = await self.issue_repository.create(
            {
                "title": "Photo issue",
                "description": "Has photos",
                "category": "roads",
                "severity": IssueSeverity.MEDIUM.value,
                "latitude": 40.4,
                "longitude": 49.8,
                "moderation_status": IssueModerationStatus.ACCEPTED.value,
                "is_public": True,
            }
        )
        files = [
            SimpleNamespace(
                filename="one.jpg",
                content_type="image/jpeg",
                read=lambda: b"image-one",
            ),
            SimpleNamespace(
                filename="two.png",
                content_type="image/png",
                read=lambda: b"image-two",
            ),
        ]

        async def read_one() -> bytes:
            return b"image-one"

        async def read_two() -> bytes:
            return b"image-two"

        files[0].read = read_one
        files[1].read = read_two

        images = await self.service.upload_issue_images(issue.id, files)  # type: ignore[arg-type]

        self.assertEqual(len(images), 2)
        self.assertEqual(len(self.s3_storage.uploaded), 2)
        self.assertTrue(all(image.url.startswith("https://example.test/") for image in images))
        self.assertEqual(len(self.issue_repository.audit_trail), 1)
        self.assertEqual(
            self.issue_repository.audit_trail[1].title,
            "Images uploaded",
        )
        self.assertEqual(
            self.issue_repository.audit_trail[1].subtitle,
            "2 images uploaded",
        )

    async def test_delete_issue_removes_related_s3_objects(self) -> None:
        issue = await self.issue_repository.create(
            {
                "title": "Delete me",
                "description": "Cleanup",
                "category": "roads",
                "severity": IssueSeverity.LOW.value,
                "latitude": 40.4,
                "longitude": 49.8,
            }
        )
        await self.issue_repository.create_image(
            {
                "issue_id": issue.id,
                "bucket_name": self.s3_storage.bucket_name,
                "object_key": "issues/1/images/one.jpg",
                "original_filename": "one.jpg",
                "content_type": "image/jpeg",
                "size_bytes": 10,
            }
        )

        await self.service.delete_issue(issue.id)

        self.assertEqual(self.s3_storage.deleted, ["issues/1/images/one.jpg"])
