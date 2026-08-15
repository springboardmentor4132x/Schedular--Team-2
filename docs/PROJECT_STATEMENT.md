# Project Statement

**SocialPilot / OrbitSocial** is a full-stack social media management platform
("Plan Once. Publish Everywhere.") that lets four kinds of users plan, schedule,
publish, and monitor content across **Instagram, Facebook, LinkedIn, X (Twitter),
YouTube, and Pinterest**.

It is an MCA internship project built by a five-member team. The frontend brand
name is **OrbitSocial**; the backend project name is **SocialPilot API**.

## User roles

| Role | Dashboard route | Description |
|---|---|---|
| `creator` | `/dashboard/creator` | Content creators scheduling their own content |
| `business` | `/dashboard/business` | Business users who own a workspace and contract a marketing team |
| `marketing` | `/dashboard/marketing` | Marketing teams that manage one or more client (business) workspaces |
| `administrator` | `/dashboard/admin` | Single platform administrator (only one can ever exist) |

## Core features (implemented)

- Registration, login (password + Google OAuth), JWT auth, RBAC
- Role-based dashboards (admin, business, marketing, creator)
- Social account OAuth connection: Facebook, LinkedIn, YouTube, Instagram, Twitter, Pinterest
- Post creation, drafts, scheduling, media upload, publishing calendar/queue
- Background publishing worker + retry/backoff queue
- Campaign management (create, assign posts, timeline, progress)
- Workspaces + memberships (business owns a workspace, marketing teams join)
- Work requests (business brief → marketing decision), notifications
- Team connection requests (business ↔ marketing), one team per workspace
- Analytics: posts, audience, campaigns, platform comparison, trends (DB-derived)
- Publishing dashboard, queue management, logs, failed-post retry
- Notification center, preferences, team activity feed
- Reports: generate, preview, PDF/Excel export, download center
- Admin user management, platform stats, platform-wide reports

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite, React Router, Tailwind CSS v4, Axios, Framer Motion, Recharts, Lucide |
| Backend | Python 3.12, FastAPI 0.115, SQLAlchemy 2.0, Pydantic v2 |
| Database | PostgreSQL 16 (relational), MongoDB (configured, optional/unused) |
| Migrations | Alembic |
| Auth | JWT (python-jose), passlib/bcrypt, Authlib (Google OAuth) |
| Task queue | In-process asyncio background worker (polling) |

## Repository layout (high level)

```
Schedular--Team-2/
├── backend/    FastAPI application (app/, alembic/, tests/, seed scripts)
├── frontend/   React SPA (src/, vite config)
└── docs/       Project documentation (this directory)
```
