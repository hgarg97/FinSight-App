# FinSight App

AI-powered personal finance application with a Python FastAPI backend and React TypeScript frontend.

## Project Structure

```
FinSight-App/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py        # FastAPI app + CORS + health endpoint
│   │   └── config.py      # pydantic-settings config from .env
│   ├── requirements.txt
│   ├── .env               # local env vars (gitignored)
│   └── .env.example       # env var template
├── frontend/
│   ├── src/
│   │   ├── main.tsx       # React entry point
│   │   ├── App.tsx        # Root component, fetches /api/health
│   │   └── index.css      # Tailwind + Inter font
│   ├── index.html
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts     # Proxies /api → localhost:8000
│   ├── tailwind.config.js
│   └── postcss.config.js
├── Makefile
├── .gitignore
└── README.md
```

## Tech Stack

| Layer    | Technology                          |
|----------|-------------------------------------|
| Backend  | Python, FastAPI, pydantic-settings  |
| Frontend | React 18, TypeScript, Vite, Tailwind CSS |
| Database | SQLite (planned)                    |
| AI       | OpenAI API (planned)                |

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

| Variable        | Description                  | Default                          |
|-----------------|------------------------------|----------------------------------|
| `DATABASE_URL`  | SQLite database path         | `sqlite:///./data/finsight.db`   |
| `SECRET_KEY`    | App secret key               | `change-me`                      |
| `OPENAI_API_KEY`| OpenAI API key               | `sk-xxx`                         |
| `DEBUG`         | Enable debug mode            | `true`                           |

## API

| Method | Endpoint      | Description         |
|--------|---------------|---------------------|
| GET    | `/api/health` | Health check        |

## Sprint Progress

### Sprint 0 — Project Scaffold
- [x] FastAPI backend with health check endpoint
- [x] CORS configured for frontend dev server
- [x] pydantic-settings config loading from `.env`
- [x] Vite + React 18 + TypeScript frontend
- [x] Tailwind CSS with Inter font
- [x] `/api` proxy from frontend to backend
- [x] Makefile for `setup`, `backend`, `frontend` commands
