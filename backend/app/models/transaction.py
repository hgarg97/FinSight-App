"""Transaction SQLAlchemy model."""

import uuid
from datetime import date, datetime

from sqlalchemy import Boolean, Date, DateTime, Float, ForeignKey, Index, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from ..database import Base


class Transaction(Base):
    """Represents a financial transaction recorded by a user."""

    __tablename__ = "transactions"

    id: Mapped[str] = mapped_column(
        String, primary_key=True, default=lambda: str(uuid.uuid4())
    )
    user_id: Mapped[str] = mapped_column(
        String, ForeignKey("users.id"), nullable=False, index=True
    )
    date: Mapped[date] = mapped_column(Date, nullable=False, index=True)
    merchant: Mapped[str] = mapped_column(String, nullable=False)
    normalized_merchant: Mapped[str | None] = mapped_column(String, nullable=True, index=True)
    amount_total: Mapped[float] = mapped_column(Float, nullable=False)
    user_share_amount: Mapped[float] = mapped_column(Float, nullable=False)
    currency: Mapped[str] = mapped_column(String, default="USD", nullable=False)

    # Account linkage (can be soft-linked via id or just stored as name/type)
    account_id: Mapped[str | None] = mapped_column(
        String, ForeignKey("accounts.id"), nullable=True
    )
    account_name: Mapped[str | None] = mapped_column(String, nullable=True)
    account_type: Mapped[str | None] = mapped_column(String, nullable=True)

    # Classification
    transaction_type: Mapped[str] = mapped_column(
        String, default="expense", nullable=False
    )  # expense/income/transfer/investment/refund
    category: Mapped[str | None] = mapped_column(String, nullable=True, index=True)
    subcategory: Mapped[str | None] = mapped_column(String, nullable=True)
    payment_method: Mapped[str | None] = mapped_column(String, nullable=True)

    # Split support
    is_split: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    split_details_json: Mapped[str | None] = mapped_column(Text, nullable=True)  # JSON string

    # Reimbursement
    is_reimbursable: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    reimbursement_status: Mapped[str] = mapped_column(
        String, default="none", nullable=False
    )

    # Trip / subscription tagging
    trip_id: Mapped[str | None] = mapped_column(String, nullable=True)
    subscription_flag: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    source_file: Mapped[str | None] = mapped_column(String, nullable=True)

    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False
    )

    __table_args__ = (
        Index("ix_txn_user_date", "user_id", "date"),
        Index("ix_txn_user_category", "user_id", "category"),
        Index("ix_txn_user_merchant", "user_id", "normalized_merchant"),
    )
