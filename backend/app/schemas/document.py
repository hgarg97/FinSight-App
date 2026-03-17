"""Pydantic schemas for Document endpoints."""

from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel

from .transaction import TransactionResponse


class DocumentResponse(BaseModel):
    id: str
    user_id: str
    filename: str
    file_type: str
    document_type: Optional[str]
    file_size: int
    transactions_extracted: int
    status: str
    error_message: Optional[str]
    uploaded_at: datetime

    model_config = {"from_attributes": True}


class UploadResponse(BaseModel):
    document: DocumentResponse
    transactions_extracted: int
    preview: List[TransactionResponse]
