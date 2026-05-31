"""add issue severity

Revision ID: 20260529211500
Revises: 20260529210500
Create Date: 2026-05-29 21:15:00.000000
"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op


revision: str = "20260529211500"
down_revision: str | None = "20260529210500"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    existing_columns = {column["name"] for column in inspector.get_columns("issues")}
    if "severity" in existing_columns:
        return

    op.add_column(
        "issues",
        sa.Column(
            "severity",
            sa.String(length=20),
            server_default="medium",
            nullable=False,
        ),
    )
    op.create_check_constraint(
        op.f("ck_issues_issue_severity_valid"),
        "issues",
        "severity IN ('low', 'medium', 'high', 'critical')",
    )


def downgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    existing_columns = {column["name"] for column in inspector.get_columns("issues")}
    if "severity" not in existing_columns:
        return

    op.drop_constraint(
        op.f("ck_issues_issue_severity_valid"),
        "issues",
        type_="check",
    )
    op.drop_column("issues", "severity")
