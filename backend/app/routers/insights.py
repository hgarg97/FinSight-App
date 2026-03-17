"""Insights / dashboard aggregation API routes."""

from fastapi import APIRouter, Depends
from sqlalchemy import and_, extract, func, or_
from sqlalchemy.orm import Session

from ..database import get_db
from ..models.budget import Budget
from ..models.category import Category
from ..models.transaction import Transaction
from ..models.user import User
from ..services.auth_service import get_current_user

router = APIRouter(prefix="/api/insights", tags=["insights"])

PALETTE = [
    "#6366F1", "#F59E0B", "#10B981", "#EC4899",
    "#3B82F6", "#EF4444", "#8B5CF6", "#06B6D4",
    "#84CC16", "#F97316",
]

MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
               "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]


def _prev_months(month: int, year: int, n: int = 6) -> list[tuple[int, int]]:
    """Return (month, year) tuples for the last n months ending at the given month."""
    result = []
    m, y = month, year
    for _ in range(n):
        result.append((m, y))
        m -= 1
        if m == 0:
            m = 12
            y -= 1
    return list(reversed(result))


@router.get("/dashboard")
def get_dashboard(
    month: int,
    year: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Return a single aggregated dashboard payload for the given month/year."""
    user_id = current_user.id

    # ── Metrics ─────────────────────────────────────────────────────────────
    monthly_income = (
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

    total_spent = (
        db.query(func.sum(Transaction.user_share_amount))
        .filter(
            Transaction.user_id == user_id,
            Transaction.transaction_type == "expense",
            Transaction.is_reimbursable == False,  # noqa: E712
            extract("month", Transaction.date) == month,
            extract("year", Transaction.date) == year,
        )
        .scalar()
        or 0.0
    )

    transaction_count = (
        db.query(func.count(Transaction.id))
        .filter(
            Transaction.user_id == user_id,
            extract("month", Transaction.date) == month,
            extract("year", Transaction.date) == year,
        )
        .scalar()
        or 0
    )

    savings_rate = (
        round((float(monthly_income) - float(total_spent)) / float(monthly_income) * 100, 1)
        if monthly_income > 0
        else 0.0
    )

    # ── Category color lookup ────────────────────────────────────────────────
    categories = (
        db.query(Category)
        .filter(
            or_(Category.user_id == user_id, Category.user_id.is_(None))
        )
        .all()
    )
    color_map: dict[str, str] = {c.name: c.color for c in categories if c.color}

    # ── Spending by category (current month) ────────────────────────────────
    cat_rows = (
        db.query(Transaction.category, func.sum(Transaction.user_share_amount))
        .filter(
            Transaction.user_id == user_id,
            Transaction.transaction_type == "expense",
            Transaction.is_reimbursable == False,  # noqa: E712
            extract("month", Transaction.date) == month,
            extract("year", Transaction.date) == year,
        )
        .group_by(Transaction.category)
        .order_by(func.sum(Transaction.user_share_amount).desc())
        .all()
    )

    spending_by_category = []
    spending_map: dict[str, float] = {}
    for i, (cat, amount) in enumerate(cat_rows):
        cat_name = cat or "Uncategorized"
        spending_map[cat_name] = float(amount)
        color = color_map.get(cat_name) or PALETTE[i % len(PALETTE)]
        spending_by_category.append({
            "category": cat_name,
            "amount": float(amount),
            "color": color,
        })

    # ── Spending trend (last 6 months) ───────────────────────────────────────
    months_range = _prev_months(month, year, 6)
    month_conditions = or_(*[
        and_(
            extract("month", Transaction.date) == m,
            extract("year", Transaction.date) == y,
        )
        for m, y in months_range
    ])

    trend_rows = (
        db.query(
            extract("month", Transaction.date).label("m"),
            extract("year", Transaction.date).label("y"),
            func.sum(Transaction.user_share_amount).label("total"),
        )
        .filter(
            Transaction.user_id == user_id,
            Transaction.transaction_type == "expense",
            Transaction.is_reimbursable == False,  # noqa: E712
            month_conditions,
        )
        .group_by("m", "y")
        .all()
    )

    trend_map = {(int(r.m), int(r.y)): float(r.total) for r in trend_rows}
    spending_trend = [
        {
            "month": MONTH_NAMES[m - 1],
            "year": y,
            "amount": trend_map.get((m, y), 0.0),
        }
        for m, y in months_range
    ]

    # ── Recent transactions (last 5) ─────────────────────────────────────────
    recent_txns = (
        db.query(Transaction)
        .filter(Transaction.user_id == user_id)
        .order_by(Transaction.date.desc(), Transaction.created_at.desc())
        .limit(5)
        .all()
    )

    def _txn_dict(t: Transaction) -> dict:
        return {
            "id": t.id,
            "date": t.date.isoformat(),
            "merchant": t.merchant,
            "amount_total": t.amount_total,
            "user_share_amount": t.user_share_amount,
            "category": t.category,
            "transaction_type": t.transaction_type,
            "currency": t.currency,
        }

    # ── Budget status (top 5 by allocated) ───────────────────────────────────
    top_budgets = (
        db.query(Budget)
        .filter(
            Budget.user_id == user_id,
            Budget.month == month,
            Budget.year == year,
        )
        .order_by(Budget.allocated_amount.desc())
        .limit(5)
        .all()
    )

    budget_status = []
    for i, b in enumerate(top_budgets):
        color = color_map.get(b.category_name) or PALETTE[i % len(PALETTE)]
        spent = spending_map.get(b.category_name, 0.0)
        budget_status.append({
            "category_name": b.category_name,
            "allocated": b.allocated_amount,
            "spent": spent,
            "color": color,
        })

    # ── Top merchants (top 5 by total spend, current month) ──────────────────
    merchant_rows = (
        db.query(
            func.coalesce(Transaction.normalized_merchant, Transaction.merchant).label("merchant"),
            func.sum(Transaction.user_share_amount).label("amount"),
            func.count(Transaction.id).label("count"),
        )
        .filter(
            Transaction.user_id == user_id,
            Transaction.transaction_type == "expense",
            extract("month", Transaction.date) == month,
            extract("year", Transaction.date) == year,
        )
        .group_by("merchant")
        .order_by(func.sum(Transaction.user_share_amount).desc())
        .limit(5)
        .all()
    )

    top_merchants = [
        {
            "merchant": r.merchant,
            "amount": float(r.amount),
            "count": r.count,
        }
        for r in merchant_rows
    ]

    return {
        "metrics": {
            "monthly_income": float(monthly_income),
            "total_spent": float(total_spent),
            "savings_rate": savings_rate,
            "transaction_count": transaction_count,
        },
        "spending_by_category": spending_by_category,
        "spending_trend": spending_trend,
        "recent_transactions": [_txn_dict(t) for t in recent_txns],
        "budget_status": budget_status,
        "top_merchants": top_merchants,
    }
