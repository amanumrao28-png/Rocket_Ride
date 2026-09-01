from datetime import datetime, timezone
from typing import Literal, Optional
from beanie import Document, Indexed, PydanticObjectId
from pydantic import Field

ManagerStatus = Literal["PENDING", "APPROVED", "REJECTED"]

class Manager(Document):
    name: str
    email: Indexed(str, unique=True)
    password_hash: str
    status: ManagerStatus = "PENDING"
    requested_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    requested_role_note: Optional[str] = None

    approved_by: Optional[PydanticObjectId] = None
    approved_at: Optional[datetime] = None

    rejected_by: Optional[PydanticObjectId] = None
    rejected_at: Optional[datetime] = None
    rejection_reason: Optional[str] = None

    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        name = "managers"
