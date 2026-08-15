# Architecture

## Layers

```
┌──────────────────────────────────────────────────────────────────┐
│ FRONTEND  (React SPA, Vite)                                      │
│  pages/ → dashboards/ (admin, business, marketing, creator)      │
│  contexts (Auth, Client, Theme, Sidebar)  services (axios)      │
└───────────────┬──────────────────────────────────────────────────┘
                │  HTTP + JSON (axios), Bearer JWT, CORS
┌───────────────▼──────────────────────────────────────────────────┐
│ BACKEND  (FastAPI, single process)                               │
│  main.py          → app instance, CORS, middleware, router mount │
│  app/routers/     → thin HTTP layer (validation, authz)          │
│  app/services/    → business logic (pure-ish, DB sessions)       │
│  app/models/      → SQLAlchemy ORM models                        │
│  app/schemas/     → Pydantic request/response models             │
│  app/auth/        → JWT, password hashing, dependencies, RBAC    │
│  app/core/        → settings/config, security helpers            │
│  app/database/    → engine, session, Base                        │
└───────────────┬──────────────────────────────────────────────────┘
                │  SQLAlchemy (pg8000)
┌───────────────▼──────────────────────────────────────────────────┐
│ PostgreSQL (relational store)        MongoDB (optional, unused)  │
└──────────────────────────────────────────────────────────────────┘
```

## Request flow

1. Browser → `frontend/src/shared/api/api.js` axios instance (`VITE_API_BASE_URL`).
2. Axios request interceptor attaches `Authorization: Bearer <token>` from
   `localStorage["token"]`; a 401 response interceptor clears auth and
   redirects to `/login`.
3. FastAPI router resolves the path under `/api/v1/...`.
4. `Depends(get_current_user)` decodes the JWT and loads the `User`.
5. Optional `RoleChecker` gates endpoints by role.
6. Router calls a service function with `db` (session) + `user_id`.
7. Service queries the ORM models, mutates/commits, returns dict or model.
8. FastAPI serializes via Pydantic `response_model` (or dict).

## Module boundaries

- **Routers** must only: declare routes, wire dependencies, map errors to HTTP
  status, convert model→response. No business logic.
- **Services** own business logic: ownership checks, state transitions, queries,
  platform API calls, notification creation. They raise `HTTPException` for
  user-facing errors.
- **Models** are pure ORM; **schemas** are pure Pydantic.

## State management (frontend)

- `AuthContext` — persisted user object in `localStorage["orbit-user"]`.
- `ClientContext` — marketing "active client" selection.
- `ThemeContext` / `SidebarContext` — UI state.
- Most data is fetched per-page with `useEffect` + `useState` (no global data
  store like Redux/Zustand).

## Background job system

- `main.py` startup event launches `start_publishing_worker()` (asyncio task).
- Worker polls periodically and publishes due posts from the queue.
- Publishing writes `publishing_logs` records for every attempt and supports
  retry/backoff for failed posts.

## Auth & authorization

- Passwords: bcrypt via passlib (`app/auth/security.py`).
- JWT: HS256, 24 h expiry (`app/auth/jwt.py`), payload `{sub, id, role}`.
- `get_current_user` (`app/auth/dependencies.py`) resolves the token → User.
- `RoleChecker` (`app/auth/rbac.py`) enforces role allow-lists.
- Google OAuth: Authlib (`app/auth/google_oauth.py`), session stores role +
  redirect URI; callback creates/logs-in user and redirects with `?token=`.

## Third-party integrations

- OAuth connect flows for 6 platforms (Facebook, LinkedIn, YouTube, Instagram,
  Twitter, Pinterest) — each a `*_service.py` that calls the platform API.
- Publishing dispatches per platform via `publishing_service.dispatch_publish()`
  with a **simulated fallback** in development mode when real API credentials
  are not configured.

## Conventions to preserve

- All API paths are prefixed `/api/v1` (set in `main.py`).
- Data is scoped to the requesting user by `user_id` in service queries.
- Status strings are stored uppercase: `Draft, Scheduled, Queued, Publishing,
  Published, Failed, Cancelled`; queue statuses: `Pending, Processing,
  Completed, Failed, Cancelled`.
