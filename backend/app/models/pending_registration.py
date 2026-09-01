from datetime import datetime, timezone
from typing import Literal, Optional
from beanie import Document, Indexed
from pydantic import Field

UserType = Literal["CUSTOMER", "MANAGER"]

class PendingRegistration(Document):
    email: Indexed(str, unique=True)
    user_type: UserType
    name: Optional[str] = None
    manager_reason: Optional[str] = None
    otp_hash: str
    otp_expires_at: datetime
    otp_attempts: int = 0
    otp_max_attempts: int = 5
    resend_count: int = 0
    last_sent_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    email_verified: bool = False
    verified_token_hash: Optional[str] = None
    verified_token_expires_at: Optional[datetime] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    expires_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        name = "pending_registrations"
