"""Budget API routes."""

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from ..database import get_db
from ..models.user import User
from ..services.auth_service import get_current_user
from ..services import budget_service

router = APIRouter(prefix="/api/budgets", tags=["budgets"])


class BudgetSetRequest(BaseModel):
    category_id: str
    category_name: str
    month: int
    year: int
    allocated_amount: float


class BudgetBulkItem(BaseModel):
    category_id: str
    category_name: str
    allocated_amount: float


class BudgetBulkRequest(BaseModel):
    month: int
    year: int
    items: list[BudgetBulkItem]


class CopyBudgetRequest(BaseModel):
    from_month: int
    from_year: int
    to_month: int
    to_year: int


@router.get("")
def get_budget_summary(
    month: int,
    year: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return budget_service.get_budget_summary(db, current_user.id, month, year)


@router.post("")
def set_budget(
    payload: BudgetSetRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return budget_service.set_budget(
        db,
        user_id=current_user.id,
        category_id=payload.category_id,
        category_name=payload.category_name,
        month=payload.month,
        year=payload.year,
        amount=payload.allocated_amount,
    )


@router.post("/bulk")
def set_budgets_bulk(
    payload: BudgetBulkRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return [
        budget_service.set_budget(
            db,
            user_id=current_user.id,
            category_id=item.category_id,
            category_name=item.category_name,
            month=payload.month,
            year=payload.year,
            amount=item.allocated_amount,
        )
        for item in payload.items
    ]


@router.delete("/{budget_id}")
def delete_budget(
    budget_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    deleted = budget_service.delete_budget(db, current_user.id, budget_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Budget not found")
    return {"ok": True}


@router.post("/copy")
def copy_budgets(
    payload: CopyBudgetRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return budget_service.copy_budgets(
        db,
        user_id=current_user.id,
        from_month=payload.from_month,
        from_year=payload.from_year,
        to_month=payload.to_month,
        to_year=payload.to_year,
    )
