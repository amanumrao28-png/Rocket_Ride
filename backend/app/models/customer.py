from datetime import datetime, timezone
from typing import Optional
from beanie import Document, Indexed
from pydantic import Field

class Customer(Document):
    name: str
    email: Indexed(str, unique=True)
    password_hash: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        name = "customers"
