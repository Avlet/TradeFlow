from datetime import datetime
from typing import List, Optional, Tuple

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import extract
from sqlalchemy.orm import Session

from app import models, schemas
from app.auth import get_current_user
from app.database import get_db

router = APIRouter(prefix="/trades", tags=["trades"])


def compute_pnl_and_status(
    buy_price: float,
    sell_price: Optional[float],
    quantity: float,
) -> Tuple[float, str]:
    """Automatically derive P&L and the WIN/LOSS/OPEN result.

    Realised P&L = money received - money paid = (sell - buy) * qty, which is
    correct for both long (BUY) and short (SELL) once both prices are known.
    With no sell price the position is still OPEN.
    """
    if sell_price is None:
        return 0.0, "OPEN"
    pnl = round((sell_price - buy_price) * quantity, 2)
    return pnl, ("WIN" if pnl >= 0 else "LOSS")


@router.post("", response_model=schemas.TradeOut, status_code=201)
def create_trade(
    payload: schemas.TradeCreate,
    db: Session = Depends(get_db),
    user: models.User = Depends(get_current_user),
):
    pnl, status = compute_pnl_and_status(
        payload.buy_price, payload.sell_price, payload.quantity
    )
    trade = models.Trade(
        user_id=user.id,
        symbol=payload.symbol.upper().strip(),
        trade_type=(payload.trade_type or "BUY").upper(),
        buy_price=payload.buy_price,
        sell_price=payload.sell_price,
        stop_loss=payload.stop_loss,
        quantity=payload.quantity,
        pnl=pnl,
        status=status,
        notes=payload.notes,
        trade_date=datetime.utcnow(),  # auto-assigned at creation time
    )
    db.add(trade)
    db.commit()
    db.refresh(trade)
    return trade


@router.get("", response_model=List[schemas.TradeOut])
def list_trades(
    month: Optional[int] = Query(None, ge=1, le=12),
    year: Optional[int] = Query(None, ge=1970, le=3000),
    db: Session = Depends(get_db),
    user: models.User = Depends(get_current_user),
):
    q = db.query(models.Trade).filter(models.Trade.user_id == user.id)
    if month and year:
        q = q.filter(
            extract("month", models.Trade.trade_date) == month,
            extract("year", models.Trade.trade_date) == year,
        )
    return q.order_by(models.Trade.trade_date.desc()).all()


@router.get("/recent", response_model=List[schemas.TradeOut])
def recent_trades(
    limit: int = Query(5, ge=1, le=50),
    db: Session = Depends(get_db),
    user: models.User = Depends(get_current_user),
):
    return (
        db.query(models.Trade)
        .filter(models.Trade.user_id == user.id)
        .order_by(models.Trade.trade_date.desc())
        .limit(limit)
        .all()
    )


@router.get("/stats", response_model=schemas.StatsOut)
def trade_stats(
    db: Session = Depends(get_db),
    user: models.User = Depends(get_current_user),
):
    trades = db.query(models.Trade).filter(models.Trade.user_id == user.id).all()
    total = len(trades)
    wins = sum(1 for t in trades if t.status == "WIN")
    losses = sum(1 for t in trades if t.status == "LOSS")
    open_trades = sum(1 for t in trades if t.status == "OPEN")
    net_pnl = round(sum(t.pnl for t in trades), 2)
    closed = wins + losses
    win_rate = round((wins / closed) * 100, 2) if closed else 0.0
    return {
        "total_trades": total,
        "win_rate": win_rate,
        "net_pnl": net_pnl,
        "wins": wins,
        "losses": losses,
        "open_trades": open_trades,
    }


@router.patch("/{trade_id}", response_model=schemas.TradeOut)
def update_trade(
    trade_id: int,
    payload: schemas.TradeUpdate,
    db: Session = Depends(get_db),
    user: models.User = Depends(get_current_user),
):
    trade = (
        db.query(models.Trade)
        .filter(models.Trade.id == trade_id, models.Trade.user_id == user.id)
        .first()
    )
    if not trade:
        raise HTTPException(status_code=404, detail="Trade not found")

    # Recompute P&L and WIN/LOSS/OPEN from the edited prices.
    pnl, status = compute_pnl_and_status(
        payload.buy_price, payload.sell_price, payload.quantity
    )

    trade.symbol = payload.symbol.upper().strip()
    trade.trade_type = (payload.trade_type or "BUY").upper()
    trade.buy_price = payload.buy_price
    trade.sell_price = payload.sell_price
    trade.stop_loss = payload.stop_loss
    trade.quantity = payload.quantity
    trade.pnl = pnl
    trade.status = status
    trade.notes = payload.notes
    # trade_date is intentionally preserved (the trade keeps its original day).

    db.commit()
    db.refresh(trade)
    return trade


@router.delete("/{trade_id}", status_code=204)
def delete_trade(
    trade_id: int,
    db: Session = Depends(get_db),
    user: models.User = Depends(get_current_user),
):
    trade = (
        db.query(models.Trade)
        .filter(models.Trade.id == trade_id, models.Trade.user_id == user.id)
        .first()
    )
    if not trade:
        raise HTTPException(status_code=404, detail="Trade not found")
    db.delete(trade)
    db.commit()
    return None