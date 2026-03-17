"""Budget SQLAlchemy model."""

import uuid
from datetime import datetime

from sqlalchemy import DateTime, Float, ForeignKey, Integer, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column

from ..database import Base


class Budget(Base):
    """Represents a monthly budget allocation for a category."""

    __tablename__ = "budgets"

    id: Mapped[str] = mapped_column(
        String, primary_key=True, default=lambda: str(uuid.uuid4())
    )
    user_id: Mapped[str] = mapped_column(
        String, ForeignKey("users.id"), nullable=False, index=True
    )
    category_id: Mapped[str] = mapped_column(String, nullable=False)
    category_name: Mapped[str] = mapped_column(String, nullable=False)
    month: Mapped[int] = mapped_column(Integer, nullable=False)
    year: Mapped[int] = mapped_column(Integer, nullable=False)
    allocated_amount: Mapped[float] = mapped_column(Float, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, nullable=False
    )

    __table_args__ = (
        UniqueConstraint(
            "user_id", "category_id", "month", "year",
            name="uq_budget_user_cat_month_year",
        ),
    )
