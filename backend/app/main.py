"""FinSight FastAPI application entry point."""

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .database import Base, SessionLocal, engine
from .routers import auth_router, accounts_router, categories_router, transactions_router, documents_router
from .utils.seed_data import seed_categories


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Create database tables and seed default data on startup."""
    # Import all models so SQLAlchemy registers them before create_all
    from .models import User, Account, Category, Transaction, Document  # noqa: F401

    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        seed_categories(db)
    finally:
        db.close()

    yield


app = FastAPI(title="FinSight API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(accounts_router)
app.include_router(categories_router)
app.include_router(transactions_router)
app.include_router(documents_router)


@app.get("/api/health")
def health() -> dict:
    """Health-check endpoint — always returns 200 OK."""
    return {"status": "ok", "app": "FinSight"}
