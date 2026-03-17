"""Pydantic schemas for Category endpoints."""

from typing import Optional

from pydantic import BaseModel


class CategoryCreate(BaseModel):
    name: str
    icon: Optional[str] = None
    color: Optional[str] = None  # hex color e.g. "#FF5733"
    is_income: bool = False


class CategoryResponse(BaseModel):
    id: str
    user_id: Optional[str]
    name: str
    icon: Optional[str]
    color: Optional[str]
    is_income: bool
    sort_order: int

    model_config = {"from_attributes": True}
