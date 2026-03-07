"""Add doctor settings and notifications.

Revision ID: 20260307_0002
Revises: 20260306_0001
Create Date: 2026-03-07 08:00:00
"""

import sqlalchemy as sa
from alembic import op

revision = "20260307_0002"
down_revision = "20260306_0001"
branch_labels = None
depends_on = None


def _has_column(inspector: sa.Inspector, table_name: str, column_name: str) -> bool:
    return any(column["name"] == column_name for column in inspector.get_columns(table_name))


def _has_index(inspector: sa.Inspector, table_name: str, index_name: str) -> bool:
    return any(index["name"] == index_name for index in inspector.get_indexes(table_name))


def _has_table(inspector: sa.Inspector, table_name: str) -> bool:
    return table_name in inspector.get_table_names()


def upgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)

    if not _has_column(inspector, "users", "notification_preferences"):
        op.add_column(
            "users",
            sa.Column(
                "notification_preferences",
                sa.JSON(),
                nullable=False,
                server_default=sa.text(
                    '\'{"new_appointment": true, "reminder": true, "cancellation": true, "marketing": false}\''
                ),
            ),
        )
        op.alter_column("users", "notification_preferences", server_default=None)

    if not _has_column(inspector, "doctor_profiles", "phone"):
        op.add_column(
            "doctor_profiles",
            sa.Column("phone", sa.String(length=50), nullable=False, server_default=""),
        )
        op.alter_column("doctor_profiles", "phone", server_default=None)

    inspector = sa.inspect(bind)
    if not _has_table(inspector, "notifications"):
        notification_type = sa.Enum(
            "appointment", "reminder", "cancellation", "system", name="notification_type"
        )
        notification_type.create(bind, checkfirst=True)
        op.create_table(
            "notifications",
            sa.Column("id", sa.String(length=36), primary_key=True),
            sa.Column("user_id", sa.String(length=36), nullable=False),
            sa.Column("type", notification_type, nullable=False),
            sa.Column("title", sa.String(length=255), nullable=False),
            sa.Column("message", sa.String(length=1000), nullable=False),
            sa.Column("link", sa.String(length=500), nullable=True),
            sa.Column("read", sa.Boolean(), nullable=False, server_default=sa.false()),
            sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
            sa.ForeignKeyConstraint(["user_id"], ["users.id"]),
        )

    inspector = sa.inspect(bind)
    if _has_table(inspector, "notifications") and not _has_index(
        inspector, "notifications", "ix_notifications_user_id"
    ):
        op.create_index("ix_notifications_user_id", "notifications", ["user_id"], unique=False)

    inspector = sa.inspect(bind)
    if _has_table(inspector, "notifications") and not _has_index(
        inspector, "notifications", "ix_notifications_type"
    ):
        op.create_index("ix_notifications_type", "notifications", ["type"], unique=False)


def downgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)

    if _has_table(inspector, "notifications"):
        if _has_index(inspector, "notifications", "ix_notifications_type"):
            op.drop_index("ix_notifications_type", table_name="notifications")
        inspector = sa.inspect(bind)
        if _has_index(inspector, "notifications", "ix_notifications_user_id"):
            op.drop_index("ix_notifications_user_id", table_name="notifications")
        op.drop_table("notifications")

    inspector = sa.inspect(bind)
    if _has_column(inspector, "doctor_profiles", "phone"):
        op.drop_column("doctor_profiles", "phone")

    inspector = sa.inspect(bind)
    if _has_column(inspector, "users", "notification_preferences"):
        op.drop_column("users", "notification_preferences")

    sa.Enum(name="notification_type").drop(bind, checkfirst=True)
