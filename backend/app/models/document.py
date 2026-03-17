"""Document SQLAlchemy model for uploaded financial statements."""

import uuid
from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from ..database import Base


class Document(Base):
    """Represents an uploaded financial document."""

    __tablename__ = "documents"

    id: Mapped[str] = mapped_column(
        String, primary_key=True, default=lambda: str(uuid.uuid4())
    )
    user_id: Mapped[str] = mapped_column(
        String, ForeignKey("users.id"), nullable=False, index=True
    )
    filename: Mapped[str] = mapped_column(String, nullable=False)
    file_type: Mapped[str] = mapped_column(String, nullable=False)  # csv/xlsx/xls/pdf
    document_type: Mapped[str | None] = mapped_column(
        String, nullable=True
    )  # bank_statement/credit_card_statement/generic
    file_size: Mapped[int] = mapped_column(Integer, nullable=False)
    transactions_extracted: Mapped[int] = mapped_column(
        Integer, default=0, nullable=False
    )
    status: Mapped[str] = mapped_column(
        String, default="pending", nullable=False
    )  # pending/processing/completed/failed
    error_message: Mapped[str | None] = mapped_column(Text, nullable=True)
    uploaded_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, nullable=False
    )
