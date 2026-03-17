"""Category endpoints: list (system + user), create, update, delete."""

import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..database import get_db
from ..models.category import Category
from ..models.user import User
from ..schemas.category import CategoryCreate, CategoryResponse
from ..services.auth_service import get_current_user

router = APIRouter(prefix="/api/categories", tags=["categories"])


@router.get("", response_model=list[CategoryResponse])
def list_categories(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> list[Category]:
    """Return system-default categories plus the current user's custom ones."""
    return (
        db.query(Category)
        .filter(
            (Category.user_id == None) | (Category.user_id == current_user.id)
        )
        .order_by(Category.sort_order)
        .all()
    )


@router.post("", response_model=CategoryResponse, status_code=status.HTTP_201_CREATED)
def create_category(
    data: CategoryCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Category:
    """Create a custom category for the current user."""
    # Determine next sort_order for this user
    max_order = (
        db.query(Category.sort_order)
        .filter(Category.user_id == current_user.id)
        .order_by(Category.sort_order.desc())
        .scalar()
    )
    category = Category(
        id=str(uuid.uuid4()),
        user_id=current_user.id,
        name=data.name,
        icon=data.icon,
        color=data.color,
        is_income=data.is_income,
        sort_order=(max_order or 0) + 1,
    )
    db.add(category)
    db.commit()
    db.refresh(category)
    return category


@router.put("/{category_id}", response_model=CategoryResponse)
def update_category(
    category_id: str,
    data: CategoryCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Category:
    """Update a user-owned category."""
    category = db.query(Category).filter(Category.id == category_id).first()
    if not category:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found")
    if category.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cannot modify system categories",
        )

    category.name = data.name
    if data.icon is not None:
        category.icon = data.icon
    if data.color is not None:
        category.color = data.color
    category.is_income = data.is_income

    db.commit()
    db.refresh(category)
    return category


@router.delete("/{category_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_category(
    category_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> None:
    """Delete a user-owned custom category."""
    category = db.query(Category).filter(Category.id == category_id).first()
    if not category:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found")
    if category.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cannot delete system categories",
        )

    db.delete(category)
    db.commit()
