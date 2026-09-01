from datetime import datetime
from beanie import PydanticObjectId
from pydantic import BaseModel, EmailStr

class CustomerBase(BaseModel):
    name: str
    email: EmailStr

class CustomerCreate(CustomerBase):
    password: str

class CustomerOut(CustomerBase):
    id: PydanticObjectId
    created_at: datetime

    class Config:
        from_attributes = True
