"""Account endpoints: list, create, update, soft-delete."""

import uuid
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..database import get_db
from ..models.account import Account
from ..models.user import User
from ..schemas.account import AccountCreate, AccountResponse, AccountUpdate
from ..services.auth_service import get_current_user

router = APIRouter(prefix="/api/accounts", tags=["accounts"])


@router.get("", response_model=list[AccountResponse])
def list_accounts(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> list[Account]:
    """Return all active accounts belonging to the current user."""
    return (
        db.query(Account)
        .filter(Account.user_id == current_user.id, Account.is_active == True)
        .all()
    )


@router.post("", response_model=AccountResponse, status_code=status.HTTP_201_CREATED)
def create_account(
    data: AccountCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Account:
    """Create a new account for the current user."""
    account = Account(
        id=str(uuid.uuid4()),
        user_id=current_user.id,
        name=data.name,
        account_type=data.account_type,
        institution=data.institution,
        current_balance=data.current_balance,
        is_asset=data.is_asset,
    )
    db.add(account)
    db.commit()
    db.refresh(account)
    return account


@router.put("/{account_id}", response_model=AccountResponse)
def update_account(
    account_id: str,
    data: AccountUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Account:
    """Update an account owned by the current user."""
    account = db.query(Account).filter(Account.id == account_id).first()
    if not account:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Account not found")
    if account.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")

    if data.name is not None:
        account.name = data.name
    if data.institution is not None:
        account.institution = data.institution
    if data.current_balance is not None:
        account.current_balance = data.current_balance
    if data.is_active is not None:
        account.is_active = data.is_active

    db.commit()
    db.refresh(account)
    return account


@router.delete("/{account_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_account(
    account_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> None:
    """Soft-delete an account by setting is_active=False."""
    account = db.query(Account).filter(Account.id == account_id).first()
    if not account:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Account not found")
    if account.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")

    account.is_active = False
    db.commit()
