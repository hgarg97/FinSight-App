# FinSight App

<img src="frontend/src/assets/logo-full.png" alt="FinSight" height="48" />

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
│   │   ├── api/
│   │   │   ├── client.ts      # Axios instance with Bearer token interceptor
│   │   │   └── auth.ts        # register, login, getMe, updateProfile calls
│   │   ├── pages/
│   │   │   └── auth/
│   │   │       ├── LoginPage.tsx     # Two-column login page
│   │   │       └── RegisterPage.tsx  # Two-column register page
│   │   ├── store/
│   │   │   └── authStore.ts   # Zustand auth state (user, token, isAuthenticated)
│   │   ├── types/
│   │   │   └── index.ts       # User, AuthResponse, ApiError types
│   │   ├── main.tsx           # React entry point
│   │   ├── App.tsx            # React Router — /login, /register, / routes
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
| Frontend | React 18, TypeScript, Vite, Tailwind CSS, React Router  |
| State    | Zustand                                                 |
| HTTP     | Axios                                                   |
| AI       | OpenAI API (planned)                                    |

## Getting Started

### Prerequisites

- Python 3.11+
- Node.js 18+

### Setup

**1. Clone and enter the repo:**

```bash
git clone <repo-url>
cd FinSight-App
```

**2. Configure environment variables:**

```bash
cp backend/.env.example backend/.env
# Edit backend/.env and set SECRET_KEY at minimum
```

**3. Install all dependencies:**

```bash
make setup
```

This creates a Python virtualenv in `backend/venv/`, installs pip packages, and runs `npm install` for the frontend.

### Running

Start both servers in separate terminals:

```bash
# Terminal 1 — backend API on http://localhost:8000
make backend

# Terminal 2 — frontend dev server on http://localhost:5173
make frontend
```

Then open [http://localhost:5173](http://localhost:5173) in your browser.

- The frontend proxies all `/api/*` requests to the backend — no manual CORS setup needed in dev.
- Interactive API docs are available at [http://localhost:8000/docs](http://localhost:8000/docs).

### Manual setup (without Make)

If you prefer running commands directly:

```bash
# Backend
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000

# Frontend (new terminal)
cd frontend
npm install
npm run dev
```

### Environment Variables

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

### Sprint 2 — Auth UI
- [x] Axios client with Bearer token request interceptor and 401 redirect
- [x] Zustand auth store — login, register, logout, fetchUser, token persistence
- [x] `User`, `AuthResponse`, `ApiError` TypeScript types
- [x] Login page — two-column layout (light left / dark right), email + password with show/hide toggle
- [x] Register page — full name, email, username, password, confirm password with match validation
- [x] Inline field validation — required fields, email format, password min 8 chars
- [x] Loading spinner on submit, error messages on API failure
- [x] React Router setup — `/login`, `/register`, token-aware redirects
- [x] Responsive — right panel hidden below `md` breakpoint

### Sprint 3 — Authenticated App Shell
- [x] `ProtectedRoute` — token check, `fetchUser()` on load, 401 logout redirect, centered spinner
- [x] `AppShell` — full-viewport flex layout, sticky sidebar + scrollable main content
- [x] `Sidebar` — brand logo, 8 nav items + Settings with active state (Linear-style), user info, logout
- [x] `TopBar` — 56px bar with dynamic page title derived from current route, notification bell
- [x] `Logo` component — uses `logo-icon.png`; sidebar uses full `logo-full.png`
- [x] 9 placeholder pages — Dashboard, Transactions, Budget, Trips, Net Worth, Subscriptions, Insights, AI Advisor, Settings
- [x] Nested React Router layout — all app routes render inside `AppShell` via `<Outlet />`
