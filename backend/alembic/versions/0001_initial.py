"""initial schema

Revision ID: 0001
Revises:
Create Date: 2026-01-01 00:00:00.000000
"""
from alembic import op
import sqlalchemy as sa

revision = "0001"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "users",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("username", sa.String(), nullable=False),
        sa.Column("email", sa.String(), nullable=False),
        sa.Column("hashed_password", sa.String(), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_users_id", "users", ["id"])
    op.create_index("ix_users_username", "users", ["username"], unique=True)
    op.create_index("ix_users_email", "users", ["email"], unique=True)

    op.create_table(
        "trades",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("symbol", sa.String(), nullable=False),
        sa.Column("trade_type", sa.String(), nullable=True),
        sa.Column("buy_price", sa.Float(), nullable=False),
        sa.Column("sell_price", sa.Float(), nullable=True),
        sa.Column("stop_loss", sa.Float(), nullable=True),
        sa.Column("quantity", sa.Float(), nullable=False),
        sa.Column("pnl", sa.Float(), nullable=True),
        sa.Column("status", sa.String(), nullable=True),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column("trade_date", sa.DateTime(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_trades_id", "trades", ["id"])
    op.create_index("ix_trades_symbol", "trades", ["symbol"])
    op.create_index("ix_trades_trade_date", "trades", ["trade_date"])

    op.create_table(
        "psychology_logs",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("mindset", sa.JSON(), nullable=True),
        sa.Column("emotions", sa.JSON(), nullable=True),
        sa.Column("checklist", sa.JSON(), nullable=True),
        sa.Column("risk_reward_ratio", sa.String(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_psychology_logs_id", "psychology_logs", ["id"])


def downgrade() -> None:
    op.drop_index("ix_psychology_logs_id", table_name="psychology_logs")
    op.drop_table("psychology_logs")

    op.drop_index("ix_trades_trade_date", table_name="trades")
    op.drop_index("ix_trades_symbol", table_name="trades")
    op.drop_index("ix_trades_id", table_name="trades")
    op.drop_table("trades")

    op.drop_index("ix_users_email", table_name="users")
    op.drop_index("ix_users_username", table_name="users")
    op.drop_index("ix_users_id", table_name="users")
    op.drop_table("users")