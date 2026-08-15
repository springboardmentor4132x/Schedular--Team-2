# Installation Guide

## Prerequisites

- Python 3.12+
- Node.js 18+
- PostgreSQL 14+ (running locally)

## 1. Clone the repository

```bash
git clone <repository-url>
cd Schedular--Team-2
```

## 2. Backend setup

```bash
cd backend

# Virtual environment
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate

# Dependencies
pip install -r requirements.txt

# Configuration
cp .env.example .env   # if present, otherwise create backend/.env
```

Create `backend/.env`:

```env
POSTGRES_USER=postgres
POSTGRES_PASSWORD=root
POSTGRES_SERVER=localhost
POSTGRES_PORT=5432
POSTGRES_DB=socialpilot

# Optional — platform OAuth credentials (Facebook, LinkedIn, YouTube,
# Instagram, Twitter/X, Pinterest, Google). Connection buttons in the UI
# are enabled per platform when the matching Client ID is set.
FACEBOOK_CLIENT_ID=
FACEBOOK_CLIENT_SECRET=
FACEBOOK_REDIRECT_URI=
# ...and so on for each platform
```

Run migrations and seed demo data:

```bash
alembic upgrade head            # apply database migrations
python seed_mock_data.py        # optional: load demo data (safe to re-run)
```

Start the server:

```bash
uvicorn main:app --reload
```

- API: <http://127.0.0.1:8000>
- Swagger UI: <http://127.0.0.1:8000/docs>
- ReDoc: <http://127.0.0.1:8000/redoc>

> Seeding also runs automatically on startup when the `users` table is empty (`app/seed.py`).

## 3. Frontend setup

```bash
cd frontend
npm install
npm run dev
```

Open <http://localhost:5173> (Vite may auto-increment the port if 5173 is busy).

## 4. Demo accounts

Password for **all** seeded accounts: `password123`

| Email | Username | Role |
|---|---|---|
| `biz1@test.com` | biz1 | Business User |
| `biz2@test.com` | biz2 | Business User |
| `biz3@test.com` | biz3 | Business User |
| `mkt1@test.com` | mkt1 | Marketing Team |
| `mkt2@test.com` | mkt2 | Marketing Team |
| `mkt3@test.com` | mkt3 | Marketing Team |
| `mkt4@test.com` | mkt4 | Marketing Team |
| `cre1@test.com` | cre1 | Content Creator |
| `cre2@test.com` | cre2 | Content Creator |
| `admin1@test.com` | admin1 | Administrator |

## Troubleshooting

- **CORS errors in the browser** — ensure the frontend origin (`localhost:5173`/`5174`…) is in the backend CORS allowlist (`backend/main.py`).
- **Port already in use** — Vite auto-increments to the next free port; use that URL.
- **Database connection refused** — confirm PostgreSQL is running and the credentials in `backend/.env` match.
