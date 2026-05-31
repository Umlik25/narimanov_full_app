"""add issue in progress status

Revision ID: 20260531010000
Revises: 20260529213000
Create Date: 2026-05-31 01:00:00.000000
"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op


revision: str = "20260531010000"
down_revision: str | None = "20260529213000"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.drop_constraint(
        op.f("ck_issues_issue_status_valid"),
        "issues",
        type_="check",
    )
    op.create_check_constraint(
        op.f("ck_issues_issue_status_valid"),
        "issues",
        "status IN ('open', 'assigned', 'in_progress', 'resolved')",
    )


def downgrade() -> None:
    op.execute(
        sa.text("UPDATE issues SET status = 'assigned' WHERE status = 'in_progress'")
    )
    op.drop_constraint(
        op.f("ck_issues_issue_status_valid"),
        "issues",
        type_="check",
    )
    op.create_check_constraint(
        op.f("ck_issues_issue_status_valid"),
        "issues",
        "status IN ('open', 'assigned', 'resolved')",
    )
