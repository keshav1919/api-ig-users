"""Instagram username input normalization and validation."""

from __future__ import annotations

import re
from urllib.parse import unquote, urlsplit


USERNAME_PATTERN = re.compile(r"^[A-Za-z0-9._]{1,30}$")
MAX_INPUT_LENGTH = 500
ALLOWED_HOSTS = {
    "instagram.com",
    "www.instagram.com",
    "m.instagram.com",
    "instagr.am",
    "www.instagr.am",
}
RESERVED_PATHS = {
    "explore",
    "direct",
    "accounts",
    "emails",
    "developer",
    "about",
    "legal",
    "privacy",
    "terms",
    "support",
    "help",
    "api",
    "p",
    "reel",
    "reels",
    "tv",
}


def normalize_username(value: str | None) -> str | None:
    """Return a normalized username, or None when the input is malformed."""
    if not isinstance(value, str):
        return None

    candidate = value.strip().strip("\"'`")
    if not candidate or len(candidate) > MAX_INPUT_LENGTH:
        return None

    # Handle domain without scheme (e.g., instagram.com/username, www.instagram.com/username)
    lower_candidate = candidate.lower()
    for host in ALLOWED_HOSTS:
        if lower_candidate.startswith(f"{host}/") or lower_candidate == host:
            candidate = f"https://{candidate}"
            break

    if candidate.lower().startswith(("http://", "https://")):
        try:
            parsed = urlsplit(candidate)
            port = parsed.port
        except ValueError:
            return None
        if (
            parsed.scheme.lower() not in {"http", "https"}
            or parsed.hostname is None
            or parsed.hostname.lower() not in ALLOWED_HOSTS
            or parsed.username is not None
            or parsed.password is not None
            or port not in {None, 80, 443}
        ):
            return None
        path_parts = [unquote(part) for part in parsed.path.split("/") if part]
        if not path_parts:
            return None
        if len(path_parts) == 1:
            candidate = path_parts[0]
        elif len(path_parts) == 2 and path_parts[0] in {"_u", "u"}:
            candidate = path_parts[1]
        elif path_parts[0] == "stories" and len(path_parts) >= 2:
            candidate = path_parts[1]
        else:
            return None
    else:
        if "/" in candidate or "?" in candidate or "#" in candidate:
            return None
        candidate = candidate.lstrip("@").strip().strip("\"'`")

    if not candidate or candidate.lower() in RESERVED_PATHS:
        return None
    if not USERNAME_PATTERN.fullmatch(candidate):
        return None
    if candidate.startswith(".") or candidate.endswith("."):
        return None
    if ".." in candidate:
        return None
    return candidate.lower()


def is_valid_username(value: str) -> bool:
    """Validate an already extracted Instagram username."""
    if not isinstance(value, str):
        return False
    candidate = value.strip().strip("\"'`").lstrip("@").lower()
    if candidate in RESERVED_PATHS:
        return False
    return bool(USERNAME_PATTERN.fullmatch(candidate))
