import pytest
from datetime import datetime, timedelta, timezone
from app.models.manager import Manager
from app.models.pending_registration import PendingRegistration
from app.core.security import get_password_hash, hash_token

@pytest.mark.asyncio
async def test_register_start_invalid_syntax_email(async_client):
    res = await async_client.post("/auth/customer/register/start", json={"email": "invalid-syntax-email"})
    assert res.status_code == 400
    assert "valid email address" in res.json()["detail"]
    assert await PendingRegistration.count() == 0


@pytest.mark.asyncio
async def test_register_start_non_existent_domain_email(async_client):
    res = await async_client.post("/auth/customer/register/start", json={"email": "test@doesnotexist123456789.com"})
    assert res.status_code == 400
    assert "valid email address" in res.json()["detail"]
    assert await PendingRegistration.count() == 0


@pytest.mark.asyncio
async def test_register_start_resend_cooldown_60s(async_client):
    email = "valid.user@gmail.com"
    first = await async_client.post("/auth/customer/register/start", json={"email": email})
    assert first.status_code == 200

    second = await async_client.post("/auth/customer/register/start", json={"email": email})
    assert second.status_code == 429
    assert "wait before requesting another code" in second.json()["detail"]


@pytest.mark.asyncio
async def test_verify_otp_wrong_code(async_client):
    email = "otp.user@gmail.com"
    await async_client.post("/auth/customer/register/start", json={"email": email})

    verify = await async_client.post("/auth/customer/register/verify-otp", json={"email": email, "otp": "000000"})
    assert verify.status_code == 400
    assert "Incorrect code" in verify.json()["detail"]

    pending = await PendingRegistration.find_one(PendingRegistration.email == email)
    assert pending.otp_attempts == 1


@pytest.mark.asyncio
async def test_verify_otp_expired_code(async_client):
    email = "expired.user@gmail.com"
    await async_client.post("/auth/customer/register/start", json={"email": email})

    pending = await PendingRegistration.find_one(PendingRegistration.email == email)
    pending.otp_expires_at = datetime.now(timezone.utc) - timedelta(seconds=1)
    await pending.save()

    verify = await async_client.post("/auth/customer/register/verify-otp", json={"email": email, "otp": "123456"})
    assert verify.status_code == 400
    assert "Code expired" in verify.json()["detail"]


@pytest.mark.asyncio
async def test_verify_otp_max_attempts_exceeded(async_client):
    email = "maxattempts.user@gmail.com"
    await async_client.post("/auth/customer/register/start", json={"email": email})

    pending = await PendingRegistration.find_one(PendingRegistration.email == email)
    pending.otp_attempts = 5
    await pending.save()

    verify = await async_client.post("/auth/customer/register/verify-otp", json={"email": email, "otp": "123456"})
    assert verify.status_code == 429
    assert "Too many incorrect attempts" in verify.json()["detail"]


@pytest.mark.asyncio
async def test_register_complete_unverified_fails(async_client):
    res = await async_client.post(
        "/auth/customer/register/complete",
        json={
            "email": "unverified@gmail.com",
            "verified_token": "fake_token",
            "name": "Fake Name",
            "password": "Password123",
            "confirm_password": "Password123",
        }
    )
    assert res.status_code == 401
    assert "Email not verified" in res.json()["detail"]


@pytest.mark.asyncio
async def test_register_complete_password_mismatch(async_client):
    res = await async_client.post(
        "/auth/customer/register/complete",
        json={
            "email": "test@gmail.com",
            "verified_token": "fake_token",
            "name": "Test User",
            "password": "Password123",
            "confirm_password": "DifferentPassword123",
        }
    )
    assert res.status_code == 400
    assert "Passwords do not match" in res.json()["detail"]


@pytest.mark.asyncio
async def test_full_customer_happy_path(async_client):
    email = "sarah.jenkins@gmail.com"
    password = "SecurePassword123"

    # Step A: Start
    start_res = await async_client.post("/auth/customer/register/start", json={"email": email})
    assert start_res.status_code == 200

    pending = await PendingRegistration.find_one(PendingRegistration.email == email)
    # Simulate valid OTP matching
    pending.otp_hash = hash_token("654321")
    await pending.save()

    # Step B: Verify OTP
    verify_res = await async_client.post("/auth/customer/register/verify-otp", json={"email": email, "otp": "654321"})
    assert verify_res.status_code == 200
    verified_token = verify_res.json()["verified_token"]

    # Step C: Complete Registration
    comp_res = await async_client.post(
        "/auth/customer/register/complete",
        json={
            "email": email,
            "verified_token": verified_token,
            "name": "Sarah Jenkins",
            "password": password,
            "confirm_password": password,
        }
    )
    assert comp_res.status_code == 201
    assert "access_token" in comp_res.json()

    # Immediately log in
    login_res = await async_client.post("/auth/customer/login", json={"email": email, "password": password})
    assert login_res.status_code == 200


@pytest.mark.asyncio
async def test_full_manager_happy_path_with_approval_gate(async_client):
    now = datetime.now(timezone.utc)
    bootstrap = Manager(
        name="Marcus Vance",
        email="bootstrap.manager@warrantyarbiter.demo",
        password_hash=get_password_hash("BootstrapPass123"),
        status="APPROVED",
        requested_at=now,
        created_at=now,
        updated_at=now,
    )
    await bootstrap.insert()

    b_login = await async_client.post(
        "/auth/manager/login",
        json={"email": "bootstrap.manager@warrantyarbiter.demo", "password": "BootstrapPass123"}
    )
    bootstrap_token = b_login.json()["access_token"]

    manager_email = "new.manager@gmail.com"
    manager_pass = "ManagerSecure123"

    # Step A: Start
    start_res = await async_client.post(
        "/auth/manager/register/start",
        json={"email": manager_email, "reason": "EU Lead"}
    )
    assert start_res.status_code == 200

    pending = await PendingRegistration.find_one(PendingRegistration.email == manager_email)
    pending.otp_hash = hash_token("987654")
    await pending.save()

    # Step B: Verify OTP
    verify_res = await async_client.post("/auth/manager/register/verify-otp", json={"email": manager_email, "otp": "987654"})
    assert verify_res.status_code == 200
    verified_token = verify_res.json()["verified_token"]

    # Step C: Complete Registration
    comp_res = await async_client.post(
        "/auth/manager/register/complete",
        json={
            "email": manager_email,
            "verified_token": verified_token,
            "name": "New Manager",
            "password": manager_pass,
            "confirm_password": manager_pass,
        }
    )
    assert comp_res.status_code == 201
    assert comp_res.json()["manager"]["status"] == "PENDING"
    new_mgr_id = comp_res.json()["manager"]["id"]

    # Login should be blocked with PENDING status (403)
    login_blocked = await async_client.post("/auth/manager/login", json={"email": manager_email, "password": manager_pass})
    assert login_blocked.status_code == 403

    # Approve via bootstrap manager
    approve_res = await async_client.post(
        f"/manager/approvals/{new_mgr_id}/approve",
        headers={"Authorization": f"Bearer {bootstrap_token}"}
    )
    assert approve_res.status_code == 200

    # Login should now succeed
    login_cleared = await async_client.post("/auth/manager/login", json={"email": manager_email, "password": manager_pass})
    assert login_cleared.status_code == 200
