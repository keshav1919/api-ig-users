"""IP-based sliding window rate limiter middleware."""

from __future__ import annotations

import asyncio
import logging
import time
from collections import defaultdict
from typing import Callable

from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware

LOGGER = logging.getLogger(__name__)


class _SlidingWindow:
    """Per-key sliding window counter."""

    def __init__(self, window_seconds: float = 60.0, max_requests: int = 30) -> None:
        self._window = window_seconds
        self._max = max_requests
        self._hits: dict[str, list[float]] = defaultdict(list)
        self._lock = asyncio.Lock()

    async def is_allowed(self, key: str) -> bool:
        now = time.monotonic()
        cutoff = now - self._window
        async with self._lock:
            timestamps = self._hits[key]
            # Remove expired entries
            self._hits[key] = [t for t in timestamps if t > cutoff]
            if len(self._hits[key]) >= self._max:
                return False
            self._hits[key].append(now)
            return True

    async def cleanup(self) -> None:
        now = time.monotonic()
        cutoff = now - self._window * 2
        async with self._lock:
            expired_keys = [
                k for k, v in self._hits.items()
                if not v or v[-1] < cutoff
            ]
            for k in expired_keys:
                del self._hits[k]


class RateLimitMiddleware(BaseHTTPMiddleware):
    """Apply per-IP rate limiting to API endpoints."""

    def __init__(
        self,
        app,
        default_rpm: int = 30,
        batch_rpm: int = 10,
    ) -> None:
        super().__init__(app)
        self._default_limiter = _SlidingWindow(60.0, default_rpm)
        self._batch_limiter = _SlidingWindow(60.0, batch_rpm)

    def _get_client_ip(self, request: Request) -> str:
        """Extract client IP, preferring X-Forwarded-For when behind a proxy."""
        forwarded = request.headers.get("X-Forwarded-For")
        if forwarded:
            # Take the first (client) IP only — do not trust blindly
            return forwarded.split(",")[0].strip()
        if request.client:
            return request.client.host
        return "unknown"

    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        path = request.url.path

        # Only rate-limit API endpoints
        if not path.startswith("/api/"):
            return await call_next(request)

        client_ip = self._get_client_ip(request)

        # Use stricter limiter for batch endpoint
        if path == "/api/status/batch":
            limiter = self._batch_limiter
        else:
            limiter = self._default_limiter

        if not await limiter.is_allowed(client_ip):
            LOGGER.warning("Rate limit exceeded for %s on %s", client_ip, path)
            return Response(
                content='{"success":false,"status":"UNKNOWN","error":{"code":"RATE_LIMITED","message":"Too many requests. Please try again later."}}',
                status_code=429,
                media_type="application/json",
                headers={"Retry-After": "60"},
            )

        return await call_next(request)
