"""Health check endpoint."""

from __future__ import annotations

from fastapi import APIRouter, Request

from app.models import HealthResponse

router = APIRouter()


@router.get("/health", response_model=HealthResponse)
async def health_check(request: Request) -> HealthResponse:
    """Lightweight health check — does NOT contact Instagram."""
    checker = getattr(request.app.state, "checker", None)
    return HealthResponse(
        ok=True,
        service="instagram-shared-api",
        authenticated=checker.is_authenticated if checker else False,
        version="1.0.0",
    )


@router.get("/")
async def root(request: Request):
    """Root status endpoint."""
    checker = getattr(request.app.state, "checker", None)
    return {
        "status": "online",
        "service": "instagram-shared-api",
        "version": "1.0.0",
        "authenticated": checker.is_authenticated if checker else False,
        "docs": "/docs",
        "health": "/health",
    }

