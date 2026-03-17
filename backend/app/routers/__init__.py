"""FastAPI routers package."""

from .auth import router as auth_router
from .accounts import router as accounts_router
from .categories import router as categories_router
from .transactions import router as transactions_router
from .documents import router as documents_router

__all__ = [
    "auth_router",
    "accounts_router",
    "categories_router",
    "transactions_router",
    "documents_router",
]
