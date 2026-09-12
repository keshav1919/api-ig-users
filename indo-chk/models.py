"""Shared result types."""

from __future__ import annotations

from dataclasses import dataclass
from enum import Enum


class AccountStatus(str, Enum):
    ACTIVE = "ACTIVE"
    NOT_FOUND = "NOT_FOUND"
    UNKNOWN = "UNKNOWN"
    INVALID_USERNAME = "INVALID_USERNAME"


@dataclass(frozen=True, slots=True)
class CheckResult:
    status: AccountStatus
    reason: str
    http_status: int | None = None
    duration_seconds: float = 0.0
    error_category: str | None = None
