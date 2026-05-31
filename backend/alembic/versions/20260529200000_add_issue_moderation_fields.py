"""add issue moderation fields

Revision ID: 20260529200000
Revises: 20260529193500
Create Date: 2026-05-29 20:00:00.000000
"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op


revision: str = "20260529200000"
down_revision: str | None = "20260529193500"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.add_column(
        "issues",
        sa.Column(
            "category",
            sa.String(length=50),
            server_default="public_space_damage",
            nullable=False,
        ),
    )
    op.add_column(
        "issues",
        sa.Column(
            "moderation_status",
            sa.String(length=30),
            server_default="submitted",
            nullable=False,
        ),
    )
    op.add_column(
        "issues",
        sa.Column("is_public", sa.Boolean(), server_default=sa.false(), nullable=False),
    )
    op.add_column(
        "issues",
        sa.Column("moderation_note", sa.Text(), nullable=True),
    )
    op.add_column(
        "issues",
        sa.Column("duplicate_of_issue_id", sa.Integer(), nullable=True),
    )

    op.create_check_constraint(
        op.f("ck_issues_issue_category_valid"),
        "issues",
        (
            "category IN ('flooding', 'garbage', 'lighting', 'roads', "
            "'water', 'electricity', 'gas', 'public_space_damage', 'emergency')"
        ),
    )
    op.create_check_constraint(
        op.f("ck_issues_issue_moderation_status_valid"),
        "issues",
        (
            "moderation_status IN "
            "('submitted', 'under_review', 'accepted', 'rejected', 'duplicate')"
        ),
    )
    op.create_foreign_key(
        op.f("fk_issues_duplicate_of_issue_id_issues"),
        "issues",
        "issues",
        ["duplicate_of_issue_id"],
        ["id"],
    )


def downgrade() -> None:
    op.drop_constraint(
        op.f("fk_issues_duplicate_of_issue_id_issues"),
        "issues",
        type_="foreignkey",
    )
    op.drop_constraint(
        op.f("ck_issues_issue_moderation_status_valid"),
        "issues",
        type_="check",
    )
    op.drop_constraint(
        op.f("ck_issues_issue_category_valid"),
        "issues",
        type_="check",
    )
    op.drop_column("issues", "duplicate_of_issue_id")
    op.drop_column("issues", "moderation_note")
    op.drop_column("issues", "is_public")
    op.drop_column("issues", "moderation_status")
    op.drop_column("issues", "category")
