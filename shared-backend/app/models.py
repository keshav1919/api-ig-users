"""Shared data models and API response schemas."""

from __future__ import annotations

from dataclasses import dataclass
from enum import Enum
from typing import Any

from pydantic import BaseModel, Field


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


# ── Pydantic API Response Models ──

class HealthResponse(BaseModel):
    ok: bool = True
    service: str = "instagram-shared-api"
    authenticated: bool = False
    version: str = "1.0.0"


class ProfileResponse(BaseModel):
    exists: bool | None
    status: str
    username: str
    full_name: str = Field(alias="fullName", default="")
    profile_pic: str | None = Field(alias="profilePic", default=None)
    avatar_url: str | None = Field(alias="avatarUrl", default=None)
    raw_profile_pic: str | None = Field(alias="rawProfilePic", default=None)
    followers: str = "0"
    following: str = "0"
    posts: str = "0"
    is_private: bool = Field(alias="isPrivate", default=False)
    error: str | None = None

    model_config = {"populate_by_name": True, "by_alias": True}


class StatusResponse(BaseModel):
    username: str
    status: str
    exists: bool | None
    reason: str = ""


class BatchStatusRequest(BaseModel):
    usernames: list[str] = Field(..., max_length=500)


class BatchStatusItem(BaseModel):
    username: str
    status: str
    exists: bool | None
    reason: str = ""


class BatchStatusResponse(BaseModel):
    results: list[BatchStatusItem]


class ErrorResponse(BaseModel):
    success: bool = False
    status: str = "UNKNOWN"
    error: dict[str, str] = Field(default_factory=dict)
