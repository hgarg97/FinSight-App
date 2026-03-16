"""Pydantic schemas for authentication and user management."""

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, EmailStr, field_validator


class RegisterRequest(BaseModel):
    """Payload required to register a new user."""

    email: EmailStr
    username: str
    full_name: str
    password: str

    @field_validator("password")
    @classmethod
    def password_min_length(cls, v: str) -> str:
        """Enforce a minimum password length of 8 characters."""
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters long")
        return v


class LoginRequest(BaseModel):
    """Payload required to authenticate an existing user."""

    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    """JWT access token returned after successful auth."""

    access_token: str
    token_type: str = "bearer"


class UserResponse(BaseModel):
    """Public user representation (never includes hashed_password)."""

    model_config = ConfigDict(from_attributes=True)

    id: str
    email: str
    username: str
    full_name: str
    currency: str
    monthly_income: float
    created_at: datetime


class UserUpdate(BaseModel):
    """Fields the user is allowed to update on their own profile."""

    full_name: Optional[str] = None
    currency: Optional[str] = None
    monthly_income: Optional[float] = None
