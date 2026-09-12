"""Avatar proxy endpoint with SSRF protection."""

from __future__ import annotations

import logging

from fastapi import APIRouter, Request, Response

router = APIRouter()

LOGGER = logging.getLogger(__name__)


@router.get("/api/avatar-proxy")
async def proxy_avatar(url: str, request: Request) -> Response:
    """Proxy Instagram CDN avatar images to avoid browser CORS/referrer blocking.

    Only allows requests to known Instagram/Facebook CDN hostnames.
    """
    from app.services.avatar_proxy import is_allowed_url, fetch_avatar

    if not url:
        return Response(
            content='{"error":"URL parameter required"}',
            status_code=400,
            media_type="application/json",
        )

    if not is_allowed_url(url):
        LOGGER.warning("Avatar proxy blocked disallowed URL: %s", url[:200])
        return Response(
            content='{"error":"URL not allowed"}',
            status_code=403,
            media_type="application/json",
        )

    http_client = request.app.state.http_client
    result = await fetch_avatar(http_client, url)

    if result is None:
        return Response(
            content='{"error":"Failed to fetch avatar"}',
            status_code=502,
            media_type="application/json",
        )

    image_bytes, content_type = result
    return Response(
        content=image_bytes,
        status_code=200,
        media_type=content_type,
        headers={
            "Cache-Control": "public, max-age=86400, immutable",
        },
    )
