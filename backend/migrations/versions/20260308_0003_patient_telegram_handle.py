"""Add telegram handle to patient profiles.

Revision ID: 20260308_0003
Revises: 20260307_0002
Create Date: 2026-03-08 02:30:00
"""

import sqlalchemy as sa
from alembic import op

revision = "20260308_0003"
down_revision = "20260307_0002"
branch_labels = None
depends_on = None


def _has_column(inspector: sa.Inspector, table_name: str, column_name: str) -> bool:
    return any(column["name"] == column_name for column in inspector.get_columns(table_name))


def upgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)

    if not _has_column(inspector, "patient_profiles", "telegram_handle"):
        op.add_column(
            "patient_profiles",
            sa.Column("telegram_handle", sa.String(length=120), nullable=True),
        )


def downgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)

    if _has_column(inspector, "patient_profiles", "telegram_handle"):
        op.drop_column("patient_profiles", "telegram_handle")
