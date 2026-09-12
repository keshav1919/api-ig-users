from __future__ import annotations

import asyncio

import pytest

from cache import ResultCache
from models import AccountStatus, CheckResult
from rate_limit import UserCooldown


@pytest.mark.asyncio
async def test_cache_returns_recent_stable_result():
    cache = ResultCache(stable_ttl=30, unknown_ttl=0)
    result = CheckResult(AccountStatus.ACTIVE, "reachable")
    await cache.put("instagram", result)
    assert await cache.get("instagram") == result


@pytest.mark.asyncio
async def test_unknown_can_be_configured_not_to_cache():
    cache = ResultCache(stable_ttl=30, unknown_ttl=0)
    await cache.put("instagram", CheckResult(AccountStatus.UNKNOWN, "ambiguous"))
    assert await cache.get("instagram") is None


@pytest.mark.asyncio
async def test_user_cooldown_blocks_immediate_second_check():
    limiter = UserCooldown(seconds=10)
    assert await limiter.allow(123) is True
    assert await limiter.allow(123) is False
    assert await limiter.allow(456) is True


@pytest.mark.asyncio
async def test_same_username_gets_same_coalescing_lock():
    cache = ResultCache(stable_ttl=30, unknown_ttl=0)
    first, second = await asyncio.gather(
        cache.lock_for("instagram"), cache.lock_for("instagram")
    )
    assert first is second


@pytest.mark.asyncio
async def test_cache_zero_ttl_invalidates_existing_entry():
    cache = ResultCache(stable_ttl=30, unknown_ttl=0)
    result = CheckResult(AccountStatus.ACTIVE, "reachable")
    await cache.put("instagram", result)
    assert await cache.get("instagram") == result

    # Putting with 0 TTL should remove existing entry
    unknown_result = CheckResult(AccountStatus.UNKNOWN, "failed")
    await cache.put("instagram", unknown_result)
    assert await cache.get("instagram") is None


def test_config_empty_env_values_fallback_to_defaults(monkeypatch):
    from config import Settings
    monkeypatch.setenv("BOT_TOKEN", "test_bot_token:123456")
    monkeypatch.setenv("MAX_CONCURRENT_CHECKS", "   ")
    monkeypatch.setenv("USER_COOLDOWN_SECONDS", "")
    monkeypatch.setenv("CACHE_TTL_SECONDS", "")
    monkeypatch.setenv("UNKNOWN_CACHE_TTL_SECONDS", "")
    monkeypatch.setenv("LOG_LEVEL", "   ")

    settings = Settings.from_environment()
    assert settings.max_concurrent_checks == 5
    assert settings.user_cooldown_seconds == 4.0
    assert settings.cache_ttl_seconds == 45.0
    assert settings.unknown_cache_ttl_seconds == 3.0
    assert settings.log_level == "INFO"

