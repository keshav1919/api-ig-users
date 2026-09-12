"""FastAPI application entry point for the shared Instagram API backend."""

from __future__ import annotations

import asyncio
import logging
import sys
from contextlib import asynccontextmanager

import httpx
import uvicorn
from fastapi import FastAPI

from app.cache import ProfileCache, ResultCache
from app.config import ConfigurationError, Settings
from app.middleware.auth import ApiKeyMiddleware
from app.middleware.cors_config import configure_cors
from app.middleware.rate_limit import RateLimitMiddleware
from app.routes import avatar, health, instagram, settings as settings_route, status
from app.services.instagram_profile import InstagramProfileScraper
from app.services.instagram_status import InstagramChecker

LOGGER = logging.getLogger(__name__)


def configure_logging(level: str) -> None:
    """Set up structured logging."""
    logging.basicConfig(
        level=getattr(logging, level, logging.INFO),
        format="%(asctime)s %(levelname)s %(name)s %(message)s",
        stream=sys.stdout,
    )
    # Reduce noise from HTTP libraries
    logging.getLogger("httpx").setLevel(logging.WARNING)
    logging.getLogger("httpcore").setLevel(logging.WARNING)
    logging.getLogger("uvicorn.access").setLevel(logging.WARNING)
    logging.getLogger("instagrapi").setLevel(logging.WARNING)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Manage application lifecycle: startup and shutdown."""
    settings: Settings = app.state.settings

    # Create shared HTTP client
    http_client = httpx.AsyncClient(
        timeout=httpx.Timeout(
            connect=settings.connect_timeout_seconds,
            read=settings.read_timeout_seconds,
            write=10.0,
            pool=10.0,
        ),
        follow_redirects=True,
        limits=httpx.Limits(
            max_connections=100,
            max_keepalive_connections=50,
        ),
    )
    app.state.http_client = http_client

    # Create Instagram status checker
    checker = InstagramChecker(
        username=settings.ig_username,
        password=settings.ig_password,
        two_factor_key=settings.ig_2fa_key,
        session_file=settings.ig_session_file,
        sessionid=settings.ig_sessionid,
        connect_timeout=settings.connect_timeout_seconds,
        read_timeout=settings.read_timeout_seconds,
        retry_delay=settings.retry_delay_seconds,
    )
    app.state.checker = checker

    # Create Instagram profile scraper
    profiler = InstagramProfileScraper(http_client)
    app.state.profiler = profiler

    # Create caches
    status_cache = ResultCache(
        stable_ttl=settings.cache_ttl_seconds,
        unknown_ttl=settings.unknown_cache_ttl_seconds,
    )
    app.state.status_cache = status_cache

    profile_cache = ProfileCache(ttl=settings.profile_cache_ttl_seconds)
    app.state.profile_cache = profile_cache

    # Create concurrency semaphore
    semaphore = asyncio.Semaphore(settings.max_concurrent_checks)
    app.state.semaphore = semaphore

    # Pre-warm Instagram session
    LOGGER.info("Initializing Instagram session...")
    try:
        authenticated = await checker.authenticate(force_relogin=False)
        if authenticated:
            LOGGER.info("Instagram session authenticated successfully.")
        else:
            LOGGER.warning(
                "Instagram session not authenticated. "
                "Checks will attempt login on first request."
            )
    except Exception as exc:
        LOGGER.warning("Initial Instagram authentication warning: %s", exc)

    LOGGER.info(
        "Shared API backend ready — host=%s port=%d concurrent=%d",
        settings.api_host,
        settings.api_port,
        settings.max_concurrent_checks,
    )

    yield

    # Shutdown
    LOGGER.info("Shutting down...")
    await checker.close()
    await http_client.aclose()
    await status_cache.clear()
    await profile_cache.clear()
    LOGGER.info("Shutdown complete.")


def create_app(settings: Settings | None = None) -> FastAPI:
    """Create and configure the FastAPI application."""
    if settings is None:
        settings = Settings.from_environment()

    configure_logging(settings.log_level)

    app = FastAPI(
        title="Instagram Shared API",
        description="Shared backend for Instagram username checking and profile lookup",
        version="1.0.0",
        lifespan=lifespan,
    )

    # Store settings on app state
    app.state.settings = settings

    # Add middleware (order matters: in Starlette, last added wraps outermost)
    app.add_middleware(ApiKeyMiddleware, api_key=settings.api_key)
    app.add_middleware(
        RateLimitMiddleware,
        default_rpm=settings.rate_limit_per_minute,
        batch_rpm=settings.batch_rate_limit_per_minute,
    )
    configure_cors(app, settings.allowed_origins)

    # Register routes
    app.include_router(health.router)
    app.include_router(instagram.router)
    app.include_router(status.router)
    app.include_router(avatar.router)
    app.include_router(settings_route.router)

    return app


def main() -> int:
    """Entry point for running the server."""
    try:
        settings = Settings.from_environment()
    except ConfigurationError as exc:
        print(f"ERROR: {exc}", file=sys.stderr)
        return 1

    configure_logging(settings.log_level)

    print("=" * 50)
    print("Instagram Shared API Backend")
    print("=" * 50)
    print(f"Host:    {settings.api_host}")
    print(f"Port:    {settings.api_port}")
    print(f"Workers: {settings.max_concurrent_checks} concurrent checks")
    print("=" * 50)

    app = create_app(settings)

    uvicorn.run(
        app,
        host=settings.api_host,
        port=settings.api_port,
        log_level=settings.log_level.lower(),
        access_log=False,
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
