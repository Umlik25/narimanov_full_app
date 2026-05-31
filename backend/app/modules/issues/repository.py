from __future__ import annotations

from sqlalchemy import delete, func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.modules.issues.models import (
    Department,
    Issue,
    IssueAuditTrail,
    IssueImage,
    IssueModerationStatus,
)


class IssueRepository:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def create(self, issue_data: dict[str, object]) -> Issue:
        issue = Issue(**issue_data)
        self.session.add(issue)
        await self.session.commit()
        await self.session.refresh(issue)
        return issue

    async def create_department(self, department_data: dict[str, object]) -> Department:
        department = Department(**department_data)
        self.session.add(department)
        await self.session.commit()
        await self.session.refresh(department)
        return department

    async def create_audit_trail(
        self,
        audit_trail_data: dict[str, object],
    ) -> IssueAuditTrail:
        audit_trail = IssueAuditTrail(**audit_trail_data)
        self.session.add(audit_trail)
        await self.session.commit()
        await self.session.refresh(audit_trail)
        return audit_trail

    async def get_by_id(self, issue_id: int) -> Issue | None:
        result = await self.session.execute(
            select(Issue).where(Issue.id == issue_id)
        )
        return result.scalar_one_or_none()

    async def get_details_by_id(self, issue_id: int) -> Issue | None:
        result = await self.session.execute(
            select(Issue)
            .options(
                selectinload(Issue.department),
                selectinload(Issue.images),
                selectinload(Issue.audit_trail),
            )
            .where(Issue.id == issue_id)
        )
        return result.scalar_one_or_none()

    async def get_department_by_id(self, department_id: int) -> Department | None:
        result = await self.session.execute(
            select(Department).where(Department.id == department_id)
        )
        return result.scalar_one_or_none()

    async def get_visible_by_id(self, issue_id: int) -> Issue | None:
        result = await self.session.execute(
            select(Issue).where(
                Issue.id == issue_id,
                Issue.moderation_status == IssueModerationStatus.ACCEPTED.value,
                Issue.is_public.is_(True),
            )
        )
        return result.scalar_one_or_none()

    async def create_image(self, image_data: dict[str, object]) -> IssueImage:
        image = IssueImage(**image_data)
        self.session.add(image)
        await self.session.commit()
        await self.session.refresh(image)
        return image

    async def get_image(self, issue_id: int, image_id: int) -> IssueImage | None:
        result = await self.session.execute(
            select(IssueImage).where(
                IssueImage.id == image_id,
                IssueImage.issue_id == issue_id,
            )
        )
        return result.scalar_one_or_none()

    async def list_images(self, issue_id: int) -> list[IssueImage]:
        result = await self.session.execute(
            select(IssueImage)
            .where(IssueImage.issue_id == issue_id)
            .order_by(
                IssueImage.is_primary.desc(),
                IssueImage.created_at.asc(),
                IssueImage.id.asc(),
            )
        )
        return list(result.scalars().all())

    async def list_audit_trail(self, issue_id: int) -> list[IssueAuditTrail]:
        result = await self.session.execute(
            select(IssueAuditTrail)
            .where(IssueAuditTrail.issue_id == issue_id)
            .order_by(IssueAuditTrail.created_at.asc(), IssueAuditTrail.id.asc())
        )
        return list(result.scalars().all())

    async def delete_image(self, issue_id: int, image_id: int) -> IssueImage | None:
        image = await self.get_image(issue_id, image_id)
        if image is None:
            return None

        await self.session.delete(image)
        await self.session.commit()
        return image

    async def list(self, limit: int, offset: int) -> tuple[list[Issue], int]:
        filters = (
            Issue.moderation_status == IssueModerationStatus.ACCEPTED.value,
            Issue.is_public.is_(True),
        )

        total_result = await self.session.execute(
            select(func.count()).select_from(Issue).where(*filters)
        )
        total = total_result.scalar_one()

        result = await self.session.execute(
            select(Issue)
            .where(*filters)
            .order_by(Issue.created_at.desc(), Issue.id.desc())
            .limit(limit)
            .offset(offset)
        )
        return list(result.scalars().all()), total

    async def list_for_moderation(
        self,
        limit: int,
        offset: int,
        moderation_status: IssueModerationStatus | None = None,
    ) -> tuple[list[Issue], int]:
        filters = []
        if moderation_status is not None:
            filters.append(Issue.moderation_status == moderation_status.value)

        total_result = await self.session.execute(
            select(func.count()).select_from(Issue).where(*filters)
        )
        total = total_result.scalar_one()

        result = await self.session.execute(
            select(Issue)
            .where(*filters)
            .order_by(Issue.created_at.asc(), Issue.id.asc())
            .limit(limit)
            .offset(offset)
        )
        return list(result.scalars().all()), total

    async def list_assigned_to_worker(
        self,
        worker_id: int,
        limit: int,
        offset: int,
    ) -> tuple[list[Issue], int]:
        filters = (Issue.assigned_worker_id == worker_id,)

        total_result = await self.session.execute(
            select(func.count()).select_from(Issue).where(*filters)
        )
        total = total_result.scalar_one()

        result = await self.session.execute(
            select(Issue)
            .where(*filters)
            .order_by(Issue.created_at.desc(), Issue.id.desc())
            .limit(limit)
            .offset(offset)
        )
        return list(result.scalars().all()), total

    async def list_in_window(
        self,
        min_latitude: float,
        min_longitude: float,
        max_latitude: float,
        max_longitude: float,
    ) -> list[Issue]:
        filters = (
            Issue.latitude >= min_latitude,
            Issue.latitude <= max_latitude,
            Issue.longitude >= min_longitude,
            Issue.longitude <= max_longitude,
            Issue.moderation_status == IssueModerationStatus.ACCEPTED.value,
            Issue.is_public.is_(True),
        )

        result = await self.session.execute(
            select(Issue)
            .where(*filters)
            .order_by(Issue.created_at.desc(), Issue.id.desc())
        )
        return list(result.scalars().all())

    async def update(self, issue: Issue, issue_data: dict[str, object]) -> Issue:
        for field, value in issue_data.items():
            setattr(issue, field, value)

        await self.session.commit()
        await self.session.refresh(issue)
        return issue

    async def delete(self, issue_id: int) -> bool:
        result = await self.session.execute(delete(Issue).where(Issue.id == issue_id))
        await self.session.commit()
        return result.rowcount > 0
