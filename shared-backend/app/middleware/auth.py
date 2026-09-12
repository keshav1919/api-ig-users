"""Optional API key authentication middleware."""

from __future__ import annotations

import logging
from typing import Callable

from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware

LOGGER = logging.getLogger(__name__)


class ApiKeyMiddleware(BaseHTTPMiddleware):
    """Validates X-API-Key header for protected endpoints.

    Public endpoints (profile lookup, health, avatar proxy) do not require a key.
    Server-to-server endpoints (batch status) require a valid key when configured.
    """

    def __init__(self, app, api_key: str = "") -> None:
        super().__init__(app)
        self._api_key = api_key.strip()

    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        # Store the API key validation result on request state for routes to check
        request.state.api_key_valid = False
        if self._api_key:
            provided = request.headers.get("X-API-Key", "").strip()
            if provided and provided == self._api_key:
                request.state.api_key_valid = True
        else:
            # No API key configured — all requests are allowed
            request.state.api_key_valid = True

        return await call_next(request)
