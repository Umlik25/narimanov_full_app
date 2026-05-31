"""seed default departments

Revision ID: 20260529213000
Revises: 20260529212000
Create Date: 2026-05-29 21:30:00.000000
"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op


revision: str = "20260529213000"
down_revision: str | None = "20260529212000"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


departments_table = sa.table(
    "departments",
    sa.column("id", sa.Integer()),
    sa.column("name", sa.String()),
)


def upgrade() -> None:
    op.execute(
        sa.text(
            """
            INSERT INTO departments (id, name)
            VALUES
                (1, 'Road Maintenance'),
                (2, 'Street Lighting'),
                (3, 'Waste Management'),
                (4, 'Water Services'),
                (5, 'Public Safety')
            ON CONFLICT (id) DO NOTHING
            """
        )
    )


def downgrade() -> None:
    op.execute(
        departments_table.delete().where(
            departments_table.c.id.in_([1, 2, 3, 4, 5])
        )
    )
