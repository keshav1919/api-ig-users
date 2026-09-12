"""Simple in-memory per-Telegram-user cooldown."""

from __future__ import annotations

import asyncio
import time


class UserCooldown:
    def __init__(self, seconds: float) -> None:
        self._seconds = seconds
        self._last_check: dict[int, float] = {}
        self._lock = asyncio.Lock()

    async def allow(self, user_id: int) -> bool:
        if self._seconds <= 0:
            return True
        now = time.monotonic()
        async with self._lock:
            if len(self._last_check) > 1000:
                threshold = now - max(self._seconds * 2, 60.0)
                self._last_check = {
                    uid: ts for uid, ts in self._last_check.items() if ts > threshold
                }
            previous = self._last_check.get(user_id)
            if previous is not None and now - previous < self._seconds:
                return False
            self._last_check[user_id] = now
            return True

    async def reset(self) -> None:
        async with self._lock:
            self._last_check.clear()
