# OrbitSocial Frontend

React + Vite frontend for the social media scheduler & campaign management platform.

## Quick Start

```bash
npm install
npm run dev
```

Open **http://localhost:5173**. The backend must be running on `http://127.0.0.1:8000` (see the root `README.md`).

## Structure

```
src/
├── pages/            Public pages (Landing, RoleSelection, Register, Login, Terms, OAuth callback)
├── dashboards/       Role-scoped dashboards
│   ├── business/     Business user pages (campaigns, connected accounts, reports…)
│   ├── marketing/    Marketing team pages (clients, scheduling, publishing queue/logs/failed/history…)
│   ├── creator/      Content creator pages (scheduling, publishing, analytics…)
│   ├── admin/        Admin dashboard
│   └── shared/       Shared layout, guard, analytics, settings, profile
├── components/       Reusable UI components (StatCard, PageHeader, EmptyState…)
├── services/         API clients (auth, posts, publishing, analytics, notifications…)
├── context/          Auth, theme, client selection contexts
├── App.jsx           Route definitions
└── index.css         Tailwind + design tokens
```

## Scripts

```bash
npm run dev      # dev server (http://localhost:5173)
npm run build    # production build → dist/
npm run preview  # preview production build locally
npm run lint     # ESLint check
```
