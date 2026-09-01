import asyncio
import os
import sys
from datetime import datetime, timezone

# Add backend directory to sys.path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from motor.motor_asyncio import AsyncIOMotorClient
from app.core.config import settings
from app.core.database import init_db
from app.core.security import get_password_hash
from app.models.manager import Manager

async def seed_bootstrap_manager():
    """
    Inserts exactly one Manager document with status="APPROVED" using a real bcrypt hash
    of the password loaded from environment variable SEED_MANAGER_PASSWORD.
    Script is idempotent: checks for existing manager before inserting.
    """
    client = AsyncIOMotorClient(settings.MONGODB_URI)
    await init_db(client)

    normalized_email = settings.SEED_MANAGER_EMAIL.strip().lower()
    existing = await Manager.find_one(Manager.email == normalized_email)

    if existing:
        print(f"[SEED] Bootstrap manager '{normalized_email}' already exists with status: {existing.status}.")
        return

    now = datetime.now(timezone.utc)
    bootstrap_manager = Manager(
        name=settings.SEED_MANAGER_NAME.strip(),
        email=normalized_email,
        password_hash=get_password_hash(settings.SEED_MANAGER_PASSWORD),
        status="APPROVED",
        requested_at=now,
        requested_role_note="Head of Warranty Operations & Adjudication (Bootstrap)",
        approved_at=now,
        created_at=now,
        updated_at=now,
    )

    await bootstrap_manager.insert()
    print(f"[SEED] Successfully created bootstrap manager '{bootstrap_manager.email}' (ID: {bootstrap_manager.id}) with status=APPROVED.")

if __name__ == "__main__":
    asyncio.run(seed_bootstrap_manager())
