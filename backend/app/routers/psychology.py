from typing import List

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app import models, schemas
from app.auth import get_current_user
from app.database import get_db

router = APIRouter(prefix="/psychology", tags=["psychology"])


@router.post("", response_model=schemas.PsychologyOut, status_code=201)
def create_log(
    payload: schemas.PsychologyCreate,
    db: Session = Depends(get_db),
    user: models.User = Depends(get_current_user),
):
    log = models.PsychologyLog(
        user_id=user.id,
        mindset=payload.mindset or [],
        emotions=payload.emotions or [],
        checklist=payload.checklist or [],
        risk_reward_ratio=payload.risk_reward_ratio,
    )
    db.add(log)
    db.commit()
    db.refresh(log)
    return log


@router.get("", response_model=List[schemas.PsychologyOut])
def list_logs(
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    user: models.User = Depends(get_current_user),
):
    return (
        db.query(models.PsychologyLog)
        .filter(models.PsychologyLog.user_id == user.id)
        .order_by(models.PsychologyLog.created_at.desc())
        .limit(limit)
        .all()
    )


@router.delete("/{log_id}", status_code=204)
def delete_log(
    log_id: int,
    db: Session = Depends(get_db),
    user: models.User = Depends(get_current_user),
):
    log = (
        db.query(models.PsychologyLog)
        .filter(
            models.PsychologyLog.id == log_id,
            models.PsychologyLog.user_id == user.id,
        )
        .first()
    )
    if not log:
        raise HTTPException(status_code=404, detail="Log not found")
    db.delete(log)
    db.commit()
    return None