# Creator Dashboard Module

This module encapsulates all code related to the Creator Dashboard domain.

## Folder Structure

- `components/` — Domain-specific UI components for Creator Dashboard.
- `layouts/` — Creator layout shells (`CreatorLayout`, `CreatorSidebar`).
- `pages/` — Creator page components (`CreatorDashboard`, `ContentScheduling`, `PublishingCalendar`, `MyPosts`, `CreatorPlaceholder`).
- `hooks/` — Custom React hooks for creator features.
- `context/` — Context providers specific to the creator module.
- `services/` — API service functions for creator endpoints.
- `utils/` — Utility functions for creator features.
- `constants/` — Domain constants.
- `mock/` — Mock datasets for creator features.
- `types/` — Type definitions / JSDoc specifications.
- `routes/` — Route definitions for creator section (`creatorRoutes.jsx`).

## Usage

Import pages or routes from the module entry point:

```javascript
import { CreatorRoutes, CreatorLayout, CreatorDashboard } from './creator-dashboard'
```
