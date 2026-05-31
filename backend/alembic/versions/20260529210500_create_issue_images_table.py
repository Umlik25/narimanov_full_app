"""create issue images table

Revision ID: 20260529210500
Revises: 20260529210000
Create Date: 2026-05-29 21:05:00.000000
"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op


revision: str = "20260529210500"
down_revision: str | None = "20260529210000"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    if inspector.has_table("issue_images"):
        return

    op.create_table(
        "issue_images",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("issue_id", sa.Integer(), nullable=False),
        sa.Column("bucket_name", sa.String(length=255), nullable=False),
        sa.Column("object_key", sa.String(length=1024), nullable=False),
        sa.Column("original_filename", sa.String(length=255), nullable=True),
        sa.Column("content_type", sa.String(length=100), nullable=False),
        sa.Column("size_bytes", sa.BigInteger(), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(
            ["issue_id"],
            ["issues.id"],
            name=op.f("fk_issue_images_issue_id_issues"),
            ondelete="CASCADE",
        ),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_issue_images")),
        sa.UniqueConstraint("object_key", name=op.f("uq_issue_images_object_key")),
    )
    op.create_index(op.f("ix_issue_images_id"), "issue_images", ["id"], unique=False)
    op.create_index(
        op.f("ix_issue_images_issue_id"),
        "issue_images",
        ["issue_id"],
        unique=False,
    )


def downgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    if not inspector.has_table("issue_images"):
        return

    op.drop_index(op.f("ix_issue_images_issue_id"), table_name="issue_images")
    op.drop_index(op.f("ix_issue_images_id"), table_name="issue_images")
    op.drop_table("issue_images")
