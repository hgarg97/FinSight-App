# FinSight App

AI-powered personal finance application with a Python FastAPI backend and React TypeScript frontend.

## Project Structure

```
FinSight-App/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py            # FastAPI app, CORS, lifespan (DB init)
│   │   ├── config.py          # pydantic-settings config from .env
│   │   ├── database.py        # SQLAlchemy engine, session, Base, get_db
│   │   ├── models/
│   │   │   └── user.py        # User ORM model
│   │   ├── schemas/
│   │   │   └── auth.py        # Pydantic request/response schemas
│   │   ├── services/
│   │   │   └── auth_service.py  # register, login, get_current_user
│   │   ├── routers/
│   │   │   └── auth.py        # /api/auth/* endpoints
│   │   └── utils/
│   │       └── security.py    # bcrypt hashing, JWT creation
│   ├── data/                  # SQLite database (gitignored)
│   ├── requirements.txt
│   ├── .env                   # local env vars (gitignored)
│   └── .env.example           # env var template
├── frontend/
│   ├── src/
│   │   ├── main.tsx           # React entry point
│   │   ├── App.tsx            # Root component, fetches /api/health
│   │   └── index.css          # Tailwind + Inter font
│   ├── index.html
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts         # Proxies /api → localhost:8000
│   ├── tailwind.config.js
│   └── postcss.config.js
├── Makefile
├── .gitignore
└── README.md
```

## Tech Stack

| Layer    | Technology                                              |
|----------|---------------------------------------------------------|
| Backend  | Python, FastAPI, SQLAlchemy, pydantic-settings          |
| Auth     | JWT (python-jose HS256), bcrypt password hashing        |
| Database | SQLite                                                  |
| Frontend | React 18, TypeScript, Vite, Tailwind CSS                |
| AI       | OpenAI API (planned)                                    |

## Getting Started

### Prerequisites

- Python 3.11+
- Node.js 18+

### Setup

Install all dependencies in one step:

```bash
make setup
```

### Running

Start both servers in separate terminals:

```bash
# Terminal 1 — backend on http://localhost:8000
make backend

# Terminal 2 — frontend on http://localhost:5173
make frontend
```

### Environment Variables

Copy `.env.example` to `.env` in the `backend/` directory and fill in your values:

```bash
cp backend/.env.example backend/.env
```

| Variable                     | Description                    | Default                        |
|------------------------------|--------------------------------|--------------------------------|
| `DATABASE_URL`               | SQLite database path           | `sqlite:///./data/finsight.db` |
| `SECRET_KEY`                 | JWT signing secret             | `change-me-in-production`      |
| `ALGORITHM`                  | JWT algorithm                  | `HS256`                        |
| `ACCESS_TOKEN_EXPIRE_MINUTES`| Token lifetime in minutes      | `1440` (24 hours)              |
| `OPENAI_API_KEY`             | OpenAI API key                 | `sk-xxx`                       |
| `LLM_MODEL`                  | OpenAI model name              | `gpt-4o`                       |
| `DEBUG`                      | Enable debug mode              | `true`                         |

## API

### Health

| Method | Endpoint      | Auth | Description  |
|--------|---------------|------|--------------|
| GET    | `/api/health` | —    | Health check |

### Authentication (`/api/auth`)

| Method | Endpoint            | Auth     | Description                        |
|--------|---------------------|----------|------------------------------------|
| POST   | `/api/auth/register`| —        | Register a new user (201)          |
| POST   | `/api/auth/login`   | —        | Login and receive a JWT            |
| GET    | `/api/auth/me`      | Bearer   | Get current user profile           |
| PUT    | `/api/auth/me`      | Bearer   | Update profile (name/currency/income) |

Interactive docs available at `http://localhost:8000/docs` when the backend is running.

## Sprint Progress

### Sprint 0 — Project Scaffold
- [x] FastAPI backend with health check endpoint
- [x] CORS configured for frontend dev server
- [x] pydantic-settings config loading from `.env`
- [x] Vite + React 18 + TypeScript frontend
- [x] Tailwind CSS with Inter font
- [x] `/api` proxy from frontend to backend
- [x] Makefile for `setup`, `backend`, `frontend` commands

### Sprint 1 — Database & Authentication
- [x] SQLite database via SQLAlchemy (engine, session, declarative base)
- [x] `User` model with UUID primary key, unique email/username, bcrypt password
- [x] JWT-based auth (HS256, 24-hour expiry) via python-jose
- [x] `POST /api/auth/register` — creates user, returns token (HTTP 201)
- [x] `POST /api/auth/login` — verifies credentials, returns token (HTTP 401 on failure)
- [x] `GET /api/auth/me` — returns authenticated user profile
- [x] `PUT /api/auth/me` — updates name, currency, monthly income
- [x] Duplicate email/username returns HTTP 409
