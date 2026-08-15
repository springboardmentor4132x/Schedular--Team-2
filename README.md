# SocialPilot (OrbitSocial) — Social Media Scheduler & Campaign Management Platform

> **Plan Once. Publish Everywhere.**

A full-stack social media management platform that lets **Business Users**, **Marketing Teams**, **Content Creators**, and a platform **Administrator** plan, schedule, publish, and monitor content across **Instagram, Facebook, LinkedIn, X (Twitter), YouTube, and Pinterest** — all from one unified dashboard.

![Python](https://img.shields.io/badge/Python-3.12-blue)
![FastAPI](https://img.shields.io/badge/FastAPI-0.115-green)
![React](https://img.shields.io/badge/React-19-61DAFB)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791)

---

## Project Overview

SocialPilot connects four kinds of users in one workflow:

- **Business Users** own a workspace, contract a marketing team, and track performance.
- **Marketing Teams** plan campaigns, schedule content, and publish across platforms for their clients.
- **Content Creators** manage their own content pipeline end-to-end.
- **Administrator** has platform-wide oversight (only one admin can ever exist).

The platform covers the full content lifecycle: **create → schedule → publish → monitor → report**, with a notification center keeping every role informed.

## Key Features

- **Role-based dashboards** — dedicated admin, business, marketing, and creator experiences
- **Multi-platform publishing** — Instagram, Facebook, LinkedIn, X, YouTube, Pinterest (OAuth connect + simulated publish in dev mode)
- **Content scheduling** — drafts, scheduling, media upload, publishing calendar, and queue management
- **Campaign management** — create campaigns, assign posts, timeline, progress, and analytics
- **Analytics dashboard** — content, audience, campaign, platform comparison, and performance trends with date/platform/campaign/content-type filters
- **Notification center** — in-app notifications with category/read filters, preferences, and team activity feed
- **Reports & export** — engagement, campaign, audience, publishing, and platform-comparison reports with PDF/Excel export and a download center
- **Collaboration** — workspaces, team connection requests, work requests, and content review
- **Authentication** — JWT login/registration, RBAC, Google OAuth, password hashing (bcrypt)

## Tech Stack

| Layer     | Technology |
|-----------|------------|
| Frontend  | React 19 · Vite · Tailwind CSS v4 · React Router · Axios · Framer Motion · Recharts · Lucide |
| Backend   | FastAPI 0.115 · SQLAlchemy 2.0 · Pydantic v2 · Uvicorn |
| Database  | PostgreSQL 16 (relational) · MongoDB (configured, optional/unused) |
| Migrations| Alembic |
| Auth      | JWT (python-jose) · passlib/bcrypt · Authlib (Google OAuth) |
| Task queue| In-process asyncio background publishing worker (polling) |

---

## Project Structure

```
Schedular--Team-2/
├── backend/                          # FastAPI application
│   ├── app/
│   │   ├── routers/                  # API routers (auth, posts, publishing, analytics, …)
│   │   ├── models/                   # SQLAlchemy ORM models
│   │   ├── schemas/                  # Pydantic request/response schemas
│   │   ├── services/                 # Business logic + publishing worker
│   │   ├── auth/                     # JWT, password hashing, dependencies, RBAC
│   │   ├── core/                     # Settings/config, security helpers
│   │   └── database/                 # Engine, session, Base
│   ├── alembic/                      # Database migrations
│   ├── seed_mock_data.py             # Demo data seeder (safe to re-run)
│   ├── main.py                       # App instance, CORS, router mounting
│   └── requirements.txt
├── frontend/                         # React + Vite SPA
│   ├── src/
│   │   ├── pages/                    # Public pages (Landing, Login, Register…)
│   │   ├── dashboards/               # admin, business, marketing, creator, shared
│   │   ├── components/               # Shared UI components
│   │   ├── services/                 # API client services
│   │   ├── context/                  # Auth, theme, client selection
│   │   └── App.jsx                   # Route tree
│   └── package.json
├── docs/                             # Project documentation (see Support & Documentation)
├── LICENSE                           # MIT License
└── README.md                         # This file
```

---

## Milestones & Timeline

### Milestone 1 — Foundation & Authentication
- **Backend**: FastAPI server, modular architecture, API routing, CORS, database integration
- **Authentication**: Register/Login APIs, JWT, password hashing, Role-Based Access Control (RBAC)
- **Frontend**: Admin/Business/Marketing/Creator dashboard templates, navbar, sidebar, routing
- **Database**: PostgreSQL + SQLAlchemy + Alembic, schema design, ER diagram, models, sessions
- **Deliverables**: FastAPI server · JWT + RBAC · dashboard layouts · validated login/registration forms · database schema

### Milestone 2 — Content Scheduling & Campaigns (Modules 3–4)
- **Module 3 — Content Scheduling**:
  - Post creation form, media upload UI, connected-account selection, caption input, schedule/draft buttons
  - Publishing calendar, draft management, content preview, queue management, search/filter/sort
  - Backend: Create/Update/Delete/Scheduled-posts APIs, upload media, calendar & queue APIs
  - Database: `posts` table + posts ↔ social accounts relationship table
- **Module 4 — Campaign Management**:
  - Campaign dashboard, create campaign, campaign details, assign posts, timeline, analytics overview
  - Backend: Campaign CRUD, assign/remove posts, timeline, progress, summary APIs
  - Database: `campaigns` table + campaign ↔ posts relationship table

### Milestone 3 — Multi-Platform Publishing & Analytics (Modules 5–6)
- **Module 5 — Multi-Platform Publishing**:
  - Publishing dashboard, queue, logs, failed posts, platform history
  - Search/sort/filter/pagination + retry/pause/cancel; post previews, status, failure reasons, API responses
  - Backend: background publishing service, queue monitoring, token validation, retry mechanisms, publishing logs
  - Integrations: Facebook, Instagram, LinkedIn, X, YouTube, Pinterest
  - Database: `publishing_logs` + `publishing_queue` tables
- **Module 6 — Analytics Dashboard**:
  - Content, audience, campaign, platform comparison, and performance trends dashboards
  - Charts for engagement, impressions, reach, followers, campaign performance; date/platform/campaign/content-type filters
  - Backend: analytics services, engagement-rate calculation, weekly/monthly/quarterly/yearly trends, filtering/aggregation
  - Database: `post_analytics`, `audience_analytics`, `campaign_analytics`, `platform_analytics` tables

### Milestone 4 — Notifications, Reports & Delivery (Modules 7–8)
- **Module 7 — Notification Module**:
  - Notification management APIs (create, retrieve, mark read, mark all read, delete)
  - Notification preferences (Publishing, Campaigns, Account Activity, Team Collaboration, System) + In-App/Email channels
  - Automatic triggers for post schedule/publish/fail/cancel, campaign events, account connect/disconnect, team activity
  - Notification Center, settings, history, and team activity feed in the UI
  - Database: `notifications` + `notification_preferences` tables
- **Module 8 — Reports & Export**:
  - Report generation for Engagement, Campaign, Audience Growth, Publishing, Platform Comparison
  - Filters (type, campaign, platform, content type, date range), preview API, PDF + Excel export
  - Download center (list, download, delete, search, filter, status, download count)
  - Database: `generated_reports` table

---

## Key Files Location

| File | Location | Purpose |
|------|----------|---------|
| Backend app | `backend/app/` | FastAPI application (routers, models, schemas, services, auth) |
| Database migrations | `backend/alembic/` | Alembic migration history |
| API entry point | `backend/main.py` | App instance, CORS, router mounting, background worker |
| Demo data seeder | `backend/app/seed.py` · `backend/seed_mock_data.py` | Idempotent demo-data seeding |
| Frontend app | `frontend/src/` | React SPA (pages, dashboards, components, services) |
| Role dashboards | `frontend/src/dashboards/` | admin · business · marketing · creator · shared |

## Key APIs

| Area | Endpoints |
|------|-----------|
| Auth | `POST /api/v1/auth/register` · `POST /api/v1/auth/login` · `GET /api/v1/auth/me` · Google OAuth |
| Posts | `POST /api/v1/posts` · schedule/draft/publish · `GET /api/v1/posts/calendar` · delete/update |
| Publishing | `GET /publish/ready` · `POST /publish/{post_id}` · retry/cancel · `GET /publish/history` · `GET /publish/logs` · `GET /publish/queue` |
| Campaigns | Campaign CRUD · assign/remove posts · timeline · progress · summary |
| Analytics | `/analytics/dashboard` · `/analytics/posts` · `/analytics/campaigns` · `/analytics/audience` · `/analytics/platforms` · `/analytics/trends` · engagement/followers/reach/impressions/clicks |
| Notifications | `GET/POST /notifications` · mark read · mark all read · preferences · team activity |
| Reports | Generate · preview · download · delete · download center |
| Admin | `/admin/stats` · `/admin/activity` · `/admin/analytics/*` · user management |


---

## Getting Started

### Prerequisites
- Python 3.12+
- Node.js 18+
- PostgreSQL 14+

### Backend Setup

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
POSTGRES_DB=socialpilot

# Optional — platform OAuth credentials (Facebook, LinkedIn, YouTube,
# Instagram, Twitter/X, Pinterest, Google). Connection buttons in the UI
# are enabled per platform when the matching Client ID is set.
FACEBOOK_CLIENT_ID=
FACEBOOK_CLIENT_SECRET=
FACEBOOK_REDIRECT_URI=
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

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Open <http://localhost:5173> (Vite may auto-increment the port if 5173 is busy).

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

The seed data includes workspaces, campaigns, posts, connected (demo) social accounts, analytics, publishing history, and notifications. **Only one administrator can ever exist** — registering a second admin is rejected by the backend and hidden in the UI.

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

---

## Dashboard Modules

### Admin Dashboard
- Platform-wide stats, user management (add/approve/disable), marketing teams, content creators
- Platform analytics overview, platform-wide reports, notifications, settings

### Business Dashboard
- Workspace overview, client–team assignments, campaign tracking, marketing activity
- Connected accounts, scheduled/published posts, reports

### Marketing Dashboard
- Client (workspace) management, work requests and decisions, content management/library/review
- Content scheduling, publishing calendar, campaigns, publishing queue/logs/failed posts, reports

### Creator Dashboard
- Content creation, scheduling, publishing calendar, social accounts, campaigns
- Analytics (content, audience, campaign, platform comparison, trends), notifications, profile

---

## Contributors

| Member | Role |
|--------|------|
| Sravan Kumar | Backend Development — APIs, business logic, publishing worker, reports |
| Poojitha | Authentication — JWT, RBAC, security, access control |
| Alok | Dashboard Frontend — admin/business/marketing/creator dashboards, UI/UX |
| Manasa | Frontend — login/registration, forms, validation, UI/UX |
| Anwin | Database & Documentation — PostgreSQL, SQLAlchemy, Alembic, schema, README |

## License

Distributed under the **MIT License**. See [`LICENSE`](LICENSE) for details.

## Support & Documentation

| Topic | File |
|-------|------|
| Project overview | [`docs/PROJECT_STATEMENT.md`](docs/PROJECT_STATEMENT.md) |
| Architecture | [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) |
| Milestones & timeline | [`docs/MILESTONES.md`](docs/MILESTONES.md) |
| API reference | [`docs/API_REFERENCE.md`](docs/API_REFERENCE.md) |
| Database schema | [`docs/DATABASE.md`](docs/DATABASE.md) |
| Installation guide | [`docs/INSTALLATION_GUIDE.md`](docs/INSTALLATION_GUIDE.md) |
| Dashboard user guide | [`docs/DASHBOARD_GUIDE.md`](docs/DASHBOARD_GUIDE.md) |
| Known limitations | [`docs/KNOWN_LIMITATIONS.md`](docs/KNOWN_LIMITATIONS.md) |
| Changelog | [`docs/CHANGELOG.md`](docs/CHANGELOG.md) |

## Last Updated
August 2026
