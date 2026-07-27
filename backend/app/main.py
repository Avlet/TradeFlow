from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded

from app.config import CORS_ORIGINS
from app.limiter import limiter
from app.routers import auth, psychology, trades

# NOTE: schema is now owned by Alembic migrations (run `alembic upgrade head`).
# Base.metadata.create_all is intentionally NOT called here anymore.

app = FastAPI(title="TradeFlow API", version="1.1.0")

# Rate limiting (slowapi)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,   # required so the browser sends/stores the auth cookie
    allow_methods=["*"],
    allow_headers=["*"],
)


# Unhandled 500s are produced outside the CORS middleware, so the browser would
# otherwise see them as "CORS errors". This returns the real message WITH CORS
# headers so the actual problem is visible in the Network tab.
@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception):
    origin = request.headers.get("origin")
    headers = {}
    if origin in CORS_ORIGINS:
        headers["Access-Control-Allow-Origin"] = origin
        headers["Access-Control-Allow-Credentials"] = "true"
    return JSONResponse(
        status_code=500,
        content={"detail": f"{type(exc).__name__}: {exc}"},
        headers=headers,
    )


app.include_router(auth.router)
app.include_router(trades.router)
app.include_router(psychology.router)


@app.get("/health")
def health():
    return {"status": "ok"}


@app.get("/")
def root():
    return {"message": "TradeFlow API is running", "docs": "/docs"}