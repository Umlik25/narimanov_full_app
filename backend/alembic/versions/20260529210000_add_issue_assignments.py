"""add issue assignments

Revision ID: 20260529210000
Revises: 20260529200000, 20260529203000
Create Date: 2026-05-29 21:00:00.000000
"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op


revision: str = "20260529210000"
down_revision: str | tuple[str, str] | None = (
    "20260529200000",
    "20260529203000",
)
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.add_column(
        "issues",
        sa.Column("assigned_worker_id", sa.Integer(), nullable=True),
    )
    op.create_foreign_key(
        op.f("fk_issues_assigned_worker_id_workers"),
        "issues",
        "workers",
        ["assigned_worker_id"],
        ["id"],
    )
    op.create_index(
        op.f("ix_issues_assigned_worker_id"),
        "issues",
        ["assigned_worker_id"],
        unique=False,
    )


def downgrade() -> None:
    op.drop_index(op.f("ix_issues_assigned_worker_id"), table_name="issues")
    op.drop_constraint(
        op.f("fk_issues_assigned_worker_id_workers"),
        "issues",
        type_="foreignkey",
    )
    op.drop_column("issues", "assigned_worker_id")
