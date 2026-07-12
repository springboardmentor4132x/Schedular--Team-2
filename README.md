# 🚀 SocialPilot - Social Media Scheduler & Campaign Management Platform

![Python](https://img.shields.io/badge/Python-3.12-blue)
![FastAPI](https://img.shields.io/badge/FastAPI-0.115-green)
![React](https://img.shields.io/badge/React-19-61DAFB)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791)
![License](https://img.shields.io/badge/License-MIT-green)

## 📖 Overview

SocialPilot is a full-stack web application designed to simplify social media management by providing a centralized platform for scheduling, managing, and monitoring content across multiple social media platforms.

The project is developed using **React** for the frontend and **FastAPI** for the backend, with **PostgreSQL** as the primary relational database. The current implementation establishes the project structure, database integration, frontend interface, and backend API foundation for future feature development.

---

# ✨ Current Features

### Backend
- FastAPI project structure
- REST API architecture
- PostgreSQL integration
- SQLAlchemy ORM configuration
- Alembic database migrations
- API testing setup
- Swagger API documentation

### Frontend
- React + Vite project setup
- Responsive UI structure
- Routing configuration
- Reusable component structure

### Database
- PostgreSQL configuration
- SQLAlchemy models
- Alembic migration support

---

# 🚧 Planned Features

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

---

# 🛠 Technology Stack

## Frontend

- React.js
- Vite
- React Router
- Axios
- Tailwind CSS

## Backend

- FastAPI
- SQLAlchemy
- Alembic
- Pydantic
- Uvicorn

## Database

- PostgreSQL
- MongoDB (Planned)

## Development Tools

- Git
- GitHub
- VS Code
- Postman

---

# 📂 Project Structure

```
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
```

---

# ⚙ Installation

## Clone Repository

```bash
git clone https://github.com/<your-username>/Schedular--Team-2.git

cd Schedular--Team-2
```

---

# 🖥 Backend Setup

```bash
cd backend

python -m venv venv
```

### Activate Virtual Environment

Windows

```bash
venv\Scripts\activate
```

Linux / macOS

```bash
source venv/bin/activate
```

Install dependencies

```bash
pip install -r requirements.txt
```

---

# 🗄 Configure Environment

Create a `.env` file inside the backend directory.

```env
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
```

---

# 🔄 Database Migration

Run the latest database migrations.

```bash
alembic upgrade head
```

Create a new migration after model changes.

```bash
alembic revision --autogenerate -m "Migration Name"
```

---

# ▶ Running the Backend

```bash
uvicorn app.main:app --reload
```

Backend URL

```
http://127.0.0.1:8000
```

Swagger UI

```
http://127.0.0.1:8000/docs
```

ReDoc

```
http://127.0.0.1:8000/redoc
```

---

# 💻 Frontend Setup

```bash
cd frontend

npm install

npm run dev
```

Frontend URL

```
http://localhost:5173
```

---

# 📡 Available API Endpoints

| Method | Endpoint | Description |
|---------|----------|-------------|
| GET | `/` | Backend Health Check |
| POST | `/api/v1/auth/register` | Register API *(placeholder)* |
| POST | `/api/v1/auth/login` | Login API *(placeholder)* |

Interactive API documentation is available at:

```
http://127.0.0.1:8000/docs
```

---

# 🧪 API Testing

Run the API test script.

```bash
python tests/test_api.py
```

Current expected output:

```
GET /                          200 OK
POST /register                 Pending Implementation
POST /login                    Pending Implementation
```

---

# 📊 Database

The application currently uses **PostgreSQL** as the primary relational database.

Database management includes:

- SQLAlchemy ORM
- Alembic migrations
- PostgreSQL integration

MongoDB configuration has been added for future feature expansion.

---

# 📌 Roadmap

- Complete Authentication Module
- JWT Security
- User Dashboard
- Social Media Integration
- Post Scheduling
- Campaign Management
- Analytics & Reports
- Docker Support
- Cloud Deployment (AWS / Azure)

---

# 📄 License

This project is developed for educational purposes.

---

# 🙏 Acknowledgements

- FastAPI
- React
- PostgreSQL
- SQLAlchemy
- Alembic
- Vite