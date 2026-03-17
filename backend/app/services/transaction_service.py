"""Transaction business logic: CRUD and monthly summary aggregations."""

import uuid
from datetime import date
from typing import Optional

from fastapi import HTTPException, status
from sqlalchemy import and_, extract, func
from sqlalchemy.orm import Session

from ..models.transaction import Transaction
from ..schemas.transaction import (
    CategoryAmount,
    TransactionCreate,
    TransactionSummary,
    TransactionUpdate,
)


def create_transaction(db: Session, user_id: str, data: TransactionCreate) -> Transaction:
    """Create and persist a new transaction for *user_id*."""
    txn = Transaction(
        id=str(uuid.uuid4()),
        user_id=user_id,
        date=data.date,
        merchant=data.merchant,
        normalized_merchant=data.merchant.strip().lower(),
        amount_total=data.amount_total,
        user_share_amount=data.user_share_amount,
        currency=data.currency,
        account_id=data.account_id,
        account_name=data.account_name,
        transaction_type=data.transaction_type,
        category=data.category,
        subcategory=data.subcategory,
        payment_method=data.payment_method,
        is_split=data.is_split,
        split_details_json=data.split_details_json,
        is_reimbursable=data.is_reimbursable,
        notes=data.notes,
    )
    db.add(txn)
    db.commit()
    db.refresh(txn)
    return txn


def get_transactions(
    db: Session,
    user_id: str,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    category: Optional[str] = None,
    account_id: Optional[str] = None,
    transaction_type: Optional[str] = None,
    search: Optional[str] = None,
    is_split: Optional[bool] = None,
    is_reimbursable: Optional[bool] = None,
    subscription_flag: Optional[bool] = None,
    page: int = 1,
    per_page: int = 50,
    sort_by: str = "date",
    sort_order: str = "desc",
) -> tuple[list[Transaction], int]:
    """Return a paginated, filtered list of transactions and total count.

    Returns (items, total_count).
    """
    q = db.query(Transaction).filter(Transaction.user_id == user_id)

    if start_date:
        q = q.filter(Transaction.date >= start_date)
    if end_date:
        q = q.filter(Transaction.date <= end_date)
    if category:
        q = q.filter(Transaction.category == category)
    if account_id:
        q = q.filter(Transaction.account_id == account_id)
    if transaction_type:
        q = q.filter(Transaction.transaction_type == transaction_type)
    if search:
        q = q.filter(Transaction.normalized_merchant.ilike(f"%{search.lower()}%"))
    if is_split is not None:
        q = q.filter(Transaction.is_split == is_split)
    if is_reimbursable is not None:
        q = q.filter(Transaction.is_reimbursable == is_reimbursable)
    if subscription_flag is not None:
        q = q.filter(Transaction.subscription_flag == subscription_flag)

    total = q.count()

    sort_col = getattr(Transaction, sort_by, Transaction.date)
    if sort_order == "asc":
        q = q.order_by(sort_col.asc())
    else:
        q = q.order_by(sort_col.desc())

    items = q.offset((page - 1) * per_page).limit(per_page).all()
    return items, total


def get_transaction(db: Session, user_id: str, txn_id: str) -> Transaction:
    """Return a single transaction, verifying ownership.

    Raises HTTP 404 if not found, HTTP 403 if owned by another user.
    """
    txn = db.query(Transaction).filter(Transaction.id == txn_id).first()
    if not txn:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Transaction not found")
    if txn.user_id != user_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")
    return txn


def update_transaction(
    db: Session, user_id: str, txn_id: str, data: TransactionUpdate
) -> Transaction:
    """Apply partial updates to a transaction, verifying ownership."""
    txn = get_transaction(db, user_id, txn_id)

    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(txn, field, value)

    # Re-derive normalized_merchant if merchant name changed
    if data.merchant is not None:
        txn.normalized_merchant = data.merchant.strip().lower()

    db.commit()
    db.refresh(txn)
    return txn


def delete_transaction(db: Session, user_id: str, txn_id: str) -> None:
    """Permanently delete a transaction, verifying ownership."""
    txn = get_transaction(db, user_id, txn_id)
    db.delete(txn)
    db.commit()


def get_monthly_summary(
    db: Session, user_id: str, month: int, year: int
) -> TransactionSummary:
    """Aggregate income, expenses, and per-category totals for a given month."""
    base = db.query(Transaction).filter(
        Transaction.user_id == user_id,
        extract("month", Transaction.date) == month,
        extract("year", Transaction.date) == year,
    )

    income_row = base.filter(Transaction.transaction_type == "income").with_entities(
        func.coalesce(func.sum(Transaction.user_share_amount), 0.0)
    ).scalar()

    expense_row = base.filter(
        Transaction.transaction_type.in_(["expense", "transfer"])
    ).with_entities(
        func.coalesce(func.sum(Transaction.user_share_amount), 0.0)
    ).scalar()

    by_cat = (
        base.filter(Transaction.transaction_type.in_(["expense", "transfer"]))
        .with_entities(Transaction.category, func.sum(Transaction.user_share_amount).label("total"))
        .group_by(Transaction.category)
        .order_by(func.sum(Transaction.user_share_amount).desc())
        .all()
    )

    txn_count = base.count()

    total_income = float(income_row or 0.0)
    total_expenses = float(expense_row or 0.0)

    return TransactionSummary(
        total_income=total_income,
        total_expenses=total_expenses,
        net=total_income - total_expenses,
        by_category=[CategoryAmount(category=row.category, amount=float(row.total)) for row in by_cat],
        transaction_count=txn_count,
    )
