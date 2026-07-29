#React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

#React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

##Expanding the Oxlint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and Oxlint's TypeScript related rules in your project.
#SocialPilot - Social Media Scheduler & Campaign Management Platform

![Python](https://img.shields.io/badge/Python-3.12-blue)
![FastAPI](https://img.shields.io/badge/FastAPI-0.115-green)
![React](https://img.shields.io/badge/React-19-61DAFB)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791)
![License](https://img.shields.io/badge/License-MIT-green)

##Overview

SocialPilot is a full-stack web application designed to simplify social media management by providing a centralized platform for scheduling, managing, and monitoring content across multiple social media platforms.

The project is developed using **React** for the frontend and **FastAPI** for the backend, with **PostgreSQL** as the primary relational database. The current implementation establishes the project structure, database integration, frontend interface, and backend API foundation for future feature development.
#Current Features

##Backend
- FastAPI project structure
- REST API architecture
- PostgreSQL integration
- SQLAlchemy ORM configuration
- Alembic database migrations
- API testing setup
- Swagger API documentation

##Frontend
- React + Vite project setup
- Responsive UI structure
- Routing configuration
- Reusable component structure

##Database
- PostgreSQL configuration
- SQLAlchemy models
- Alembic migration support

---

#Planned Features

- User Registration
- User Authentication
- JWT-based Authorization
- Role-Based Access Control (RBAC)
- Social Media Account Integration
- Content Scheduling
- Multi-Platform Publishing
- Campaign Management
- Analytics Dashboard
- Notifications
- Reports & Export

#Technology Stack

##Frontend

- React.js
- Vite
- React Router
- Axios
- Tailwind CSS

##Backend

- FastAPI
- SQLAlchemy
- Alembic
- Pydantic
- Uvicorn

##Database

- PostgreSQL
- MongoDB (Planned)

##Development Tools

- Git
- GitHub
- VS Code
- Postman
- 
#Project Structure

SocialPilot/

├── frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── vite.config.js
│
├── backend/
│   ├── app/
│   ├── alembic/
│   ├── tests/
│   ├── requirements.txt
│   └── alembic.ini
│
├── README.md
└── .gitignore

#Installation

##Clone Repository

git clone https://github.com/<your-username>/Schedular--Team-2.git

cd Schedular--Team-2
#Backend Setup
cd backend

python -m venv venv
##Activate Virtual Environment

Windows

venv\Scripts\activate


Linux / macOS

source venv/bin/activate


Install dependencies

pip install -r requirements.txt

#Configure Environment

Create a `.env` file inside the backend directory.
env
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_SERVER=localhost
POSTGRES_PORT=5432
POSTGRES_DB=socialpilot

MONGO_SERVER=localhost
MONGO_PORT=27017
MONGO_USER=admin
MONGO_PASSWORD=adminpassword
MONGO_DB=socialpilot_mongo

#Database Migration

Run the latest database migrations.
alembic upgrade head
Create a new migration after model changes.
alembic revision --autogenerate -m "Migration Name"
#Running the Backend
uvicorn app.main:app --reload

Backend URL

http://127.0.0.1:8000

Swagger UI
#http://127.0.0.1:8000/docs
ReDoc
http://127.0.0.1:8000/redoc


#Frontend Setup

cd frontend

npm install

npm run dev

Frontend URL

http://localhost:5173

#Available API Endpoints

| Method | Endpoint | Description |
|---------|----------|-------------|
| GET | `/` | Backend Health Check |
| POST | `/api/v1/auth/register` | Register API *(placeholder)* |
| POST | `/api/v1/auth/login` | Login API *(placeholder)* |

Interactive API documentation is available at:

http://127.0.0.1:8000/docs


#API Testing

Run the API test script.

python tests/test_api.py


Current expected output:

GET /                          200 OK
POST /register                 Pending Implementation
POST /login                    Pending Implementation


#Database

The application currently uses **PostgreSQL** as the primary relational database.

Database management includes:

- SQLAlchemy ORM
- Alembic migrations
- PostgreSQL integration

MongoDB configuration has been added for future feature expansion.


#Roadmap

- Complete Authentication Module
- JWT Security
- User Dashboard
- Social Media Integration
- Post Scheduling
- Campaign Management
- Analytics & Reports
- Docker Support
- Cloud Deployment (AWS / Azure)


#License

This project is developed for educational purposes.


#Acknowledgements

- FastAPI
- React
- PostgreSQL
- SQLAlchemy
- Alembic
- Vite

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
