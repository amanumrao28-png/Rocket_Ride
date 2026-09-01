import asyncio
import os
import sys

# Add backend directory to sys.path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from motor.motor_asyncio import AsyncIOMotorClient
from app.core.database import init_db
from app.core.config import settings

async def ensure_indexes():
    """
    Connect to MongoDB and ensure all Beanie document indexes exist.
    """
    print(f"[INDEX_CHECK] Connecting to MongoDB at {settings.MONGODB_URI} (DB: {settings.MONGODB_DB_NAME})...")
    client = AsyncIOMotorClient(settings.MONGODB_URI)
    await init_db(client)
    print("[INDEX_CHECK] Successfully initialized Beanie document models and verified MongoDB indexes.")

if __name__ == "__main__":
    asyncio.run(ensure_indexes())
