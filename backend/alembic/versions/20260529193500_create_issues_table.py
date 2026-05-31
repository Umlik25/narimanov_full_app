"""create issues table

Revision ID: 20260529193500
Revises:
Create Date: 2026-05-29 19:35:00.000000
"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op


revision: str = "20260529193500"
down_revision: str | None = None
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "issues",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("title", sa.String(length=255), nullable=False),
        sa.Column("description", sa.Text(), nullable=False),
        sa.Column("latitude", sa.Float(), nullable=False),
        sa.Column("longitude", sa.Float(), nullable=False),
        sa.Column("status", sa.String(length=20), server_default="open", nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.CheckConstraint(
            "status IN ('open', 'assigned', 'resolved')",
            name=op.f("ck_issues_issue_status_valid"),
        ),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_issues")),
    )
    op.create_index(op.f("ix_issues_id"), "issues", ["id"], unique=False)


def downgrade() -> None:
    op.drop_index(op.f("ix_issues_id"), table_name="issues")
    op.drop_table("issues")
