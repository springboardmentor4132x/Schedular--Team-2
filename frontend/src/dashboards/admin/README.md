# Admin Dashboard Module

This module encapsulates all code related to the Admin Dashboard domain.

## Folder Structure

- `components/` — Domain-specific UI components for the Admin Dashboard.
- `layouts/` — Layout shells (`DashboardLayout`, `Sidebar`).
- `pages/` — Admin page components (`Dashboard`, `Calendar`, `Analytics`, `Team`, `SocialAccounts`, `AdminPlaceholder`).
- `hooks/` — Custom React hooks for admin features.
- `context/` — Context providers specific to the admin module.
- `services/` — API service functions for admin endpoints.
- `utils/` — Utility functions for admin features.
- `constants/` — Domain constants.
- `mock/` — Mock datasets for admin features.
- `types/` — Type definitions / JSDoc specifications.
- `routes/` — Route definitions for the admin section (`adminRoutes.jsx`).

## Usage

Import pages or routes from the module entry point:

```javascript
import { AdminRoutes, DashboardLayout, Dashboard } from './admin-dashboard'
```
