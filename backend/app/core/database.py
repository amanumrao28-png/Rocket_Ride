from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie
from app.core.config import settings

async def init_db(client: AsyncIOMotorClient = None):
    """
    Initialize AsyncIOMotorClient and Beanie ODM with document models.
    Automatically ensures indexes (unique on email, TTL on refresh_tokens/pending_registrations).
    """
    from app.models.customer import Customer
    from app.models.manager import Manager
    from app.models.refresh_token import RefreshToken
    from app.models.pending_registration import PendingRegistration

    if client is None:
        client = AsyncIOMotorClient(
            settings.MONGODB_URI,
            serverSelectionTimeoutMS=5000,
            connectTimeoutMS=5000,
        )

    database = client[settings.MONGODB_DB_NAME]
    await init_beanie(
        database=database,
        document_models=[Customer, Manager, RefreshToken, PendingRegistration]
    )
    return client

