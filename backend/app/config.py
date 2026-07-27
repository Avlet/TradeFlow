import os

from dotenv import load_dotenv

load_dotenv()

# Security
SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret-change-me-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "1440"))  # 24h

# Database. Defaults to a local SQLite file; set DATABASE_URL for Postgres.
# Postgres example: postgresql+psycopg2://user:password@localhost:5432/tradeflow
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./tradeflow.db")

# CORS: comma-separated list of allowed frontend origins
CORS_ORIGINS = os.getenv(
    "CORS_ORIGINS", "http://localhost:3000,http://127.0.0.1:3000"
).split(",")

# ----- Auth cookie (httpOnly JWT) -----
COOKIE_NAME = os.getenv("COOKIE_NAME", "tradeflow_access")
# Set COOKIE_SECURE=true in production (HTTPS only).
COOKIE_SECURE = os.getenv("COOKIE_SECURE", "false").lower() == "true"
# "lax" works for same-site dev (localhost:3000 -> localhost:8000).
# Use "none" (with COOKIE_SECURE=true) only for true cross-site setups.
COOKIE_SAMESITE = os.getenv("COOKIE_SAMESITE", "lax")
COOKIE_DOMAIN = os.getenv("COOKIE_DOMAIN") or None

# ----- Brute-force protection -----
MAX_FAILED_LOGINS = int(os.getenv("MAX_FAILED_LOGINS", "5"))
LOCKOUT_MINUTES = int(os.getenv("LOCKOUT_MINUTES", "15"))