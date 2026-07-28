from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded

from app.database import engine, Base
from app.config import CORS_ORIGINS
from app.limiter import limiter
from app.routers import auth, trades, psychology

# Automatically create database tables on startup
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="TradeFlow API",
    description="Trading Platform API with Role-Based Access Control, Trade Journal & Psychology Tracking",
    version="2.1.0"
)

# Rate limiting (slowapi)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,   # required so the browser sends/stores the auth cookie
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"]
)

# Unhandled 500s CORS handler
@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception):
    origin = request.headers.get("origin")
    headers = {}
    if origin in CORS_ORIGINS or CORS_ORIGINS == ["*"]:
        headers["Access-Control-Allow-Origin"] = origin or "*"
        headers["Access-Control-Allow-Credentials"] = "true"
    return JSONResponse(
        status_code=500,
        content={"detail": f"{type(exc).__name__}: {exc}"},
        headers=headers,
    )

# Routers
app.include_router(auth.router)
app.include_router(trades.router)
app.include_router(psychology.router)

@app.get("/")
def root():
    return {"message": "TradeFlow API is running", "version": "2.1.0", "docs": "/docs"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}