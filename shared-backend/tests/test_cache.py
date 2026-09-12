import asyncio
import pytest
from app.cache import ResultCache, ProfileCache
from app.models import AccountStatus, CheckResult

@pytest.mark.asyncio
async def test_result_cache_returns_recent_stable_result():
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

@pytest.mark.asyncio
async def test_profile_cache():
    cache = ProfileCache(ttl=30)
    data = {"username": "instagram", "followers": "1M"}
    await cache.put("instagram", data)
    assert await cache.get("instagram") == data
    
    # Check 0 TTL
    cache_zero = ProfileCache(ttl=0)
    await cache_zero.put("instagram", data)
    assert await cache_zero.get("instagram") is None
