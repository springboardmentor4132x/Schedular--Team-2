# Social Media Scheduler & Campaign Management Platform

A full-stack social media management platform for scheduling, publishing, and monitoring content across multiple platforms.

![Python](https://img.shields.io/badge/Python-3.12-blue)
![FastAPI](https://img.shields.io/badge/FastAPI-0.115-green)
![React](https://img.shields.io/badge/React-19-61DAFB)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791)

---

## Overview

The platform connects **Business Users**, **Marketing Teams**, and **Content Creators** in one workflow:

- Businesses assign clients (workspaces) to marketing teams and track performance.
- Marketing teams plan campaigns, schedule content, and publish across platforms.
- Content creators manage their own content pipeline.
- An **Administrator** has platform-wide oversight (only one admin can ever exist).

## Features

**Authentication & Roles**
- JWT login/registration with role-based access control (RBAC)
- Google OAuth sign-in
- Roles: Business User · Marketing Team · Content Creator · Administrator

**Publishing**
- Draft, schedule, and "publish now" posts to **Instagram, Facebook, LinkedIn, X (Twitter), YouTube, Pinterest**
- Select multiple platforms per post; attach images/videos (media uploads)
- Background publishing worker that publishes scheduled posts automatically at their due time
- Publishing **queue**, **logs** (with API response, failure reason, platform post ID), **failed posts** with retry, and **platform history**

**Content & Campaigns**
- Content management, library, review, and scheduling
- Campaign creation and management with analytics
- Publishing calendar

**Analytics & Reporting**
- Audience, platform, post, and campaign analytics (followers, reach, impressions, engagement)
- Reports for business and marketing roles

**Collaboration**
- Workspaces with client–team assignment
- Team requests / client approval flow
- Notifications across the platform

## Tech Stack

| Layer     | Technology |
|-----------|------------|
| Frontend  | React 19 · Vite · Tailwind CSS v4 · React Router · Axios · Framer Motion · Recharts |
| Backend   | FastAPI · SQLAlchemy 2 · Alembic · Pydantic v2 · Uvicorn |
| Database  | PostgreSQL (pg8000) |
| Auth      | JWT (python-jose) · passlib/bcrypt · Google & platform OAuth |
| Other     | Background task worker (asyncio) · Uploaded media served from `/uploads` |

## Project Structure

```
├── frontend/            React + Vite SPA
│   └── src/
│       ├── pages/           Public pages (Landing, Login, Register, RoleSelection…)
│       ├── dashboards/      Role dashboards (business, marketing, creator, admin, shared)
│       ├── components/      Shared UI components
│       ├── services/        API client services (auth, posts, publishing, analytics…)
│       └── context/         Auth, theme, client selection
├── backend/             FastAPI application
│   ├── app/
│   │   ├── routers/         API routers (auth, posts, publishing, marketing, analytics…)
│   │   ├── models/          SQLAlchemy models
│   │   ├── schemas/         Pydantic schemas
│   │   ├── services/        Business logic + publishing worker
│   │   └── seed.py          Demo data seeder
│   ├── alembic/             Database migrations
│   └── requirements.txt
└── README.md
```

## Prerequisites

- Python 3.12+
- Node.js 18+
- PostgreSQL 14+

## Backend Setup

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

Create `backend/.env` (defaults work for a local PostgreSQL install):

```env
POSTGRES_USER=postgres
POSTGRES_PASSWORD=root
POSTGRES_SERVER=localhost
POSTGRES_PORT=5432
POSTGRES_DB=Social_pilot

# Optional — platform OAuth credentials (Facebook, LinkedIn, YouTube,
# Instagram, Twitter/X, Pinterest, Google). Connection buttons in the UI
# are enabled per platform when the matching Client ID is set.
FACEBOOK_CLIENT_ID=
FACEBOOK_CLIENT_SECRET=
FACEBOOK_REDIRECT_URI=
LINKEDIN_CLIENT_ID=
# ...and so on for each platform
```

Then run migrations and start the server:

```bash
alembic upgrade head            # apply database migrations
python seed_mock_data.py        # optional: load demo data (safe to re-run)
uvicorn main:app --reload
```

- API: <http://127.0.0.1:8000>
- Swagger UI: <http://127.0.0.1:8000/docs>
- ReDoc: <http://127.0.0.1:8000/redoc>

> Seeding also runs automatically on startup when the `users` table is empty (`app/seed.py`).

## Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Open <http://localhost:5173>.

## Demo Accounts

Seeded with `python seed_mock_data.py` (or automatically on first startup). Password for **all** accounts: `password123`

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

The seed data includes workspaces, campaigns, posts, connected (demo) social accounts, analytics, and publishing history. **Only one administrator can ever exist** — registering a second admin is rejected by the backend and hidden in the UI.

## Available Scripts

**Backend**
```bash
uvicorn main:app --reload    # dev server (port 8000)
alembic upgrade head         # run migrations
python seed_mock_data.py     # seed demo data
python tests/test_api.py     # API smoke tests
```

**Frontend**
```bash
npm run dev      # dev server (port 5173)
npm run build    # production build → dist/
npm run preview  # preview the production build
npm run lint     # ESLint
```

## License

Developed for educational purposes.
