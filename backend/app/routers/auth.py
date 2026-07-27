from datetime import datetime, timedelta

from fastapi import APIRouter, Depends, HTTPException, Request, Response
from sqlalchemy.orm import Session

from app import models, schemas
from app.auth import (
    clear_auth_cookie,
    create_access_token,
    get_current_user,
    hash_password,
    set_auth_cookie,
    validate_password_strength,
    verify_password,
)
from app.config import LOCKOUT_MINUTES, MAX_FAILED_LOGINS
from app.database import get_db
from app.limiter import limiter

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/signup", response_model=schemas.UserOut, status_code=201)
@limiter.limit("5/minute")
def signup(
    request: Request,
    response: Response,
    payload: schemas.UserCreate,
    db: Session = Depends(get_db),
):
    validate_password_strength(payload.password)

    existing = (
        db.query(models.User)
        .filter(
            (models.User.email == payload.email)
            | (models.User.username == payload.username)
        )
        .first()
    )
    if existing:
        raise HTTPException(
            status_code=400, detail="Email or username already registered"
        )

    user = models.User(
        username=payload.username,
        email=payload.email,
        hashed_password=hash_password(payload.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_access_token({"sub": str(user.id)})
    set_auth_cookie(response, token)
    return user


@router.post("/login", response_model=schemas.UserOut)
@limiter.limit("10/minute")
def login(
    request: Request,
    response: Response,
    payload: schemas.LoginRequest,
    db: Session = Depends(get_db),
):
    now = datetime.utcnow()
    user = db.query(models.User).filter(models.User.email == payload.email).first()

    # Account currently locked out
    if user and user.locked_until and user.locked_until > now:
        minutes = int((user.locked_until - now).total_seconds() // 60) + 1
        raise HTTPException(
            status_code=403,
            detail=(
                "Account temporarily locked due to too many failed attempts. "
                f"Try again in about {minutes} minute(s)."
            ),
        )

    # Invalid credentials -> count the failure and maybe lock
    if not user or not verify_password(payload.password, user.hashed_password):
        if user:
            user.failed_login_attempts = (user.failed_login_attempts or 0) + 1
            if user.failed_login_attempts >= MAX_FAILED_LOGINS:
                user.locked_until = now + timedelta(minutes=LOCKOUT_MINUTES)
                user.failed_login_attempts = 0
            db.commit()
        raise HTTPException(status_code=401, detail="Invalid email or password")

    # Success -> reset counters and issue the cookie
    user.failed_login_attempts = 0
    user.locked_until = None
    db.commit()

    token = create_access_token({"sub": str(user.id)})
    set_auth_cookie(response, token)
    return user


@router.post("/logout", status_code=204)
def logout(response: Response):
    clear_auth_cookie(response)
    return None


@router.get("/me", response_model=schemas.UserOut)
def me(current_user: models.User = Depends(get_current_user)):
    return current_user


@router.patch("/me", response_model=schemas.UserOut)
def update_me(
    payload: schemas.UserUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    if payload.username and payload.username != current_user.username:
        taken = (
            db.query(models.User)
            .filter(
                models.User.username == payload.username,
                models.User.id != current_user.id,
            )
            .first()
        )
        if taken:
            raise HTTPException(status_code=400, detail="Username already taken")
        current_user.username = payload.username

    if payload.email and payload.email != current_user.email:
        taken = (
            db.query(models.User)
            .filter(
                models.User.email == payload.email,
                models.User.id != current_user.id,
            )
            .first()
        )
        if taken:
            raise HTTPException(status_code=400, detail="Email already registered")
        current_user.email = payload.email

    if payload.new_password:
        if not payload.current_password or not verify_password(
            payload.current_password, current_user.hashed_password
        ):
            raise HTTPException(
                status_code=400, detail="Current password is incorrect"
            )
        validate_password_strength(payload.new_password)
        current_user.hashed_password = hash_password(payload.new_password)

    db.commit()
    db.refresh(current_user)
    return current_user


@router.delete("/me", status_code=204)
def delete_me(
    response: Response,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    db.delete(current_user)
    db.commit()
    clear_auth_cookie(response)
    return None