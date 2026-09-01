from typing import Optional
from beanie import PydanticObjectId
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError
from app.core.security import decode_access_token
from app.models.customer import Customer
from app.models.manager import Manager

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/customer/login", auto_error=False)

async def get_current_customer(
    token: Optional[str] = Depends(oauth2_scheme)
) -> Customer:
    """
    FastAPI dependency to authenticate CUSTOMER from JWT Bearer token.
    Loads and validates customer record from MongoDB database via Beanie.
    """
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required. Missing Bearer token.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    try:
        payload = decode_access_token(token)
        user_id_str: str = payload.get("sub")
        role: str = payload.get("role")
        if not user_id_str or role != "CUSTOMER":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token credentials or role mismatch.",
                headers={"WWW-Authenticate": "Bearer"},
            )
        user_id = PydanticObjectId(user_id_str)
    except (JWTError, ValueError, Exception):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials or token expired.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    customer = await Customer.get(user_id)
    if not customer:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Customer account not found.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return customer

async def get_current_manager(
    token: Optional[str] = Depends(oauth2_scheme)
) -> Manager:
    """
    FastAPI dependency to authenticate MANAGER from JWT Bearer token.
    Re-checks manager record AND live status field in MongoDB on every request.
    If status != APPROVED, raises 403 immediately.
    """
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Manager authentication required. Missing Bearer token.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    try:
        payload = decode_access_token(token)
        user_id_str: str = payload.get("sub")
        role: str = payload.get("role")
        if not user_id_str or role != "MANAGER":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid manager credentials or role mismatch.",
                headers={"WWW-Authenticate": "Bearer"},
            )
        user_id = PydanticObjectId(user_id_str)
    except (JWTError, ValueError, Exception):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate manager token or token expired.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    manager = await Manager.get(user_id)
    if not manager:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Manager account not found.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Re-check live status field in MongoDB
    if manager.status != "APPROVED":
        if manager.status == "PENDING":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Your manager account is awaiting approval from an existing manager.",
            )
        elif manager.status == "REJECTED":
            reason = f": {manager.rejection_reason}" if manager.rejection_reason else "."
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Your manager account request was not approved{reason}",
            )
        else:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Manager account is not active.",
            )

    return manager
