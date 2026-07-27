# TradeFlow — Trading Journal & Psychology Tracker

A full-stack app for journaling trades, logging pre-trade psychology, and
reviewing performance on an interactive calendar.

- **Frontend:** Next.js (App Router) · TypeScript · Tailwind CSS
- **Backend:** FastAPI (Python) · SQLAlchemy ORM · JWT auth
- **Database:** SQLite by default, PostgreSQL optional

```
tradeflow/
├── backend/     FastAPI app + SQLAlchemy models
└── frontend/    Next.js app (App Router)
```

---

## 1. Backend setup

Requires Python 3.10+.

```bash
cd backend

# create & activate a virtual environment
python -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate

# install dependencies
pip install -r requirements.txt

# create your environment file
cp .env.example .env
# then edit .env — at minimum set a real SECRET_KEY:
#   python -c "import secrets; print(secrets.token_hex(32))"

# run the API (tables are auto-created on first start)
uvicorn app.main:app --reload
```

The API runs at **http://localhost:8000**.
Interactive docs (Swagger) are at **http://localhost:8000/docs**.

### Using PostgreSQL instead of SQLite

1. Create a database and user, e.g.:
   ```sql
   CREATE DATABASE tradeflow;
   CREATE USER tradeflow WITH PASSWORD 'tradeflow';
   GRANT ALL PRIVILEGES ON DATABASE tradeflow TO tradeflow;
   ```
2. In `backend/.env` set:
   ```
   DATABASE_URL=postgresql+psycopg2://tradeflow:tradeflow@localhost:5432/tradeflow
   ```
3. Restart the server. `psycopg2-binary` is already in `requirements.txt`.

---

## 2. Frontend setup

Requires Node.js 18.18+.

```bash
cd frontend

npm install

# point the frontend at the backend
cp .env.local.example .env.local
# (default already targets http://localhost:8000)

npm run dev
```

The app runs at **http://localhost:3000**.

---

## 3. Using the app

1. Open http://localhost:3000 and **create an account** (Sign up).
2. Click **+ Add Trade** to record a trade. Give it a date so it appears
   on the calendar; leave the sell price empty to log an OPEN position.
3. The **calendar** shows a badge (trade count) and net P&L on each day that
   has trades. Green = net profit, red = net loss. **Click any day** to open a
   modal with every trade for that date (symbol, prices, quantity, P&L, status,
   notes) — you can delete trades from there too.
4. Use the **Pre-Trade Psychology** panel to log mindset, emotional state, and
   your risk-to-reward ratio before entering.
5. The **sidebar** shows live Total Trades, Win Rate, Net P&L, and Recent Trades.

### How P&L and status are calculated

- P&L for a completed trade = `(sell_price − buy_price) × quantity`.
- If no sell price is set, the trade is **OPEN** (P&L = 0).
- Otherwise the server derives **WIN** (P&L ≥ 0) or **LOSS** (P&L < 0).
- Win Rate = wins ÷ (wins + losses), i.e. closed trades only.

---

## API overview

| Method | Endpoint            | Description                          |
| ------ | ------------------- | ------------------------------------ |
| POST   | `/auth/signup`      | Register, returns JWT + user         |
| POST   | `/auth/login`       | Log in, returns JWT + user           |
| GET    | `/auth/me`          | Current user (requires token)        |
| GET    | `/trades?month=&year=` | Trades (optionally filtered by month) |
| POST   | `/trades`           | Create a trade                       |
| GET    | `/trades/stats`     | Aggregate stats                      |
| GET    | `/trades/recent`    | Recent trades                        |
| DELETE | `/trades/{id}`      | Delete a trade                       |
| GET    | `/psychology`       | List psychology logs                 |
| POST   | `/psychology`       | Create a psychology log              |
| DELETE | `/psychology/{id}`  | Delete a psychology log              |

All endpoints except signup/login require an `Authorization: Bearer <token>` header.

---

## Production notes

- Set a strong, unique `SECRET_KEY` and never commit `.env`.
- Restrict `CORS_ORIGINS` to your real frontend domain.
- Swap the auto `create_all` for Alembic migrations before production.
- Serve the API behind HTTPS; store the JWT in an httpOnly cookie if you want
  stronger XSS protection than `localStorage`.
