"""Document ingestion service — orchestrates upload, parsing, and transaction bulk-insert."""

import logging
import os
import uuid
from pathlib import Path
from typing import List

from fastapi import UploadFile
from sqlalchemy.orm import Session

from ..models.document import Document
from ..models.transaction import Transaction
from ..parsers.csv_parser import CSVParser
from ..parsers.vision_parser import ExcelVisionParser, PDFVisionParser
from ..schemas.transaction import TransactionCreate

logger = logging.getLogger(__name__)

UPLOADS_DIR = Path(__file__).resolve().parent.parent.parent / "uploads"
UPLOADS_DIR.mkdir(parents=True, exist_ok=True)

_PARSERS = {
    "csv": CSVParser(),
    "xlsx": ExcelVisionParser(),
    "xls": ExcelVisionParser(),
    "pdf": PDFVisionParser(),
}


def process_upload(
    db: Session,
    user_id: str,
    file: UploadFile,
    filename: str,
) -> Document:
    """Save file, detect type, parse, bulk-insert transactions, return Document record."""

    ext = filename.rsplit(".", 1)[-1].lower() if "." in filename else ""
    file_bytes = file.file.read()
    file_size = len(file_bytes)

    # 1. Persist file to disk
    safe_name = f"{uuid.uuid4().hex}_{filename}"
    file_path = UPLOADS_DIR / safe_name
    file_path.write_bytes(file_bytes)

    # 2. Create Document record (status=processing)
    doc = Document(
        id=str(uuid.uuid4()),
        user_id=user_id,
        filename=filename,
        file_type=ext,
        file_size=file_size,
        status="processing",
    )
    db.add(doc)
    db.commit()
    db.refresh(doc)

    try:
        # 3. Select parser
        parser = _PARSERS.get(ext)
        if parser is None:
            raise ValueError(f"Unsupported file type: .{ext}")

        # 4. Parse
        transactions: List[TransactionCreate] = parser.parse(str(file_path), user_id)

        # 5. Bulk-insert transactions
        orm_txns: List[Transaction] = []
        for t in transactions:
            from ..parsers.normalizer import normalize_merchant
            orm_txns.append(
                Transaction(
                    id=str(uuid.uuid4()),
                    user_id=user_id,
                    date=t.date,
                    merchant=t.merchant,
                    normalized_merchant=normalize_merchant(t.merchant),
                    amount_total=t.amount_total,
                    user_share_amount=t.user_share_amount,
                    currency=t.currency,
                    transaction_type=t.transaction_type,
                    category=t.category,
                    subcategory=t.subcategory,
                    source_file=filename,
                )
            )

        if orm_txns:
            db.add_all(orm_txns)

        # 6. Update Document — completed
        doc.transactions_extracted = len(orm_txns)
        doc.status = "completed"
        db.commit()
        db.refresh(doc)

    except Exception as exc:
        logger.exception("Ingestion failed for %s: %s", filename, exc)
        db.rollback()
        doc.status = "failed"
        doc.error_message = str(exc)
        db.commit()
        db.refresh(doc)
        # Clean up uploaded file on hard failure
        try:
            file_path.unlink(missing_ok=True)
        except Exception:
            pass

    return doc


def get_preview_transactions(
    db: Session,
    user_id: str,
    source_file: str,
    limit: int = 5,
) -> List[Transaction]:
    """Return the first *limit* transactions inserted from *source_file*."""
    return (
        db.query(Transaction)
        .filter(
            Transaction.user_id == user_id,
            Transaction.source_file == source_file,
        )
        .order_by(Transaction.created_at.asc())
        .limit(limit)
        .all()
    )
