"""Budget business logic."""

from sqlalchemy import extract, func
from sqlalchemy.orm import Session

from ..models.budget import Budget
from ..models.transaction import Transaction


def set_budget(
    db: Session,
    user_id: str,
    category_id: str,
    category_name: str,
    month: int,
    year: int,
    amount: float,
) -> Budget:
    """Create or update a budget allocation."""
    existing = (
        db.query(Budget)
        .filter(
            Budget.user_id == user_id,
            Budget.category_id == category_id,
            Budget.month == month,
            Budget.year == year,
        )
        .first()
    )
    if existing:
        existing.allocated_amount = amount
        existing.category_name = category_name
        db.commit()
        db.refresh(existing)
        return existing

    budget = Budget(
        user_id=user_id,
        category_id=category_id,
        category_name=category_name,
        month=month,
        year=year,
        allocated_amount=amount,
    )
    db.add(budget)
    db.commit()
    db.refresh(budget)
    return budget


def get_budgets(db: Session, user_id: str, month: int, year: int) -> list[Budget]:
    """Return all budgets for a given month/year."""
    return (
        db.query(Budget)
        .filter(
            Budget.user_id == user_id,
            Budget.month == month,
            Budget.year == year,
        )
        .all()
    )


def _get_spending_by_category(
    db: Session, user_id: str, month: int, year: int
) -> dict[str, float]:
    """Sum user_share_amount per category for non-reimbursable expense transactions."""
    rows = (
        db.query(Transaction.category, func.sum(Transaction.user_share_amount))
        .filter(
            Transaction.user_id == user_id,
            Transaction.transaction_type == "expense",
            Transaction.is_reimbursable == False,  # noqa: E712
            extract("month", Transaction.date) == month,
            extract("year", Transaction.date) == year,
        )
        .group_by(Transaction.category)
        .all()
    )
    return {(cat or "Uncategorized"): float(amount) for cat, amount in rows}


def get_budget_summary(db: Session, user_id: str, month: int, year: int) -> dict:
    """Return full budget summary for the month including actuals."""
    budgets = get_budgets(db, user_id, month, year)
    spending = _get_spending_by_category(db, user_id, month, year)

    total_income = (
        db.query(func.sum(Transaction.user_share_amount))
        .filter(
            Transaction.user_id == user_id,
            Transaction.transaction_type == "income",
            extract("month", Transaction.date) == month,
            extract("year", Transaction.date) == year,
        )
        .scalar()
        or 0.0
    )

    budgeted_categories = {b.category_name for b in budgets}

    unbudgeted_spending = sum(
        amt for cat, amt in spending.items() if cat not in budgeted_categories
    )

    items = []
    total_budgeted = 0.0
    total_spent = 0.0

    for b in budgets:
        spent = spending.get(b.category_name, 0.0)
        total_budgeted += b.allocated_amount
        total_spent += spent
        items.append(
            {
                "id": b.id,
                "category_id": b.category_id,
                "category_name": b.category_name,
                "allocated_amount": b.allocated_amount,
                "spent": spent,
                "remaining": b.allocated_amount - spent,
            }
        )

    return {
        "month": month,
        "year": year,
        "total_income": float(total_income),
        "total_budgeted": total_budgeted,
        "total_spent": total_spent,
        "unbudgeted_spending": unbudgeted_spending,
        "items": items,
    }


def copy_budgets(
    db: Session,
    user_id: str,
    from_month: int,
    from_year: int,
    to_month: int,
    to_year: int,
) -> list[Budget]:
    """Copy budget allocations from one month to another."""
    source = get_budgets(db, user_id, from_month, from_year)
    return [
        set_budget(
            db,
            user_id=user_id,
            category_id=b.category_id,
            category_name=b.category_name,
            month=to_month,
            year=to_year,
            amount=b.allocated_amount,
        )
        for b in source
    ]


def delete_budget(db: Session, user_id: str, budget_id: str) -> bool:
    """Delete a budget by id. Returns True if deleted, False if not found."""
    budget = (
        db.query(Budget)
        .filter(Budget.id == budget_id, Budget.user_id == user_id)
        .first()
    )
    if not budget:
        return False
    db.delete(budget)
    db.commit()
    return True
