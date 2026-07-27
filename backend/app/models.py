from datetime import datetime

from sqlalchemy import (
    JSON,
    Column,
    DateTime,
    Float,
    ForeignKey,
    Integer,
    String,
    Text,
)
from sqlalchemy.orm import relationship

from app.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Brute-force protection
    failed_login_attempts = Column(
        Integer, default=0, nullable=False, server_default="0"
    )
    locked_until = Column(DateTime, nullable=True)

    trades = relationship(
        "Trade", back_populates="owner", cascade="all, delete-orphan"
    )
    psychology_logs = relationship(
        "PsychologyLog", back_populates="owner", cascade="all, delete-orphan"
    )


class Trade(Base):
    __tablename__ = "trades"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    symbol = Column(String, nullable=False, index=True)
    trade_type = Column(String, default="BUY")
    buy_price = Column(Float, nullable=False)
    sell_price = Column(Float, nullable=True)
    stop_loss = Column(Float, nullable=True)
    quantity = Column(Float, nullable=False)

    pnl = Column(Float, default=0.0)
    status = Column(String, default="OPEN")
    notes = Column(Text, nullable=True)

    trade_date = Column(DateTime, default=datetime.utcnow, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    owner = relationship("User", back_populates="trades")


class PsychologyLog(Base):
    __tablename__ = "psychology_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    mindset = Column(JSON, default=list)
    emotions = Column(JSON, default=list)
    checklist = Column(JSON, default=list)
    risk_reward_ratio = Column(String, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)

    owner = relationship("User", back_populates="psychology_logs")