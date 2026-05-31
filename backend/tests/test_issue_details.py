from datetime import UTC, datetime
from types import SimpleNamespace
from unittest import TestCase

from fastapi.testclient import TestClient

from app.main import app
from app.modules.issues.router import get_issue_service
from app.modules.issues.service import IssueService


class FakeIssueRepository:
    def __init__(self) -> None:
        self.issues: dict[int, SimpleNamespace] = {}

    async def create(self, issue_data: dict[str, object]) -> SimpleNamespace:
        issue = SimpleNamespace(
            id=len(self.issues) + 1,
            title=issue_data["title"],
            description=issue_data["description"],
            category=issue_data["category"],
            severity=issue_data["severity"],
            latitude=issue_data["latitude"],
            longitude=issue_data["longitude"],
            status=issue_data["status"],
            moderation_status="submitted",
            is_public=False,
            moderation_note=None,
            duplicate_of_issue_id=None,
            assigned_worker_id=None,
            created_at=datetime(2026, 5, 30, 12, 0, tzinfo=UTC),
            updated_at=datetime(2026, 5, 30, 12, 0, tzinfo=UTC),
        )
        self.issues[issue.id] = issue
        return issue

    async def get_by_id(self, issue_id: int) -> SimpleNamespace | None:
        return self.issues.get(issue_id)

    async def get_details_by_id(self, issue_id: int) -> SimpleNamespace | None:
        return self.issues.get(issue_id)

    async def get_department_by_id(self, department_id: int) -> None:
        return None


class FakeWorkerRepository:
    async def get_by_id(self, worker_id: int) -> SimpleNamespace | None:
        return None


class FakeS3Storage:
    def create_presigned_get_url(self, object_key: str) -> str:
        return f"https://example.test/{object_key}"


class IssueDetailsApiTests(TestCase):
    def setUp(self) -> None:
        self.issue_repository = FakeIssueRepository()
        self.worker_repository = FakeWorkerRepository()
        self.s3_storage = FakeS3Storage()
        self.service = IssueService(
            repository=self.issue_repository,
            worker_repository=self.worker_repository,
            s3_storage=self.s3_storage,
        )
        app.dependency_overrides[get_issue_service] = lambda: self.service
        self.client = TestClient(app)

    def tearDown(self) -> None:
        self.client.close()
        app.dependency_overrides.clear()

    def test_get_issue_details_returns_expected_payload(self) -> None:
        department = SimpleNamespace(id=3, name="Road Maintenance")
        issue = SimpleNamespace(
            id=11,
            title="Broken streetlight",
            description="The lamp near the park is out",
            category="lighting",
            severity="medium",
            latitude=40.4,
            longitude=49.8,
            status="open",
            moderation_status="accepted",
            is_public=True,
            moderation_note=None,
            duplicate_of_issue_id=None,
            assigned_worker_id=None,
            created_at=datetime(2026, 5, 30, 12, 0, tzinfo=UTC),
            updated_at=datetime(2026, 5, 30, 12, 5, tzinfo=UTC),
            address="56 Park Ave",
            district="Narimanov",
            source="citizen_report",
            department=department,
            deadline=datetime(2026, 6, 2, 12, 0, tzinfo=UTC),
            images=[
                SimpleNamespace(
                    id=91,
                    issue_id=11,
                    is_primary=True,
                    bucket_name="issue-images",
                    object_key="issues/11/images/primary.jpg",
                    original_filename="primary.jpg",
                    content_type="image/jpeg",
                    size_bytes=100,
                    created_at=datetime(2026, 5, 30, 12, 1, tzinfo=UTC),
                )
            ],
            audit_trail=[
                SimpleNamespace(
                    id=201,
                    issue_id=11,
                    title="Accepted",
                    subtitle="Moderation approved the report",
                    actor_role="moderator",
                    actor_name="Aysel",
                    tone="green",
                    created_at=datetime(2026, 5, 30, 12, 2, tzinfo=UTC),
                )
            ],
        )
        self.issue_repository.issues[issue.id] = issue

        response = self.client.get("/issues/11/details")

        assert response.status_code == 200
        payload = response.json()
        assert payload["id"] == 11
        assert payload["title"] == "Broken streetlight"
        assert payload["address"] == "56 Park Ave"
        assert payload["district"] == "Narimanov"
        assert payload["source"] == "citizen_report"
        assert payload["department"] == {"id": 3, "name": "Road Maintenance"}
        assert payload["deadline"] == "2026-06-02T12:00:00Z"
        assert payload["images"] == [
            {
                "id": 91,
                "url": "https://example.test/issues/11/images/primary.jpg",
                "is_primary": True,
            }
        ]
        assert payload["audit_trail"] == [
            {
                "id": 201,
                "title": "Accepted",
                "subtitle": "Moderation approved the report",
                "actor_role": "moderator",
                "actor_name": "Aysel",
                "created_at": "2026-05-30T12:02:00Z",
                "tone": "green",
            }
        ]

    def test_get_issue_details_returns_empty_related_lists(self) -> None:
        issue = SimpleNamespace(
            id=12,
            title="Bare issue",
            description="No related data",
            category="roads",
            severity="medium",
            latitude=40.4,
            longitude=49.8,
            status="open",
            moderation_status="submitted",
            is_public=False,
            moderation_note=None,
            duplicate_of_issue_id=None,
            assigned_worker_id=None,
            created_at=datetime(2026, 5, 30, 12, 0, tzinfo=UTC),
            updated_at=datetime(2026, 5, 30, 12, 0, tzinfo=UTC),
            address=None,
            district=None,
            source="citizen_report",
            department=None,
            deadline=None,
            images=[],
            audit_trail=[],
        )
        self.issue_repository.issues[issue.id] = issue

        response = self.client.get("/issues/12/details")

        assert response.status_code == 200
        payload = response.json()
        assert payload["images"] == []
        assert payload["audit_trail"] == []
        assert payload["department"] is None

    def test_get_issue_details_returns_404_for_missing_issue(self) -> None:
        response = self.client.get("/issues/404/details")

        assert response.status_code == 404
        assert response.json() == {"detail": "Issue 404 not found"}

    def test_create_issue_rejects_unknown_request_fields(self) -> None:
        response = self.client.post(
            "/issues",
            json={
                "title": "Collapsed road near the school",
                "description": "Large pothole and broken asphalt after recent rain.",
                "category": "roads",
                "severity": "high",
                "latitude": 40.4051,
                "longitude": 49.8562,
                "deadline_at": "2026-06-05T12:00:00Z",
            },
        )

        assert response.status_code == 422
        payload = response.json()
        assert payload["detail"][0]["type"] == "extra_forbidden"
        assert payload["detail"][0]["loc"] == ["body", "deadline_at"]

    def test_update_issue_rejects_unknown_request_fields(self) -> None:
        self.issue_repository.issues[1] = SimpleNamespace(
            id=1,
            title="Existing issue",
            description="Existing description",
            category="roads",
            severity="medium",
            latitude=40.4,
            longitude=49.8,
            status="open",
            moderation_status="submitted",
            is_public=False,
            moderation_note=None,
            duplicate_of_issue_id=None,
            assigned_worker_id=None,
            created_at=datetime(2026, 5, 30, 12, 0, tzinfo=UTC),
            updated_at=datetime(2026, 5, 30, 12, 0, tzinfo=UTC),
        )

        response = self.client.patch(
            "/issues/1",
            json={"dead_line": "2026-06-05T12:00:00Z"},
        )

        assert response.status_code == 422
        payload = response.json()
        assert payload["detail"][0]["type"] == "extra_forbidden"
        assert payload["detail"][0]["loc"] == ["body", "dead_line"]
