import secrets
from datetime import datetime, timedelta, timezone
from typing import Optional, Union
from beanie import PydanticObjectId
from fastapi import APIRouter, Depends, HTTPException, Response, Request, status
from jose import JWTError
from pymongo.errors import DuplicateKeyError

from app.core.config import settings
from app.core.security import (
    validate_password_strength,
    get_password_hash,
    verify_password,
    create_access_token,
    create_refresh_token,
    decode_refresh_token,
    decode_access_token,
    hash_token,
)
from app.core.email import (
    validate_email_address,
    generate_secure_otp,
    send_otp_email,
)
from app.models.customer import Customer
from app.models.manager import Manager
from app.models.refresh_token import RefreshToken
from app.models.pending_registration import PendingRegistration
from app.schemas.customer import CustomerOut
from app.schemas.manager import ManagerOut
from app.schemas.auth import (
    LoginRequest,
    TokenResponse,
    ManagerRegistrationResponse,
    RefreshTokenRequest,
    UserProfileResponse,
    RegisterStartRequest,
    ManagerRegisterStartRequest,
    RegisterStartResponse,
    VerifyOTPRequest,
    VerifyOTPResponse,
    CustomerRegisterCompleteRequest,
    ManagerRegisterCompleteRequest,
)
from app.api.deps import oauth2_scheme


def ensure_utc(dt: datetime) -> datetime:
    """
    Convert a naive or timezone-aware datetime to a UTC-aware datetime.

    MongoDB/Beanie can return datetime values without tzinfo, while the
    application creates timestamps using timezone-aware UTC datetimes.
    """
    if dt.tzinfo is None:
        return dt.replace(tzinfo=timezone.utc)
    return dt.astimezone(timezone.utc)

router = APIRouter(prefix="/auth", tags=["Authentication"])

def set_refresh_cookie(response: Response, refresh_token: str):
    """Set secure httpOnly refresh cookie."""
    is_prod = settings.ENVIRONMENT == "production"
    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        secure=is_prod,
        samesite="strict",
        max_age=settings.REFRESH_TOKEN_EXPIRE_DAYS * 24 * 60 * 60,
        path="/auth",
    )

def clear_refresh_cookie(response: Response):
    """Clear refresh token cookie."""
    response.delete_cookie(key="refresh_token", path="/auth")


# =========================================================================
# 1. 3-STEP EMAIL VERIFIED CUSTOMER REGISTRATION
# =========================================================================

@router.post("/customer/register/start", response_model=RegisterStartResponse)
async def customer_register_start(payload: RegisterStartRequest):
    """
    Step A: Validate email syntax & deliverability, check account doesn't exist,
    enforce 60s resend cooldown, generate 6-digit OTP, send real email.
    """
    # 1. Validate email syntax + MX deliverability
    try:
        normalized_email = validate_email_address(payload.email)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

    # 2. Check if customer account already exists
    existing = await Customer.find_one(Customer.email == normalized_email)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email address already exists."
        )

    now = datetime.now(timezone.utc)

    # 3. Check resend cooldown (60 seconds)
    pending = await PendingRegistration.find_one(PendingRegistration.email == normalized_email)
    if pending and pending.last_sent_at:
        last_sent_at = ensure_utc(pending.last_sent_at)
        elapsed = (now - last_sent_at).total_seconds()
        if elapsed < 60:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Please wait before requesting another code."
            )

    # 4. Generate 6-digit OTP & Hash
    otp_code = generate_secure_otp()
    otp_h = hash_token(str(otp_code))
    otp_exp = now + timedelta(minutes=10)
    cleanup_exp = now + timedelta(minutes=30)

    if pending:
        pending.user_type = "CUSTOMER"
        pending.otp_hash = otp_h
        pending.otp_expires_at = otp_exp
        pending.otp_attempts = 0
        pending.resend_count += 1
        pending.last_sent_at = now
        pending.email_verified = False
        pending.verified_token_hash = None
        pending.verified_token_expires_at = None
        pending.expires_at = cleanup_exp
        await pending.save()
    else:
        pending = PendingRegistration(
            email=normalized_email,
            user_type="CUSTOMER",
            otp_hash=otp_h,
            otp_expires_at=otp_exp,
            otp_attempts=0,
            resend_count=1,
            last_sent_at=now,
            email_verified=False,
            created_at=now,
            expires_at=cleanup_exp,
        )
        await pending.insert()

    # 5. Send Email
    await send_otp_email(normalized_email, otp_code)

    return RegisterStartResponse(message="Verification code sent to your email.")


@router.post("/customer/register/verify-otp", response_model=VerifyOTPResponse)
async def customer_register_verify_otp(payload: VerifyOTPRequest):
    """
    Step B: Verify 6-digit OTP code against pending registration.
    On success, generates single-use verified_token.
    """
    normalized_email = payload.email.strip().lower()
    pending = await PendingRegistration.find_one(PendingRegistration.email == normalized_email)

    if not pending or pending.user_type != "CUSTOMER":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Please request a verification code first."
        )

    now = datetime.now(timezone.utc)

    # Check expiration
    if now > ensure_utc(pending.otp_expires_at):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Code expired, please request a new one."
        )

    # Check max attempts
    if pending.otp_attempts >= pending.otp_max_attempts:
        pending.otp_hash = ""  # Invalidate current OTP
        await pending.save()
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Too many incorrect attempts. Please request a new code."
        )

    # Constant-time comparison
    submitted_h = hash_token(payload.otp.strip())
    if not secrets.compare_digest(submitted_h, pending.otp_hash):
        pending.otp_attempts += 1
        await pending.save()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Incorrect code."
        )

    # OTP match success
    raw_verified_token = secrets.token_urlsafe(32)
    pending.email_verified = True
    pending.verified_token_hash = hash_token(raw_verified_token)
    pending.verified_token_expires_at = now + timedelta(minutes=15)
    await pending.save()

    return VerifyOTPResponse(
        verified_token=raw_verified_token,
        message="Email verified successfully."
    )


@router.post("/customer/register/complete", status_code=status.HTTP_201_CREATED, response_model=TokenResponse)
async def customer_register_complete(
    payload: CustomerRegisterCompleteRequest,
    response: Response,
):
    """
    Step C: Verify single-use verified_token, password strength, and create customer document.
    Deletes PendingRegistration doc and returns JWT tokens.
    """
    if payload.password != payload.confirm_password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Passwords do not match."
        )

    try:
        validate_password_strength(payload.password)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

    normalized_email = payload.email.strip().lower()
    pending = await PendingRegistration.find_one(PendingRegistration.email == normalized_email)

    now = datetime.now(timezone.utc)

    if (
        not pending
        or not pending.email_verified
        or not pending.verified_token_hash
        or not pending.verified_token_expires_at
        or now > ensure_utc(pending.verified_token_expires_at)
        or not secrets.compare_digest(hash_token(payload.verified_token), pending.verified_token_hash)
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email not verified or verification expired — please restart registration."
        )

    # Re-check race condition
    existing = await Customer.find_one(Customer.email == normalized_email)
    if existing:
        await pending.delete()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email address already exists."
        )

    # Create real Customer
    customer = Customer(
        name=payload.name.strip(),
        email=normalized_email,
        password_hash=get_password_hash(payload.password),
        created_at=now,
        updated_at=now,
    )

    try:
        await customer.insert()
    except DuplicateKeyError:
        await pending.delete()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email address already exists."
        )

    # Delete PendingRegistration doc (single-use token enforcement)
    await pending.delete()

    # Issue Tokens
    access_token = create_access_token(
        subject=str(customer.id),
        role="CUSTOMER",
        email=customer.email,
        name=customer.name,
    )
    refresh_token = create_refresh_token(subject=str(customer.id), role="CUSTOMER")

    # Store refresh token hash
    ref_payload = decode_refresh_token(refresh_token)
    ref_exp = datetime.fromtimestamp(ref_payload["exp"], tz=timezone.utc)
    token_record = RefreshToken(
        user_id=customer.id,
        user_type="CUSTOMER",
        token_hash=hash_token(refresh_token),
        issued_at=now,
        expires_at=ref_exp,
    )
    await token_record.insert()

    set_refresh_cookie(response, refresh_token)

    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        refresh_token=refresh_token,
        user=CustomerOut.model_validate(customer),
    )


# =========================================================================
# 2. 3-STEP EMAIL VERIFIED MANAGER REGISTRATION
# =========================================================================

@router.post("/manager/register/start", response_model=RegisterStartResponse)
async def manager_register_start(payload: ManagerRegisterStartRequest):
    """
    Step A: Validate manager email syntax & deliverability, check account doesn't exist,
    enforce 60s cooldown, generate 6-digit OTP, send real email.
    """
    try:
        normalized_email = validate_email_address(payload.email)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

    existing = await Manager.find_one(Manager.email == normalized_email)
    if existing:
        if existing.status == "PENDING":
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="A manager registration request is already pending review for this email."
            )
        elif existing.status == "APPROVED":
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="A manager account with this email is already registered."
            )
        else:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="This manager account request was previously rejected."
            )

    now = datetime.now(timezone.utc)

    pending = await PendingRegistration.find_one(PendingRegistration.email == normalized_email)
    if pending and pending.last_sent_at:
        last_sent_at = ensure_utc(pending.last_sent_at)
        elapsed = (now - last_sent_at).total_seconds()
        if elapsed < 60:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Please wait before requesting another code."
            )

    otp_code = generate_secure_otp()
    otp_h = hash_token(str(otp_code))
    otp_exp = now + timedelta(minutes=10)
    cleanup_exp = now + timedelta(minutes=30)

    reason = payload.reason.strip() if payload.reason else "Regional Warranty Manager"

    if pending:
        pending.user_type = "MANAGER"
        pending.manager_reason = reason
        pending.otp_hash = otp_h
        pending.otp_expires_at = otp_exp
        pending.otp_attempts = 0
        pending.resend_count += 1
        pending.last_sent_at = now
        pending.email_verified = False
        pending.verified_token_hash = None
        pending.verified_token_expires_at = None
        pending.expires_at = cleanup_exp
        await pending.save()
    else:
        pending = PendingRegistration(
            email=normalized_email,
            user_type="MANAGER",
            manager_reason=reason,
            otp_hash=otp_h,
            otp_expires_at=otp_exp,
            otp_attempts=0,
            resend_count=1,
            last_sent_at=now,
            email_verified=False,
            created_at=now,
            expires_at=cleanup_exp,
        )
        await pending.insert()

    await send_otp_email(normalized_email, otp_code)

    return RegisterStartResponse(message="Verification code sent to your email.")


@router.post("/manager/register/verify-otp", response_model=VerifyOTPResponse)
async def manager_register_verify_otp(payload: VerifyOTPRequest):
    """
    Step B: Verify 6-digit OTP code for manager registration.
    """
    normalized_email = payload.email.strip().lower()
    pending = await PendingRegistration.find_one(PendingRegistration.email == normalized_email)

    if not pending or pending.user_type != "MANAGER":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Please request a verification code first."
        )

    now = datetime.now(timezone.utc)

    if now > ensure_utc(pending.otp_expires_at):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Code expired, please request a new one."
        )

    if pending.otp_attempts >= pending.otp_max_attempts:
        pending.otp_hash = ""
        await pending.save()
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Too many incorrect attempts. Please request a new code."
        )

    submitted_h = hash_token(payload.otp.strip())
    if not secrets.compare_digest(submitted_h, pending.otp_hash):
        pending.otp_attempts += 1
        await pending.save()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Incorrect code."
        )

    raw_verified_token = secrets.token_urlsafe(32)
    pending.email_verified = True
    pending.verified_token_hash = hash_token(raw_verified_token)
    pending.verified_token_expires_at = now + timedelta(minutes=15)
    await pending.save()

    return VerifyOTPResponse(
        verified_token=raw_verified_token,
        message="Email verified successfully."
    )


@router.post("/manager/register/complete", status_code=status.HTTP_201_CREATED, response_model=ManagerRegistrationResponse)
async def manager_register_complete(payload: ManagerRegisterCompleteRequest):
    """
    Step C: Verify token, create Manager document with status="PENDING".
    Deletes PendingRegistration doc. Does NOT issue tokens.
    """
    if payload.password != payload.confirm_password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Passwords do not match."
        )

    try:
        validate_password_strength(payload.password)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

    normalized_email = payload.email.strip().lower()
    pending = await PendingRegistration.find_one(PendingRegistration.email == normalized_email)

    now = datetime.now(timezone.utc)

    if (
        not pending
        or not pending.email_verified
        or not pending.verified_token_hash
        or not pending.verified_token_expires_at
        or now > ensure_utc(pending.verified_token_expires_at)
        or not secrets.compare_digest(hash_token(payload.verified_token), pending.verified_token_hash)
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email not verified or verification expired — please restart registration."
        )

    existing = await Manager.find_one(Manager.email == normalized_email)
    if existing:
        await pending.delete()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A manager account with this email is already registered."
        )

    manager = Manager(
        name=payload.name.strip(),
        email=normalized_email,
        password_hash=get_password_hash(payload.password),
        status="PENDING",
        requested_at=now,
        requested_role_note=pending.manager_reason or "Regional Warranty Manager",
        created_at=now,
        updated_at=now,
    )

    try:
        await manager.insert()
    except DuplicateKeyError:
        await pending.delete()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A manager account with this email is already registered."
        )

    await pending.delete()

    return ManagerRegistrationResponse(
        success=True,
        message="Your manager account request has been submitted. An existing warranty manager must approve your access before you can log in.",
        manager=ManagerOut.model_validate(manager),
    )


# =========================================================================
# 3. LOGIN & SESSION MANAGEMENT
# =========================================================================

@router.post("/customer/login", response_model=TokenResponse)
async def login_customer(
    payload: LoginRequest,
    response: Response,
):
    """Customer login."""
    normalized_email = payload.email.strip().lower()
    customer = await Customer.find_one(Customer.email == normalized_email)

    if not customer or not verify_password(payload.password, customer.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token = create_access_token(
        subject=str(customer.id),
        role="CUSTOMER",
        email=customer.email,
        name=customer.name,
    )
    refresh_token = create_refresh_token(subject=str(customer.id), role="CUSTOMER")

    now = datetime.now(timezone.utc)
    ref_payload = decode_refresh_token(refresh_token)
    ref_exp = datetime.fromtimestamp(ref_payload["exp"], tz=timezone.utc)
    token_record = RefreshToken(
        user_id=customer.id,
        user_type="CUSTOMER",
        token_hash=hash_token(refresh_token),
        issued_at=now,
        expires_at=ref_exp,
    )
    await token_record.insert()

    set_refresh_cookie(response, refresh_token)

    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        refresh_token=refresh_token,
        user=CustomerOut.model_validate(customer),
    )


@router.post("/manager/login", response_model=TokenResponse)
async def login_manager(
    payload: LoginRequest,
    response: Response,
):
    """Manager login."""
    normalized_email = payload.email.strip().lower()
    manager = await Manager.find_one(Manager.email == normalized_email)

    if not manager or not verify_password(payload.password, manager.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if manager.status == "PENDING":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your manager account is awaiting approval from an existing manager. You'll be notified once approved.",
        )
    elif manager.status == "REJECTED":
        reason = f": {manager.rejection_reason}" if manager.rejection_reason else "."
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Your manager account request was not approved{reason}",
        )
    elif manager.status != "APPROVED":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Manager account is not active.",
        )

    access_token = create_access_token(
        subject=str(manager.id),
        role="MANAGER",
        email=manager.email,
        name=manager.name,
    )
    refresh_token = create_refresh_token(subject=str(manager.id), role="MANAGER")

    now = datetime.now(timezone.utc)
    ref_payload = decode_refresh_token(refresh_token)
    ref_exp = datetime.fromtimestamp(ref_payload["exp"], tz=timezone.utc)
    token_record = RefreshToken(
        user_id=manager.id,
        user_type="MANAGER",
        token_hash=hash_token(refresh_token),
        issued_at=now,
        expires_at=ref_exp,
    )
    await token_record.insert()

    set_refresh_cookie(response, refresh_token)

    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        refresh_token=refresh_token,
        user=ManagerOut.model_validate(manager),
    )


@router.post("/refresh", response_model=TokenResponse)
async def refresh_token_endpoint(
    request: Request,
    response: Response,
    body: Optional[RefreshTokenRequest] = None,
):
    """Refresh Token Rotation."""
    raw_token = (
        request.cookies.get("refresh_token")
        or (body.refresh_token if body else None)
    )

    if not raw_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token required.",
        )

    try:
        payload = decode_refresh_token(raw_token)
        user_id_str = payload.get("sub")
        role = payload.get("role")
        user_id = PydanticObjectId(user_id_str)
    except (JWTError, ValueError, Exception):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired refresh token.",
        )

    token_h = hash_token(raw_token)
    token_record = await RefreshToken.find_one(RefreshToken.token_hash == token_h)

    if not token_record or not token_record.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token has been revoked or expired.",
        )

    now = datetime.now(timezone.utc)
    token_record.revoked_at = now
    await token_record.save()

    user_out: Union[CustomerOut, ManagerOut]
    name = ""
    email = ""

    if role == "CUSTOMER":
        customer = await Customer.get(user_id)
        if not customer:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found.")
        user_out = CustomerOut.model_validate(customer)
        name = customer.name
        email = customer.email
    elif role == "MANAGER":
        manager = await Manager.get(user_id)
        if not manager or manager.status != "APPROVED":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Manager account is no longer approved.",
            )
        user_out = ManagerOut.model_validate(manager)
        name = manager.name
        email = manager.email
    else:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Unknown role.")

    new_access_token = create_access_token(
        subject=str(user_id),
        role=role,
        email=email,
        name=name,
    )
    new_refresh_token = create_refresh_token(subject=str(user_id), role=role)

    new_ref_payload = decode_refresh_token(new_refresh_token)
    new_ref_exp = datetime.fromtimestamp(new_ref_payload["exp"], tz=timezone.utc)
    new_token_record = RefreshToken(
        user_id=user_id,
        user_type=role,
        token_hash=hash_token(new_refresh_token),
        issued_at=now,
        expires_at=new_ref_exp,
    )
    await new_token_record.insert()

    set_refresh_cookie(response, new_refresh_token)

    return TokenResponse(
        access_token=new_access_token,
        token_type="bearer",
        refresh_token=new_refresh_token,
        user=user_out,
    )


@router.post("/logout")
async def logout(
    request: Request,
    response: Response,
    body: Optional[RefreshTokenRequest] = None,
):
    """Logout."""
    raw_token = (
        request.cookies.get("refresh_token")
        or (body.refresh_token if body else None)
    )

    if raw_token:
        token_h = hash_token(raw_token)
        token_record = await RefreshToken.find_one(RefreshToken.token_hash == token_h)
        if token_record and token_record.revoked_at is None:
            token_record.revoked_at = datetime.now(timezone.utc)
            await token_record.save()

    clear_refresh_cookie(response)
    return {"success": True, "message": "Logged out successfully."}


@router.get("/me", response_model=UserProfileResponse)
async def get_current_user_profile(
    token: Optional[str] = Depends(oauth2_scheme),
):
    """Current User Profile."""
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated.",
        )

    try:
        payload = decode_access_token(token)
        user_id = PydanticObjectId(payload.get("sub"))
        role = payload.get("role")
    except (JWTError, ValueError, Exception):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired access token.",
        )

    if role == "CUSTOMER":
        customer = await Customer.get(user_id)
        if not customer:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Customer not found.")
        return UserProfileResponse(
            id=customer.id,
            name=customer.name,
            email=customer.email,
            role="CUSTOMER",
        )
    elif role == "MANAGER":
        manager = await Manager.get(user_id)
        if not manager:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Manager not found.")
        if manager.status != "APPROVED":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Manager account is not approved.",
            )
        return UserProfileResponse(
            id=manager.id,
            name=manager.name,
            email=manager.email,
            role="MANAGER",
            status=manager.status,
        )
    else:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid role.")
