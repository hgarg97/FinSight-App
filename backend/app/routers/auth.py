"""Authentication endpoints: register, login, profile read/update."""

from datetime import datetime

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from ..database import get_db
from ..models.user import User
from ..schemas.auth import RegisterRequest, LoginRequest, UserResponse, UserUpdate
from ..services.auth_service import get_current_user, login_user, register_user

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/register", status_code=status.HTTP_201_CREATED)
def register(data: RegisterRequest, db: Session = Depends(get_db)) -> dict:
    """Register a new user and return an access token with the user profile."""
    result = register_user(db, data)
    return {
        "access_token": result["token"],
        "token_type": "bearer",
        "user": UserResponse.model_validate(result["user"]),
    }


@router.post("/login")
def login(data: LoginRequest, db: Session = Depends(get_db)) -> dict:
    """Authenticate an existing user and return an access token with the user profile."""
    result = login_user(db, data)
    return {
        "access_token": result["token"],
        "token_type": "bearer",
        "user": UserResponse.model_validate(result["user"]),
    }


@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)) -> User:
    """Return the profile of the currently authenticated user."""
    return current_user


@router.put("/me", response_model=UserResponse)
def update_me(
    data: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> User:
    """Update the authenticated user's editable profile fields."""
    if data.full_name is not None:
        current_user.full_name = data.full_name
    if data.currency is not None:
        current_user.currency = data.currency
    if data.monthly_income is not None:
        current_user.monthly_income = data.monthly_income
    current_user.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(current_user)
    return current_user
