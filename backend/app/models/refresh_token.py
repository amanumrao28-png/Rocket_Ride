from datetime import datetime, timezone
from typing import Literal, Optional
from beanie import Document, Indexed, PydanticObjectId
from pymongo import IndexModel, ASCENDING
from pydantic import Field

UserType = Literal["CUSTOMER", "MANAGER"]

class RefreshToken(Document):
    user_id: PydanticObjectId
    user_type: UserType
    token_hash: Indexed(str, unique=True)
    issued_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    expires_at: datetime
    revoked_at: Optional[datetime] = None

    @property
    def is_active(self) -> bool:
        now = datetime.now(timezone.utc)
        return self.revoked_at is None and self.expires_at > now

    class Settings:
        name = "refresh_tokens"
        indexes = [
            IndexModel([("user_id", ASCENDING), ("revoked_at", ASCENDING)]),
            IndexModel([("expires_at", ASCENDING)], expireAfterSeconds=0),
        ]
