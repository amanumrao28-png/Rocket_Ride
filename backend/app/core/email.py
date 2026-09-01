import secrets
import aiosmtplib
from email.message import EmailMessage
from email_validator import validate_email, EmailNotValidError
from app.core.config import settings

def validate_email_address(email: str) -> str:
    """
    Validate email RFC syntax and DNS MX deliverability record using email-validator.
    Returns normalized email string (lowercased, trimmed).
    Raises ValueError on failure.
    """
    try:
        valid = validate_email(email.strip(), check_deliverability=True)
        return valid.normalized.lower()
    except EmailNotValidError as e:
        raise ValueError(f"Please enter a valid email address. Details: {str(e)}")

def generate_secure_otp() -> int:
    """
    Generate a 6-digit numeric OTP using Python's cryptographically secure secrets module.
    Rides on SystemRandom (hardware/OS entropy), never pseudo-random numbers.
    """
    return secrets.SystemRandom().randint(100000, 999999)

async def send_otp_email(recipient_email: str, otp_code: int) -> None:
    """
    Send OTP verification email.
    Supports real SMTP delivery via aiosmtplib or dev console fallback.
    NEVER logs the raw OTP plaintext code.
    """
    subject = "Your Warranty Arbiter verification code"
    body = (
        f"Hello,\n\n"
        f"Your verification code for Warranty Arbiter is: {otp_code}\n\n"
        f"This code will expire in 10 minutes.\n"
        f"If you did not request this code, please ignore this email.\n\n"
        f"Best regards,\n"
        f"RocketRide Warranty & Returns Arbiter Team"
    )

    # Console / Dev fallback
    if settings.EMAIL_PROVIDER.lower() == "console" or not settings.SMTP_USER:
        print(f"[EMAIL_DEV_CONSOLE] To: {recipient_email} | Subject: '{subject}' | Status: Sent (Dev Mode)")
        return

    # Real SMTP delivery via aiosmtplib
    message = EmailMessage()
    message["From"] = settings.EMAIL_FROM_ADDRESS
    message["To"] = recipient_email
    message["Subject"] = subject
    message.set_content(body)

    try:
        await aiosmtplib.send(
            message,
            hostname=settings.SMTP_HOST,
            port=settings.SMTP_PORT,
            username=settings.SMTP_USER,
            password=settings.SMTP_PASS,
            start_tls=True,
        )
        print(f"[EMAIL_SENT] OTP verification email dispatched to {recipient_email}")
    except Exception as e:
        print(f"[EMAIL_ERROR] Failed to send SMTP email to {recipient_email}: {e}")
        # In case of SMTP connection error, raise RuntimeError
        raise RuntimeError("Failed to send verification email. Please try again later.")
