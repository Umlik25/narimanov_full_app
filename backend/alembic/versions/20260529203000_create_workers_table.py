"""create workers table

Revision ID: 20260529203000
Revises: 20260529193500
Create Date: 2026-05-29 20:30:00.000000
"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op


revision: str = "20260529203000"
down_revision: str | None = "20260529193500"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "workers",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("full_name", sa.String(length=255), nullable=False),
        sa.Column("phone_number", sa.String(length=50), nullable=True),
        sa.Column("role", sa.String(length=100), nullable=True),
        sa.Column("status", sa.String(length=20), server_default="active", nullable=False),
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
            "status IN ('active', 'inactive')",
            name=op.f("ck_workers_worker_status_valid"),
        ),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_workers")),
    )
    op.create_index(op.f("ix_workers_id"), "workers", ["id"], unique=False)


def downgrade() -> None:
    op.drop_index(op.f("ix_workers_id"), table_name="workers")
    op.drop_table("workers")
