"""Pydantic schemas for Account endpoints."""

from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class AccountCreate(BaseModel):
    name: str
    account_type: str  # checking/savings/credit_card/brokerage/cash/loan
    institution: Optional[str] = None
    current_balance: float = 0.0
    is_asset: bool = True


class AccountUpdate(BaseModel):
    name: Optional[str] = None
    institution: Optional[str] = None
    current_balance: Optional[float] = None
    is_active: Optional[bool] = None


class AccountResponse(BaseModel):
    id: str
    user_id: str
    name: str
    account_type: str
    institution: Optional[str]
    current_balance: float
    is_asset: bool
    is_active: bool
    created_at: datetime

    model_config = {"from_attributes": True}
