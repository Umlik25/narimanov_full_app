"""add issue details tables and columns

Revision ID: 20260529212000
Revises: 20260529211500
Create Date: 2026-05-29 21:20:00.000000
"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op


revision: str = "20260529212000"
down_revision: str | None = "20260529211500"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)

    if not inspector.has_table("departments"):
        op.create_table(
            "departments",
            sa.Column("id", sa.Integer(), nullable=False),
            sa.Column("name", sa.String(length=255), nullable=False),
            sa.PrimaryKeyConstraint("id", name=op.f("pk_departments")),
        )
        op.create_index(op.f("ix_departments_id"), "departments", ["id"], unique=False)

    existing_issue_columns = {column["name"] for column in inspector.get_columns("issues")}
    if "address" not in existing_issue_columns:
        op.add_column("issues", sa.Column("address", sa.String(length=255), nullable=True))
    if "district" not in existing_issue_columns:
        op.add_column("issues", sa.Column("district", sa.String(length=255), nullable=True))
    if "source" not in existing_issue_columns:
        op.add_column(
            "issues",
            sa.Column(
                "source",
                sa.String(length=50),
                server_default=sa.text("'citizen_report'"),
                nullable=False,
            ),
        )
    if "department_id" not in existing_issue_columns:
        op.add_column("issues", sa.Column("department_id", sa.Integer(), nullable=True))
    if "deadline" not in existing_issue_columns:
        op.add_column(
            "issues",
            sa.Column("deadline", sa.DateTime(timezone=True), nullable=True),
        )

    existing_issue_constraints = {
        constraint["name"] for constraint in inspector.get_check_constraints("issues")
    }
    if op.f("ck_issues_issue_source_valid") not in existing_issue_constraints:
        op.create_check_constraint(
            op.f("ck_issues_issue_source_valid"),
            "issues",
            "source IN ('mobile_report', 'ai_detection', 'inspector_report', "
            "'street_camera', 'citizen_report')",
        )

    if "department_id" not in existing_issue_columns:
        op.create_foreign_key(
            op.f("fk_issues_department_id_departments"),
            "issues",
            "departments",
            ["department_id"],
            ["id"],
            ondelete="SET NULL",
        )
        op.create_index(
            op.f("ix_issues_department_id"),
            "issues",
            ["department_id"],
            unique=False,
        )
    elif op.f("fk_issues_department_id_departments") not in {
        fk["name"] for fk in inspector.get_foreign_keys("issues")
    }:
        op.create_foreign_key(
            op.f("fk_issues_department_id_departments"),
            "issues",
            "departments",
            ["department_id"],
            ["id"],
            ondelete="SET NULL",
        )
        op.create_index(
            op.f("ix_issues_department_id"),
            "issues",
            ["department_id"],
            unique=False,
        )

    if not inspector.has_table("issue_audit_trail"):
        op.create_table(
            "issue_audit_trail",
            sa.Column("id", sa.Integer(), nullable=False),
            sa.Column("issue_id", sa.Integer(), nullable=False),
            sa.Column("title", sa.String(length=255), nullable=False),
            sa.Column("subtitle", sa.Text(), nullable=False),
            sa.Column("actor_role", sa.String(length=100), nullable=False),
            sa.Column("actor_name", sa.String(length=255), nullable=False),
            sa.Column("tone", sa.String(length=20), nullable=True),
            sa.Column(
                "created_at",
                sa.DateTime(timezone=True),
                server_default=sa.text("now()"),
                nullable=False,
            ),
            sa.CheckConstraint(
                "tone IN ('blue', 'green', 'purple', 'orange', 'red')",
                name=op.f("ck_issue_audit_trail_issue_audit_trail_tone_valid"),
            ),
            sa.ForeignKeyConstraint(
                ["issue_id"],
                ["issues.id"],
                name=op.f("fk_issue_audit_trail_issue_id_issues"),
                ondelete="CASCADE",
            ),
            sa.PrimaryKeyConstraint("id", name=op.f("pk_issue_audit_trail")),
        )
        op.create_index(
            op.f("ix_issue_audit_trail_id"),
            "issue_audit_trail",
            ["id"],
            unique=False,
        )
        op.create_index(
            op.f("ix_issue_audit_trail_issue_id"),
            "issue_audit_trail",
            ["issue_id"],
            unique=False,
        )

    existing_image_columns = {column["name"] for column in inspector.get_columns("issue_images")}
    if "is_primary" not in existing_image_columns:
        op.add_column(
            "issue_images",
            sa.Column(
                "is_primary",
                sa.Boolean(),
                server_default=sa.false(),
                nullable=False,
            ),
        )


def downgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)

    if inspector.has_table("issue_audit_trail"):
        op.drop_index(op.f("ix_issue_audit_trail_issue_id"), table_name="issue_audit_trail")
        op.drop_index(op.f("ix_issue_audit_trail_id"), table_name="issue_audit_trail")
        op.drop_table("issue_audit_trail")

    issue_columns = {column["name"] for column in inspector.get_columns("issues")}
    issue_fks = {fk["name"] for fk in inspector.get_foreign_keys("issues")}
    issue_constraints = {
        constraint["name"] for constraint in inspector.get_check_constraints("issues")
    }

    if op.f("fk_issues_department_id_departments") in issue_fks:
        op.drop_constraint(
            op.f("fk_issues_department_id_departments"),
            "issues",
            type_="foreignkey",
        )
    if "department_id" in issue_columns:
        op.drop_index(op.f("ix_issues_department_id"), table_name="issues")
        op.drop_column("issues", "department_id")
    if op.f("ck_issues_issue_source_valid") in issue_constraints:
        op.drop_constraint(
            op.f("ck_issues_issue_source_valid"),
            "issues",
            type_="check",
        )
    if "deadline" in issue_columns:
        op.drop_column("issues", "deadline")
    if "source" in issue_columns:
        op.drop_column("issues", "source")
    if "district" in issue_columns:
        op.drop_column("issues", "district")
    if "address" in issue_columns:
        op.drop_column("issues", "address")

    if inspector.has_table("departments"):
        op.drop_index(op.f("ix_departments_id"), table_name="departments")
        op.drop_table("departments")

    image_columns = {column["name"] for column in inspector.get_columns("issue_images")}
    if "is_primary" in image_columns:
        op.drop_column("issue_images", "is_primary")
