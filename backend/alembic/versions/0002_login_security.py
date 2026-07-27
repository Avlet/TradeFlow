"""add brute-force protection columns to users

Revision ID: 0002
Revises: 0001
Create Date: 2026-01-01 00:00:01.000000
"""
from alembic import op
import sqlalchemy as sa

revision = "0002"
down_revision = "0001"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        "users",
        sa.Column(
            "failed_login_attempts",
            sa.Integer(),
            nullable=False,
            server_default="0",
        ),
    )
    op.add_column("users", sa.Column("locked_until", sa.DateTime(), nullable=True))


def downgrade() -> None:
    with op.batch_alter_table("users") as batch_op:
        batch_op.drop_column("locked_until")
        batch_op.drop_column("failed_login_attempts")