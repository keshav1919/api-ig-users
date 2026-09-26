"""Environment-based configuration for the shared Instagram API backend."""

from __future__ import annotations

import os
from dataclasses import dataclass, field

from dotenv import load_dotenv


class ConfigurationError(ValueError):
    """Raised when an environment setting is missing or invalid."""


def _integer(name: str, default: int, minimum: int, maximum: int) -> int:
    raw = os.getenv(name)
    if raw is None or not raw.strip():
        return default
    try:
        value = int(raw.strip())
    except ValueError as exc:
        raise ConfigurationError(f"{name} must be an integer.") from exc
    if not minimum <= value <= maximum:
        raise ConfigurationError(f"{name} must be between {minimum} and {maximum}.")
    return value


def _number(name: str, default: float, minimum: float, maximum: float) -> float:
    raw = os.getenv(name)
    if raw is None or not raw.strip():
        return default
    try:
        value = float(raw.strip())
    except ValueError as exc:
        raise ConfigurationError(f"{name} must be a number.") from exc
    if not minimum <= value <= maximum:
        raise ConfigurationError(f"{name} must be between {minimum} and {maximum}.")
    return value


def _first_non_empty(*names: str, default: str = "") -> str:
    for name in names:
        val = os.getenv(name)
        if val is not None and val.strip():
            return val.strip()
    return default


def _parse_origins(raw: str) -> list[str]:
    if not raw.strip():
        return []
    return [o.strip() for o in raw.split(",") if o.strip()]


@dataclass(frozen=True, slots=True)
class Settings:
    # Server
    api_host: str
    api_port: int
    
    # Instagram credentials
    ig_username: str
    ig_password: str
    ig_2fa_key: str
    ig_session_file: str
    ig_sessionid: str
    
    # Concurrency
    max_concurrent_checks: int
    max_batch_size: int
    
    # Cache TTLs
    cache_ttl_seconds: float
    unknown_cache_ttl_seconds: float
    profile_cache_ttl_seconds: float
    
    # Timeouts
    connect_timeout_seconds: float
    read_timeout_seconds: float
    retry_delay_seconds: float
    
    # CORS
    allowed_origins: list[str] = field(default_factory=list)
    
    # Auth
    api_key: str = ""
    
    # Rate limiting
    rate_limit_per_minute: int = 30
    batch_rate_limit_per_minute: int = 10
    
    # Proxy
    proxy_url: str = ""
    
    # Logging
    log_level: str = "INFO"

    @classmethod
    def from_environment(cls) -> "Settings":
        load_dotenv(override=False)
        
        raw_log_level = os.getenv("LOG_LEVEL")
        log_level = raw_log_level.strip().upper() if raw_log_level and raw_log_level.strip() else "INFO"
        if log_level not in {"DEBUG", "INFO", "WARNING", "ERROR", "CRITICAL"}:
            raise ConfigurationError("LOG_LEVEL must be DEBUG, INFO, WARNING, ERROR, or CRITICAL.")
        
        ig_username = _first_non_empty("IG_USERNAME", "INSTAGRAM_USERNAME")
        ig_password = _first_non_empty("IG_PASSWORD", "INSTAGRAM_PASSWORD")
        ig_2fa_key = _first_non_empty("IG_2FA_KEY", "IG_2FA_SECRET", "INSTAGRAM_2FA_KEY")
        ig_session_file = _first_non_empty("IG_SESSION_FILE", "INSTAGRAM_SESSION_FILE", default="data/ig_session.json")
        ig_sessionid = _first_non_empty("IG_SESSIONID", "INSTAGRAM_SESSIONID", default="")
        proxy_url = _first_non_empty("PROXY_URL", "HTTP_PROXY", "HTTPS_PROXY", default="")
        
        allowed_origins_raw = os.getenv("ALLOWED_ORIGINS", "")
        
        return cls(
            api_host=os.getenv("API_HOST", "0.0.0.0").strip(),
            api_port=_integer("API_PORT", 8000, 1, 65535),
            ig_username=ig_username,
            ig_password=ig_password,
            ig_2fa_key=ig_2fa_key,
            ig_session_file=ig_session_file,
            ig_sessionid=ig_sessionid,
            max_concurrent_checks=_integer("MAX_CONCURRENT_CHECKS", 5, 1, 50),
            max_batch_size=_integer("MAX_BATCH_SIZE", 100, 1, 500),
            cache_ttl_seconds=_number("CACHE_TTL_SECONDS", 45, 0, 3600),
            unknown_cache_ttl_seconds=_number("UNKNOWN_CACHE_TTL_SECONDS", 3, 0, 30),
            profile_cache_ttl_seconds=_number("PROFILE_CACHE_TTL_SECONDS", 300, 0, 3600),
            connect_timeout_seconds=_number("CONNECT_TIMEOUT_SECONDS", 5, 1, 60),
            read_timeout_seconds=_number("READ_TIMEOUT_SECONDS", 10, 1, 120),
            retry_delay_seconds=_number("RETRY_DELAY_SECONDS", 0.75, 0, 10),
            allowed_origins=_parse_origins(allowed_origins_raw),
            api_key=os.getenv("API_KEY", "").strip(),
            rate_limit_per_minute=_integer("RATE_LIMIT_PER_MINUTE", 300, 1, 5000),
            batch_rate_limit_per_minute=_integer("BATCH_RATE_LIMIT_PER_MINUTE", 60, 1, 1000),
            proxy_url=proxy_url,
            log_level=log_level,
        )
