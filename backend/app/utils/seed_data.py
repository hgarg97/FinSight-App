"""Seed utilities — populates default categories on first startup."""

import uuid

from sqlalchemy.orm import Session

from ..models.category import Category

_EXPENSE_CATEGORIES = [
    ("Rent/Mortgage", "#E74C3C", 1),
    ("Groceries", "#27AE60", 2),
    ("Dining", "#F39C12", 3),
    ("Transport", "#2980B9", 4),
    ("Travel", "#8E44AD", 5),
    ("Shopping", "#E91E63", 6),
    ("Utilities", "#16A085", 7),
    ("Healthcare", "#C0392B", 8),
    ("Entertainment", "#D35400", 9),
    ("Subscriptions", "#7F8C8D", 10),
    ("Education", "#2C3E50", 11),
    ("Personal Care", "#1ABC9C", 12),
    ("Gifts", "#E67E22", 13),
    ("Investments", "#3498DB", 14),
    ("Savings", "#2ECC71", 15),
    ("Insurance", "#95A5A6", 16),
    ("Miscellaneous", "#BDC3C7", 17),
]

_INCOME_CATEGORIES = [
    ("Salary", "#27AE60", 18),
    ("Freelance", "#F1C40F", 19),
    ("Investment Income", "#3498DB", 20),
    ("Refunds", "#1ABC9C", 21),
    ("Other Income", "#95A5A6", 22),
]


def seed_categories(db: Session) -> None:
    """Insert default system categories if the categories table is empty."""
    if db.query(Category).first():
        return

    rows = []
    for name, color, order in _EXPENSE_CATEGORIES:
        rows.append(
            Category(
                id=str(uuid.uuid4()),
                user_id=None,
                name=name,
                color=color,
                is_income=False,
                sort_order=order,
            )
        )
    for name, color, order in _INCOME_CATEGORIES:
        rows.append(
            Category(
                id=str(uuid.uuid4()),
                user_id=None,
                name=name,
                color=color,
                is_income=True,
                sort_order=order,
            )
        )

    db.bulk_save_objects(rows)
    db.commit()
