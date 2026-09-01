from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

from app.core.config import settings
from app.core.database import init_db
from app.api.v1.auth import router as auth_router
from app.api.v1.manager import router as manager_router
from app.api.v1.claims import router as claims_router

# Rate limiter setup
limiter = Limiter(key_func=get_remote_address, default_limits=["100/minute"])

@asynccontextmanager
async def lifespan(app: FastAPI):
    """FastAPI lifespan handler for startup index check & Beanie DB initialization."""
    try:
        await init_db()
        print("[DATABASE] MongoDB Atlas connected successfully.")
    except Exception as e:
        print(f"[DATABASE_WARNING] Could not connect to MongoDB: {e}")
        print("[DATABASE_WARNING] Ensure your IP address is whitelisted in MongoDB Atlas Network Access (0.0.0.0/0).")
    yield


app = FastAPI(
    title=settings.PROJECT_NAME,
    description="RocketRide Multi-Agent Warranty & Returns Arbitration Platform - Core Backend",
    version="1.0.0",
    lifespan=lifespan,
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global safe error handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    print(f"[INTERNAL_ERROR] {request.method} {request.url.path}: {exc}")
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "An internal server error occurred. Please try again later."},
    )

# Include API Routers
app.include_router(auth_router)
app.include_router(manager_router)
app.include_router(claims_router)

@app.get("/health", tags=["Health"])
async def health_check():
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "environment": settings.ENVIRONMENT,
        "database": "mongodb",
    }
