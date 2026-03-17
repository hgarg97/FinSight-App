"""Transaction endpoints: CRUD + monthly summary."""

from datetime import date
from typing import Optional

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from ..database import get_db
from ..models.user import User
from ..schemas.transaction import (
    TransactionCreate,
    TransactionResponse,
    TransactionSummary,
    TransactionUpdate,
)
from ..services.auth_service import get_current_user
from ..services.transaction_service import (
    create_transaction,
    delete_transaction,
    get_monthly_summary,
    get_transaction,
    get_transactions,
    update_transaction,
)

router = APIRouter(prefix="/api/transactions", tags=["transactions"])


@router.get("/summary", response_model=TransactionSummary)
def monthly_summary(
    month: int = Query(..., ge=1, le=12),
    year: int = Query(..., ge=2000),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> TransactionSummary:
    """Return aggregated income, expenses and per-category breakdown for a month."""
    return get_monthly_summary(db, current_user.id, month, year)


@router.get("", response_model=dict)
def list_transactions(
    start_date: Optional[date] = Query(None),
    end_date: Optional[date] = Query(None),
    category: Optional[str] = Query(None),
    account_id: Optional[str] = Query(None),
    transaction_type: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    is_split: Optional[bool] = Query(None),
    is_reimbursable: Optional[bool] = Query(None),
    subscription_flag: Optional[bool] = Query(None),
    page: int = Query(1, ge=1),
    per_page: int = Query(50, ge=1, le=200),
    sort_by: str = Query("date", pattern="^(date|amount_total|merchant)$"),
    sort_order: str = Query("desc", pattern="^(asc|desc)$"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> dict:
    """Return a paginated, filterable list of the current user's transactions."""
    items, total = get_transactions(
        db,
        user_id=current_user.id,
        start_date=start_date,
        end_date=end_date,
        category=category,
        account_id=account_id,
        transaction_type=transaction_type,
        search=search,
        is_split=is_split,
        is_reimbursable=is_reimbursable,
        subscription_flag=subscription_flag,
        page=page,
        per_page=per_page,
        sort_by=sort_by,
        sort_order=sort_order,
    )
    return {
        "items": [TransactionResponse.model_validate(t) for t in items],
        "total": total,
        "page": page,
        "per_page": per_page,
    }


@router.get("/{txn_id}", response_model=TransactionResponse)
def get_one(
    txn_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> TransactionResponse:
    """Return a single transaction by ID."""
    return get_transaction(db, current_user.id, txn_id)


@router.post("", response_model=TransactionResponse, status_code=status.HTTP_201_CREATED)
def create(
    data: TransactionCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> TransactionResponse:
    """Create a new transaction for the current user."""
    return create_transaction(db, current_user.id, data)


@router.put("/{txn_id}", response_model=TransactionResponse)
def update(
    txn_id: str,
    data: TransactionUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> TransactionResponse:
    """Update a transaction owned by the current user."""
    return update_transaction(db, current_user.id, txn_id, data)


@router.delete("/{txn_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete(
    txn_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> None:
    """Delete a transaction owned by the current user."""
    delete_transaction(db, current_user.id, txn_id)
