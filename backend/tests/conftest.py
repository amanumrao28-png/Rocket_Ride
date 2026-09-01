import asyncio
import pytest
import pytest_asyncio
from mongomock_motor import AsyncMongoMockClient
from beanie import init_beanie
from app.models.customer import Customer
from app.models.manager import Manager
from app.models.refresh_token import RefreshToken
from app.main import app
from httpx import AsyncClient, ASGITransport

@pytest.fixture(scope="session")
def event_loop():
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()

@pytest_asyncio.fixture(scope="function", autouse=True)
async def init_test_db():
    client = AsyncMongoMockClient()
    database = client["test_db"]
    await init_beanie(
        database=database,
        document_models=[Customer, Manager, RefreshToken]
    )
    yield
    await database.drop_collection("customers")
    await database.drop_collection("managers")
    await database.drop_collection("refresh_tokens")

@pytest_asyncio.fixture
async def async_client():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        yield ac
