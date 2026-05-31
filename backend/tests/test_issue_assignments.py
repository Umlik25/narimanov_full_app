from types import SimpleNamespace
from unittest import IsolatedAsyncioTestCase

from app.core.exceptions import BadRequestError, NotFoundError
from app.modules.issues.models import IssueModerationStatus, IssueStatus
from app.modules.issues.schemas import IssueAssignmentUpdate
from app.modules.issues.service import IssueService
from app.modules.workers.models import WorkerStatus


class FakeIssueRepository:
    def __init__(self) -> None:
        self.issues: dict[int, SimpleNamespace] = {}
        self.audit_trail: list[dict[str, object]] = []
        self.assigned_result: tuple[list[SimpleNamespace], int] = ([], 0)

    async def get_by_id(self, issue_id: int) -> SimpleNamespace | None:
        return self.issues.get(issue_id)

    async def update(
        self,
        issue: SimpleNamespace,
        issue_data: dict[str, object],
    ) -> SimpleNamespace:
        for field, value in issue_data.items():
            setattr(issue, field, value)
        return issue

    async def list_assigned_to_worker(
        self,
        worker_id: int,
        limit: int,
        offset: int,
    ) -> tuple[list[SimpleNamespace], int]:
        return self.assigned_result

    async def create_audit_trail(
        self,
        audit_trail_data: dict[str, object],
    ) -> SimpleNamespace:
        self.audit_trail.append(audit_trail_data)
        return SimpleNamespace(id=len(self.audit_trail), **audit_trail_data)


class FakeWorkerRepository:
    def __init__(self) -> None:
        self.workers: dict[int, SimpleNamespace] = {}

    async def get_by_id(self, worker_id: int) -> SimpleNamespace | None:
        return self.workers.get(worker_id)


class IssueAssignmentTests(IsolatedAsyncioTestCase):
    def setUp(self) -> None:
        self.issue_repository = FakeIssueRepository()
        self.worker_repository = FakeWorkerRepository()
        self.service = IssueService(
            repository=self.issue_repository,
            worker_repository=self.worker_repository,
        )

    async def test_assign_issue_to_active_worker(self) -> None:
        issue = self._issue(moderation_status=IssueModerationStatus.ACCEPTED.value)
        worker = self._worker(status=WorkerStatus.ACTIVE.value)
        self.issue_repository.issues[issue.id] = issue
        self.worker_repository.workers[worker.id] = worker

        assigned_issue = await self.service.assign_issue(
            issue_id=issue.id,
            payload=IssueAssignmentUpdate(worker_id=worker.id),
        )

        self.assertEqual(assigned_issue.assigned_worker_id, worker.id)
        self.assertEqual(assigned_issue.status, IssueStatus.ASSIGNED.value)
        self.assertEqual(len(self.issue_repository.audit_trail), 1)
        self.assertEqual(
            self.issue_repository.audit_trail[0]["title"],
            "Issue assigned",
        )

    async def test_assign_issue_requires_accepted_issue(self) -> None:
        issue = self._issue(moderation_status=IssueModerationStatus.SUBMITTED.value)
        worker = self._worker(status=WorkerStatus.ACTIVE.value)
        self.issue_repository.issues[issue.id] = issue
        self.worker_repository.workers[worker.id] = worker

        with self.assertRaisesRegex(BadRequestError, "Only accepted issues"):
            await self.service.assign_issue(
                issue_id=issue.id,
                payload=IssueAssignmentUpdate(worker_id=worker.id),
            )

    async def test_assign_issue_requires_existing_worker(self) -> None:
        issue = self._issue(moderation_status=IssueModerationStatus.ACCEPTED.value)
        self.issue_repository.issues[issue.id] = issue

        with self.assertRaisesRegex(NotFoundError, "Worker 99 not found"):
            await self.service.assign_issue(
                issue_id=issue.id,
                payload=IssueAssignmentUpdate(worker_id=99),
            )

    async def test_assign_issue_requires_active_worker(self) -> None:
        issue = self._issue(moderation_status=IssueModerationStatus.ACCEPTED.value)
        worker = self._worker(status=WorkerStatus.INACTIVE.value)
        self.issue_repository.issues[issue.id] = issue
        self.worker_repository.workers[worker.id] = worker

        with self.assertRaisesRegex(BadRequestError, "Only active workers"):
            await self.service.assign_issue(
                issue_id=issue.id,
                payload=IssueAssignmentUpdate(worker_id=worker.id),
            )

    async def test_unassign_issue_clears_worker_and_reopens_assigned_issue(self) -> None:
        issue = self._issue(
            moderation_status=IssueModerationStatus.ACCEPTED.value,
            status=IssueStatus.ASSIGNED.value,
            assigned_worker_id=7,
        )
        self.issue_repository.issues[issue.id] = issue

        unassigned_issue = await self.service.unassign_issue(issue.id)

        self.assertIsNone(unassigned_issue.assigned_worker_id)
        self.assertEqual(unassigned_issue.status, IssueStatus.OPEN.value)
        self.assertEqual(len(self.issue_repository.audit_trail), 1)
        self.assertEqual(
            self.issue_repository.audit_trail[0]["title"],
            "Assignment removed",
        )

    async def test_list_assigned_issues_requires_existing_worker(self) -> None:
        with self.assertRaisesRegex(NotFoundError, "Worker 42 not found"):
            await self.service.list_issues_assigned_to_worker(
                worker_id=42,
                limit=20,
                offset=0,
            )

    async def test_list_assigned_issues_returns_repository_result(self) -> None:
        worker = self._worker(status=WorkerStatus.ACTIVE.value)
        issue = self._issue(
            moderation_status=IssueModerationStatus.ACCEPTED.value,
            status=IssueStatus.ASSIGNED.value,
            assigned_worker_id=worker.id,
        )
        self.worker_repository.workers[worker.id] = worker
        self.issue_repository.assigned_result = ([issue], 1)

        issues, total = await self.service.list_issues_assigned_to_worker(
            worker_id=worker.id,
            limit=20,
            offset=0,
        )

        self.assertEqual(issues, [issue])
        self.assertEqual(total, 1)

    def _issue(
        self,
        moderation_status: str,
        status: str = IssueStatus.OPEN.value,
        assigned_worker_id: int | None = None,
    ) -> SimpleNamespace:
        return SimpleNamespace(
            id=1,
            moderation_status=moderation_status,
            status=status,
            assigned_worker_id=assigned_worker_id,
        )

    def _worker(self, status: str) -> SimpleNamespace:
        return SimpleNamespace(id=7, full_name="Aysel Mammadova", status=status)
