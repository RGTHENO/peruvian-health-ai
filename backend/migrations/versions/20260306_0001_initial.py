"""Initial schema.

Revision ID: 20260306_0001
Revises:
Create Date: 2026-03-06 20:00:00
"""

import sqlalchemy as sa
from alembic import op

revision = "20260306_0001"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    user_role = sa.Enum("patient", "doctor", "admin", name="user_role")
    appointment_type = sa.Enum("presencial", "telemedicina", name="appointment_type")
    appointment_status = sa.Enum(
        "confirmada", "en-espera", "cancelada", "completada", name="appointment_status"
    )
    encounter_kind = sa.Enum("consultation", "lab", "surgery", name="encounter_kind")
    notification_type = sa.Enum(
        "appointment", "reminder", "cancellation", "system", name="notification_type"
    )

    bind = op.get_bind()
    user_role.create(bind, checkfirst=True)
    appointment_type.create(bind, checkfirst=True)
    appointment_status.create(bind, checkfirst=True)
    encounter_kind.create(bind, checkfirst=True)
    notification_type.create(bind, checkfirst=True)

    op.create_table(
        "users",
        sa.Column("id", sa.String(length=36), primary_key=True),
        sa.Column("email", sa.String(length=255), nullable=False),
        sa.Column("full_name", sa.String(length=255), nullable=False),
        sa.Column("role", user_role, nullable=False),
        sa.Column("password_hash", sa.String(length=255), nullable=False),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column("notification_preferences", sa.JSON(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index("ix_users_email", "users", ["email"], unique=True)

    op.create_table(
        "doctor_profiles",
        sa.Column("id", sa.String(length=36), primary_key=True),
        sa.Column("user_id", sa.String(length=36), nullable=True),
        sa.Column("name", sa.String(length=255), nullable=False),
        sa.Column("specialty", sa.String(length=120), nullable=False),
        sa.Column("rating", sa.Float(), nullable=False),
        sa.Column("reviews", sa.Integer(), nullable=False),
        sa.Column("price", sa.Integer(), nullable=False),
        sa.Column("location", sa.String(length=255), nullable=False),
        sa.Column("distance", sa.String(length=50), nullable=False),
        sa.Column("available", sa.Boolean(), nullable=False),
        sa.Column("modalities", sa.JSON(), nullable=False),
        sa.Column("insurances", sa.JSON(), nullable=False),
        sa.Column("languages", sa.JSON(), nullable=False),
        sa.Column("bio", sa.String(length=2000), nullable=False),
        sa.Column("experience", sa.Integer(), nullable=False),
        sa.Column("phone", sa.String(length=50), nullable=False),
        sa.Column("avatar", sa.String(length=500), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"]),
        sa.UniqueConstraint("user_id"),
    )
    op.create_index("ix_doctor_profiles_name", "doctor_profiles", ["name"], unique=False)
    op.create_index("ix_doctor_profiles_specialty", "doctor_profiles", ["specialty"], unique=False)

    op.create_table(
        "patient_profiles",
        sa.Column("id", sa.String(length=36), primary_key=True),
        sa.Column("user_id", sa.String(length=36), nullable=True),
        sa.Column("name", sa.String(length=255), nullable=False),
        sa.Column("age", sa.Integer(), nullable=False),
        sa.Column("gender", sa.String(length=1), nullable=False),
        sa.Column("phone", sa.String(length=50), nullable=False),
        sa.Column("email", sa.String(length=255), nullable=False),
        sa.Column("insurance", sa.String(length=120), nullable=False),
        sa.Column("last_visit", sa.String(length=20), nullable=True),
        sa.Column("avatar", sa.String(length=500), nullable=False),
        sa.Column("blood_type", sa.String(length=10), nullable=True),
        sa.Column("conditions", sa.JSON(), nullable=False),
        sa.Column("allergies", sa.JSON(), nullable=False),
        sa.Column("emergency_contact_name", sa.String(length=255), nullable=True),
        sa.Column("emergency_contact_phone", sa.String(length=50), nullable=True),
        sa.Column("emergency_contact_relationship", sa.String(length=120), nullable=True),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"]),
        sa.UniqueConstraint("user_id"),
    )
    op.create_index("ix_patient_profiles_name", "patient_profiles", ["name"], unique=False)
    op.create_index(
        "ix_patient_profiles_insurance", "patient_profiles", ["insurance"], unique=False
    )

    op.create_table(
        "appointments",
        sa.Column("id", sa.String(length=36), primary_key=True),
        sa.Column("doctor_id", sa.String(length=36), nullable=False),
        sa.Column("patient_id", sa.String(length=36), nullable=False),
        sa.Column("date", sa.Date(), nullable=False),
        sa.Column("time", sa.Time(), nullable=False),
        sa.Column("duration", sa.Integer(), nullable=False),
        sa.Column("type", appointment_type, nullable=False),
        sa.Column("status", appointment_status, nullable=False),
        sa.Column("reason", sa.String(length=500), nullable=False),
        sa.Column("notes", sa.String(length=1000), nullable=True),
        sa.ForeignKeyConstraint(["doctor_id"], ["doctor_profiles.id"]),
        sa.ForeignKeyConstraint(["patient_id"], ["patient_profiles.id"]),
    )
    op.create_index("ix_appointments_doctor_id", "appointments", ["doctor_id"], unique=False)
    op.create_index("ix_appointments_patient_id", "appointments", ["patient_id"], unique=False)
    op.create_index("ix_appointments_date", "appointments", ["date"], unique=False)

    op.create_table(
        "encounters",
        sa.Column("id", sa.String(length=36), primary_key=True),
        sa.Column("patient_id", sa.String(length=36), nullable=False),
        sa.Column("doctor_id", sa.String(length=36), nullable=True),
        sa.Column("appointment_id", sa.String(length=36), nullable=True),
        sa.Column("kind", encounter_kind, nullable=False),
        sa.Column("occurred_on", sa.Date(), nullable=False),
        sa.Column("actor_name", sa.String(length=255), nullable=False),
        sa.Column("specialty", sa.String(length=120), nullable=True),
        sa.Column("payload", sa.JSON(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["appointment_id"], ["appointments.id"]),
        sa.ForeignKeyConstraint(["doctor_id"], ["doctor_profiles.id"]),
        sa.ForeignKeyConstraint(["patient_id"], ["patient_profiles.id"]),
    )
    op.create_index("ix_encounters_patient_id", "encounters", ["patient_id"], unique=False)
    op.create_index("ix_encounters_kind", "encounters", ["kind"], unique=False)
    op.create_index("ix_encounters_occurred_on", "encounters", ["occurred_on"], unique=False)

    op.create_table(
        "refresh_tokens",
        sa.Column("id", sa.String(length=36), primary_key=True),
        sa.Column("user_id", sa.String(length=36), nullable=False),
        sa.Column("expires_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("revoked_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"]),
    )
    op.create_index("ix_refresh_tokens_user_id", "refresh_tokens", ["user_id"], unique=False)

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
    op.create_index("ix_notifications_user_id", "notifications", ["user_id"], unique=False)
    op.create_index("ix_notifications_type", "notifications", ["type"], unique=False)


def downgrade() -> None:
    op.drop_index("ix_notifications_type", table_name="notifications")
    op.drop_index("ix_notifications_user_id", table_name="notifications")
    op.drop_table("notifications")

    op.drop_index("ix_refresh_tokens_user_id", table_name="refresh_tokens")
    op.drop_table("refresh_tokens")

    op.drop_index("ix_encounters_occurred_on", table_name="encounters")
    op.drop_index("ix_encounters_kind", table_name="encounters")
    op.drop_index("ix_encounters_patient_id", table_name="encounters")
    op.drop_table("encounters")

    op.drop_index("ix_appointments_date", table_name="appointments")
    op.drop_index("ix_appointments_patient_id", table_name="appointments")
    op.drop_index("ix_appointments_doctor_id", table_name="appointments")
    op.drop_table("appointments")

    op.drop_index("ix_patient_profiles_insurance", table_name="patient_profiles")
    op.drop_index("ix_patient_profiles_name", table_name="patient_profiles")
    op.drop_table("patient_profiles")

    op.drop_index("ix_doctor_profiles_specialty", table_name="doctor_profiles")
    op.drop_index("ix_doctor_profiles_name", table_name="doctor_profiles")
    op.drop_table("doctor_profiles")

    op.drop_index("ix_users_email", table_name="users")
    op.drop_table("users")

    bind = op.get_bind()
    sa.Enum(name="encounter_kind").drop(bind, checkfirst=True)
    sa.Enum(name="appointment_status").drop(bind, checkfirst=True)
    sa.Enum(name="appointment_type").drop(bind, checkfirst=True)
    sa.Enum(name="notification_type").drop(bind, checkfirst=True)
    sa.Enum(name="user_role").drop(bind, checkfirst=True)
