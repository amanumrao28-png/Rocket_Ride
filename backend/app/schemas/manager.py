from datetime import datetime
from typing import Literal, Optional
from beanie import PydanticObjectId
from pydantic import BaseModel, EmailStr

ManagerStatus = Literal["PENDING", "APPROVED", "REJECTED"]

class ManagerBase(BaseModel):
    name: str
    email: EmailStr

class ManagerCreate(ManagerBase):
    password: str
    reason: Optional[str] = None

class ManagerRejectRequest(BaseModel):
    reason: str

class ManagerOut(ManagerBase):
    id: PydanticObjectId
    status: ManagerStatus
    requested_at: datetime
    requested_role_note: Optional[str] = None
    approved_by: Optional[PydanticObjectId] = None
    approved_at: Optional[datetime] = None
    rejected_by: Optional[PydanticObjectId] = None
    rejected_at: Optional[datetime] = None
    rejection_reason: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True
