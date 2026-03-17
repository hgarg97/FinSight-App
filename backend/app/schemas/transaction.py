"""Pydantic schemas for Transaction endpoints."""

from datetime import date, datetime
from typing import List, Optional

from pydantic import BaseModel, model_validator


class TransactionCreate(BaseModel):
    date: date
    merchant: str
    amount_total: float
    user_share_amount: Optional[float] = None
    currency: str = "USD"
    account_id: Optional[str] = None
    account_name: Optional[str] = None
    transaction_type: str = "expense"
    category: Optional[str] = None
    subcategory: Optional[str] = None
    payment_method: Optional[str] = None
    is_split: bool = False
    split_details_json: Optional[str] = None
    is_reimbursable: bool = False
    notes: Optional[str] = None

    @model_validator(mode="after")
    def default_user_share(self) -> "TransactionCreate":
        """Default user_share_amount to amount_total if not provided."""
        if self.user_share_amount is None:
            self.user_share_amount = self.amount_total
        return self


class TransactionUpdate(BaseModel):
    date: Optional[date] = None
    merchant: Optional[str] = None
    amount_total: Optional[float] = None
    user_share_amount: Optional[float] = None
    currency: Optional[str] = None
    account_id: Optional[str] = None
    account_name: Optional[str] = None
    account_type: Optional[str] = None
    transaction_type: Optional[str] = None
    category: Optional[str] = None
    subcategory: Optional[str] = None
    payment_method: Optional[str] = None
    is_split: Optional[bool] = None
    split_details_json: Optional[str] = None
    is_reimbursable: Optional[bool] = None
    reimbursement_status: Optional[str] = None
    trip_id: Optional[str] = None
    subscription_flag: Optional[bool] = None
    notes: Optional[str] = None
    source_file: Optional[str] = None


class TransactionResponse(BaseModel):
    id: str
    user_id: str
    date: date
    merchant: str
    normalized_merchant: Optional[str]
    amount_total: float
    user_share_amount: float
    currency: str
    account_id: Optional[str]
    account_name: Optional[str]
    account_type: Optional[str]
    transaction_type: str
    category: Optional[str]
    subcategory: Optional[str]
    payment_method: Optional[str]
    is_split: bool
    split_details_json: Optional[str]
    is_reimbursable: bool
    reimbursement_status: str
    trip_id: Optional[str]
    subscription_flag: bool
    notes: Optional[str]
    source_file: Optional[str]
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class CategoryAmount(BaseModel):
    category: Optional[str]
    amount: float


class TransactionSummary(BaseModel):
    total_income: float
    total_expenses: float
    net: float
    by_category: List[CategoryAmount]
    transaction_count: int
