from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, ConfigDict, EmailStr


# ---------- Auth ----------
class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str


class UserOut(BaseModel):
    id: int
    username: str
    email: EmailStr
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)


class UserUpdate(BaseModel):
    username: Optional[str] = None
    email: Optional[EmailStr] = None
    current_password: Optional[str] = None
    new_password: Optional[str] = None


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


# ---------- Trades ----------
class TradeCreate(BaseModel):
    symbol: str
    trade_type: str = "BUY"
    buy_price: float
    sell_price: Optional[float] = None
    stop_loss: Optional[float] = None
    quantity: float
    notes: Optional[str] = None
    # status and trade_date are assigned automatically by the server.


class TradeUpdate(BaseModel):
    """Full replacement of an existing trade's editable fields.

    The edit form always sends every field, so sending sell_price=null (blank)
    reopens a position and the server recomputes P&L / status accordingly.
    """
    symbol: str
    trade_type: str = "BUY"
    buy_price: float
    sell_price: Optional[float] = None
    stop_loss: Optional[float] = None
    quantity: float
    notes: Optional[str] = None


class TradeOut(BaseModel):
    id: int
    symbol: str
    trade_type: str
    buy_price: float
    sell_price: Optional[float]
    stop_loss: Optional[float]
    quantity: float
    pnl: float
    status: str
    notes: Optional[str]
    trade_date: datetime
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)


# ---------- Psychology (tick-box questionnaire) ----------
class PsychologyCreate(BaseModel):
    mindset: List[str] = []
    emotions: List[str] = []
    checklist: List[str] = []
    risk_reward_ratio: Optional[str] = None


class PsychologyOut(BaseModel):
    id: int
    mindset: List[str]
    emotions: List[str]
    checklist: List[str]
    risk_reward_ratio: Optional[str]
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)


# ---------- Stats ----------
class StatsOut(BaseModel):
    total_trades: int
    win_rate: float
    net_pnl: float
    wins: int
    losses: int
    open_trades: int