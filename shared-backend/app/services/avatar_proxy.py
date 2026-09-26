import ipaddress
import logging
import re
import socket
from typing import Optional, Tuple
from urllib.parse import urlparse

import httpx

LOGGER = logging.getLogger(__name__)

ALLOWED_HOST_PATTERNS = [
    re.compile(r"^.*\.cdninstagram\.com$"),
    re.compile(r"^.*\.fbcdn\.net$"),
    re.compile(r"^.*\.instagram\.com$"),
    re.compile(r"^ui-avatars\.com$"),
    re.compile(r"^scontent[\w-]*\.xx\.fbcdn\.net$"),
]

def is_allowed_url(url: str) -> bool:
    try:
        parsed = urlparse(url)
        if parsed.scheme not in ("http", "https"):
            return False
            
        hostname = parsed.hostname
        if not hostname:
            return False

        if not any(pattern.match(hostname) for pattern in ALLOWED_HOST_PATTERNS):
            return False

        # Resolve hostname to check for private IPs
        # This is a synchronous DNS resolution, might block, but standard for security checks
        try:
            ip_address = socket.gethostbyname(hostname)
            ip_obj = ipaddress.ip_address(ip_address)
            if ip_obj.is_private or ip_obj.is_loopback or ip_obj.is_link_local:
                return False
        except socket.gaierror:
            return False

        return True
    except Exception:
        return False

async def fetch_avatar(client: httpx.AsyncClient, image_url: str) -> Optional[Tuple[bytes, str]]:
    if not is_allowed_url(image_url):
        return None

    try:
        try:
            response = await client.get(
                image_url,
                headers={
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
                    "Accept": "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
                    "Referer": "https://www.instagram.com/",
                },
                timeout=10.0
            )
        except (httpx.ProxyError, httpx.ConnectError) as p_err:
            LOGGER.warning("Proxy error fetching avatar (%s). Retrying directly...", p_err)
            async with httpx.AsyncClient(timeout=10.0, trust_env=False) as direct_c:
                response = await direct_c.get(
                    image_url,
                    headers={
                        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
                        "Accept": "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
                        "Referer": "https://www.instagram.com/",
                    },
                )
        if response.status_code == 200:
            content_type = response.headers.get("content-type", "image/jpeg")
            return response.content, content_type
    except Exception as e:
        LOGGER.warning(f"Failed to proxy avatar: {e}")
        
    return None
