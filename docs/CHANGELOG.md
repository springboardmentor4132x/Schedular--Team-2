# Changelog

## 1.0.0 — August 2026

### Milestone 4 — Notifications, Reports & Delivery
- **Notification module**: notification center with filters, preferences, team activity feed, and automatic event triggers (post schedule/publish/fail, campaign events, account connect/disconnect)
- **Reports & export**: report generation (engagement, campaign, audience, publishing, platform comparison), preview, PDF/Excel export, download center
- Seeded demo notifications referencing real posts/campaigns/accounts

### Milestone 3 — Multi-Platform Publishing & Analytics
- **Publishing**: dashboard, queue management (reschedule/cancel/pause/resume), logs, failed-post retry, platform history, background worker
- **Analytics**: content, audience, campaign, platform comparison, performance trends with date/platform/campaign/content-type filters
- Admin analytics pages with KPI cards, trends, and top posts

### Milestone 2 — Content Scheduling & Campaigns
- Post creation with media upload, drafts, scheduling, publishing calendar
- Campaign management: create, assign posts, timeline, progress, summary, analytics

### Milestone 1 — Foundation & Authentication
- FastAPI backend with modular architecture (routers, models, schemas, services, auth)
- PostgreSQL + SQLAlchemy + Alembic schema
- JWT auth, RBAC, Google OAuth, password hashing
- Four role-based dashboards (admin, business, marketing, creator)
- Business ↔ marketing collaboration: workspaces, team requests, work requests

## 0.1.0 — Initial scaffolding
- Project setup, repository structure, database schema design
