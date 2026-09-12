"""Small concurrency-safe in-memory cache and per-key request coalescing."""

from __future__ import annotations

import asyncio
import time
from dataclasses import dataclass

from models import AccountStatus, CheckResult


@dataclass(slots=True)
class _Entry:
    result: CheckResult
    expires_at: float


class ResultCache:
    def __init__(self, stable_ttl: float, unknown_ttl: float) -> None:
        self._stable_ttl = stable_ttl
        self._unknown_ttl = unknown_ttl
        self._entries: dict[str, _Entry] = {}
        self._key_locks: dict[str, asyncio.Lock] = {}
        self._state_lock = asyncio.Lock()

    async def get(self, username: str) -> CheckResult | None:
        async with self._state_lock:
            entry = self._entries.get(username)
            if entry is None:
                return None
            if entry.expires_at <= time.monotonic():
                self._entries.pop(username, None)
                return None
            return entry.result

    async def put(self, username: str, result: CheckResult) -> None:
        ttl = (
            self._stable_ttl
            if result.status in {AccountStatus.ACTIVE, AccountStatus.NOT_FOUND}
            else self._unknown_ttl
        )
        now = time.monotonic()
        async with self._state_lock:
            if ttl <= 0:
                self._entries.pop(username, None)
                return
            if len(self._entries) > 1000:
                self._entries = {
                    k: v for k, v in self._entries.items() if v.expires_at > now
                }
            self._entries[username] = _Entry(result, now + ttl)

    async def lock_for(self, username: str) -> asyncio.Lock:
        # Keeping a small lock per observed username avoids a subtle cleanup race.
        async with self._state_lock:
            return self._key_locks.setdefault(username, asyncio.Lock())

    async def clear(self) -> None:
        async with self._state_lock:
            self._entries.clear()
            self._key_locks.clear()
