"""Environment-based configuration for the Telegram bot."""

from __future__ import annotations

import os
from dataclasses import dataclass

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
        raise ConfigurationError(
            f"{name} must be between {minimum} and {maximum}."
        )
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
        raise ConfigurationError(
            f"{name} must be between {minimum} and {maximum}."
        )
    return value


def _first_non_empty(*names: str, default: str = "") -> str:
    for name in names:
        val = os.getenv(name)
        if val is not None and val.strip():
            return val.strip()
    return default


@dataclass(frozen=True, slots=True)
class Settings:
    bot_token: str
    ig_username: str
    ig_password: str
    ig_2fa_key: str
    ig_session_file: str
    max_concurrent_checks: int
    user_cooldown_seconds: float
    cache_ttl_seconds: float
    unknown_cache_ttl_seconds: float
    connect_timeout_seconds: float
    read_timeout_seconds: float
    retry_delay_seconds: float
    log_level: str
    ig_sessionid: str = ""
    shared_api_base_url: str = "http://localhost:8000"
    shared_api_key: str = ""
    max_batch_size: int = 100

    @classmethod
    def from_environment(cls) -> "Settings":
        # Existing process variables take precedence over values in .env.
        load_dotenv(override=False)
        token = os.getenv("BOT_TOKEN", "").strip()
        if not token:
            raise ConfigurationError(
                "BOT_TOKEN is missing. Set the BOT_TOKEN environment variable and try again."
            )

        raw_log_level = os.getenv("LOG_LEVEL")
        log_level = raw_log_level.strip().upper() if raw_log_level and raw_log_level.strip() else "INFO"
        if log_level not in {"DEBUG", "INFO", "WARNING", "ERROR", "CRITICAL"}:
            raise ConfigurationError(
                "LOG_LEVEL must be DEBUG, INFO, WARNING, ERROR, or CRITICAL."
            )

        ig_username = _first_non_empty("IG_USERNAME", "INSTAGRAM_USERNAME")
        ig_password = _first_non_empty("IG_PASSWORD", "INSTAGRAM_PASSWORD")
        ig_2fa_key = _first_non_empty(
            "IG_2FA_KEY", "IG_2FA_SECRET", "INSTAGRAM_2FA_KEY", "INSTAGRAM_2FA_SECRET"
        )
        ig_session_file = _first_non_empty(
            "IG_SESSION_FILE", "INSTAGRAM_SESSION_FILE", default="ig_session.json"
        )
        ig_sessionid = _first_non_empty(
            "IG_SESSIONID", "INSTAGRAM_SESSIONID", "IG_SESSION_ID", default=""
        )
        shared_api_base_url = _first_non_empty(
            "SHARED_API_BASE_URL", "API_BASE_URL", default="http://localhost:8000"
        ).rstrip("/")
        shared_api_key = _first_non_empty(
            "SHARED_API_KEY", "API_KEY", default=""
        )

        return cls(
            bot_token=token,
            ig_username=ig_username,
            ig_password=ig_password,
            ig_2fa_key=ig_2fa_key,
            ig_session_file=ig_session_file,
            max_concurrent_checks=_integer("MAX_CONCURRENT_CHECKS", 5, 1, 50),
            user_cooldown_seconds=_number("USER_COOLDOWN_SECONDS", 4, 0, 300),
            cache_ttl_seconds=_number("CACHE_TTL_SECONDS", 45, 0, 3600),
            unknown_cache_ttl_seconds=_number(
                "UNKNOWN_CACHE_TTL_SECONDS", 3, 0, 30
            ),
            connect_timeout_seconds=_number(
                "CONNECT_TIMEOUT_SECONDS", 5, 1, 60
            ),
            read_timeout_seconds=_number("READ_TIMEOUT_SECONDS", 10, 1, 120),
            retry_delay_seconds=_number("RETRY_DELAY_SECONDS", 0.75, 0, 10),
            log_level=log_level,
            ig_sessionid=ig_sessionid,
            shared_api_base_url=shared_api_base_url,
            shared_api_key=shared_api_key,
            max_batch_size=_integer("MAX_BATCH_SIZE", 100, 1, 2000),
        )
