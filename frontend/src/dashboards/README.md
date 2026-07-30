# Dashboard grouping

This folder groups the dashboard code by role so the frontend is easier to navigate without changing runtime behavior.

- `business/` re-exports the business dashboard entry and its business-only pages.
- `marketing/` re-exports the marketing dashboard entry and the `/dashboard/mkt/*` pages.
- `creator/` re-exports the creator dashboard entry.
- `admin/` re-exports the admin dashboard entry.
- `shared/` re-exports dashboard-wide pieces such as the layout, guard, and shared pages.

The original page files still live in their current locations, so imports can be migrated gradually.