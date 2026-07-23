# OrbitSocial — Social Media Scheduler
### Milestone 1 · Frontend Only · MCA Internship Project

> **Plan Once. Publish Everywhere.**

A premium social media scheduling frontend built with React, Vite, and Tailwind CSS v4.
Clean component structure, full dark/light mode, responsive on all screen sizes.

---

## Quick Start

```bash
cd frontend
npm install
npm run dev
```

Open **http://localhost:5173** in your browser.

---

## Pages

| Route | Page | Description |
|---|---|---|
| `/` | Landing | Marketing homepage with hero, platforms, features, how-it-works |
| `/role-selection` | Role Selection | Choose Creator / Business / Agency / Marketing Team |
| `/register` | Register | Full registration form with validation and password strength |
| `/login` | Login | Sign-in card with Google OAuth UI and field validation |
| `/terms` | Terms | Terms & Conditions page |

---

## Tech Stack

| Technology | Purpose |
|---|---|
| React 19 + Vite | Framework and dev server |
| React Router DOM v7 | Client-side routing |
| Tailwind CSS v4 | Utility-first styling |
| React Icons | Icons (hi2, fa6, fi) |
| Google Fonts | Plus Jakarta Sans + Inter |

---

## File Structure

```
frontend/src/
  components/
    Button.jsx        Reusable button — primary / secondary / ghost variants
    Footer.jsx        Site footer with links and social icons
    Input.jsx         Labeled input with icon slots and error state
    Logo.jsx          SVG OrbitSocial logo (full + icon variants)
    Navbar.jsx        Sticky nav with mobile hamburger menu
    ThemeToggle.jsx   Sun / moon theme switch button
    Toast.jsx         Success / error / warning notification
  pages/
    Landing.jsx       Full marketing homepage
    Login.jsx         Sign-in page with glassmorphism card
    Register.jsx      Registration form with password strength indicator
    RoleSelection.jsx Role picker — 4 interactive cards
    Terms.jsx         Scrollable Terms & Conditions
  App.jsx             Routes + global theme state
  index.css           Tailwind import + design tokens + utility classes
  main.jsx            Entry point with theme pre-load
```

---

## Color System

| Token | Light Mode | Dark Mode |
|---|---|---|
| Background | `#FAFAFA` | `#111827` |
| Card | `#FFFFFF` | `#1F2937` |
| Primary Text | `#1F2937` | `#F9FAFB` |
| Secondary Text | `#6B7280` | `#D1D5DB` |
| Primary | `#7C3AED` | `#C084FC` |
| Secondary | `#A855F7` | `#A855F7` |
| Accent | `#F59E0B` | `#FBBF24` |
| Border | `#E5E7EB` | `#374151` |

---

## Supported Platforms

Instagram · Facebook · LinkedIn · X (Twitter) · YouTube · Pinterest

---

## Features

- **Dark / Light mode** — instant toggle, persisted in `localStorage`, zero flash on load
- **Responsive** — mobile, tablet and desktop layouts on every page
- **Form validation** — real-time client-side validation with clear error messages
- **Password strength** — 5-level colour indicator on registration
- **Show / Hide password** — toggle on all password fields
- **Role-based registration** — role selected once on `/role-selection`, carried to `/register` via URL param and shown as a read-only badge
- **Accessible** — ARIA labels, `aria-invalid`, `aria-pressed`, `role="alert"`, keyboard focus rings

---

## Backend Integration

When the backend is ready, replace the `setTimeout` placeholders in:

- `Login.jsx` — swap with `authService.login({ email, password })`
- `Register.jsx` — swap with `authService.register(form)`

Then add a `.env` file:

```
VITE_API_URL=http://localhost:5000/api
```

---

## Available Scripts

```bash
npm run dev      # Start development server (http://localhost:5173)
npm run build    # Production build → dist/
npm run preview  # Preview production build locally
npm run lint     # ESLint check
```
