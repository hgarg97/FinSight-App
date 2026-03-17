"""Documents router — upload, list, and delete financial statements."""

import logging
from typing import Optional

from fastapi import APIRouter, Depends, File, HTTPException, Query, UploadFile, status
from sqlalchemy.orm import Session

from ..database import SessionLocal
from ..models.document import Document
from ..models.transaction import Transaction
from ..routers.auth import get_current_user
from ..schemas.document import DocumentResponse, UploadResponse
from ..schemas.transaction import TransactionResponse
from ..services.ingestion_service import get_preview_transactions, process_upload

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/documents", tags=["documents"])

ALLOWED_EXTENSIONS = {"csv", "xlsx", "xls", "pdf"}
MAX_FILE_SIZE = 50 * 1024 * 1024  # 50 MB


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post("/upload", response_model=UploadResponse)
async def upload_document(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """Accept a multipart file upload, parse it, and return a preview of extracted transactions."""
    filename = file.filename or "upload"
    ext = filename.rsplit(".", 1)[-1].lower() if "." in filename else ""

    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File type '.{ext}' is not supported. Allowed: {', '.join(sorted(ALLOWED_EXTENSIONS))}",
        )

    # Read content length without consuming the stream
    content = await file.read()
    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail="File exceeds the 50 MB limit.",
        )

    # Reset stream for the service to read
    from io import BytesIO
    file.file = BytesIO(content)  # type: ignore[assignment]

    doc = process_upload(
        db=db,
        user_id=current_user.id,
        file=file,
        filename=filename,
    )

    if doc.status == "failed":
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=doc.error_message or "Failed to parse document.",
        )

    preview_txns = get_preview_transactions(db, current_user.id, filename)
    return UploadResponse(
        document=DocumentResponse.model_validate(doc),
        transactions_extracted=doc.transactions_extracted,
        preview=[TransactionResponse.model_validate(t) for t in preview_txns],
    )


@router.get("", response_model=list[DocumentResponse])
def list_documents(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """Return all documents uploaded by the current user, newest first."""
    return (
        db.query(Document)
        .filter(Document.user_id == current_user.id)
        .order_by(Document.uploaded_at.desc())
        .all()
    )


@router.delete("/{doc_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_document(
    doc_id: str,
    delete_transactions: bool = Query(False),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """Delete a document record, optionally deleting its linked transactions."""
    doc = db.query(Document).filter(Document.id == doc_id).first()
    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found")
    if doc.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")

    if delete_transactions:
        db.query(Transaction).filter(
            Transaction.user_id == current_user.id,
            Transaction.source_file == doc.filename,
        ).delete(synchronize_session=False)

    db.delete(doc)
    db.commit()
