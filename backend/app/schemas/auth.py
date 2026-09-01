from typing import Optional, Union
from beanie import PydanticObjectId
from pydantic import BaseModel, EmailStr
from app.schemas.customer import CustomerOut
from app.schemas.manager import ManagerOut

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    refresh_token: Optional[str] = None
    user: Union[CustomerOut, ManagerOut]

class ManagerRegistrationResponse(BaseModel):
    success: bool
    message: str
    manager: ManagerOut

class RefreshTokenRequest(BaseModel):
    refresh_token: Optional[str] = None

class UserProfileResponse(BaseModel):
    id: PydanticObjectId
    name: str
    email: str
    role: str
    status: Optional[str] = None

# =========================================================================
# 3-STEP EMAIL VERIFICATION SCHEMAS
# =========================================================================

class RegisterStartRequest(BaseModel):
    email: EmailStr

class ManagerRegisterStartRequest(BaseModel):
    email: EmailStr
    reason: Optional[str] = None

class RegisterStartResponse(BaseModel):
    message: str = "Verification code sent to your email."

class VerifyOTPRequest(BaseModel):
    email: str
    otp: str

class VerifyOTPResponse(BaseModel):
    verified_token: str
    message: str = "Email verified successfully."

class CustomerRegisterCompleteRequest(BaseModel):
    email: EmailStr
    verified_token: str
    name: str
    password: str
    confirm_password: str

class ManagerRegisterCompleteRequest(BaseModel):
    email: EmailStr
    verified_token: str
    name: str
    password: str
    confirm_password: str
