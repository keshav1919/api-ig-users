"""Status checking endpoints for the Telegram bot."""

from __future__ import annotations

import asyncio
import logging
import time

from fastapi import APIRouter, HTTPException, Request

from app.models import (
    AccountStatus,
    BatchStatusItem,
    BatchStatusRequest,
    BatchStatusResponse,
    CheckResult,
    StatusResponse,
)
from app.username import normalize_username

router = APIRouter()

LOGGER = logging.getLogger(__name__)


@router.get("/api/status/{username:path}", response_model=StatusResponse)
async def check_status(username: str, request: Request) -> StatusResponse:
    """Lightweight status check optimized for the Telegram bot."""
    started = time.monotonic()

    normalized = normalize_username(username)
    if normalized is None:
        return StatusResponse(
            username=username[:30],
            status=AccountStatus.INVALID_USERNAME.value,
            exists=False,
            reason="Invalid username format",
        )

    checker = request.app.state.checker
    status_cache = request.app.state.status_cache
    semaphore = request.app.state.semaphore

    # Check cache
    cached = await status_cache.get(normalized)
    if cached is not None:
        exists = True if cached.status == AccountStatus.ACTIVE else (
            False if cached.status == AccountStatus.NOT_FOUND else None
        )
        LOGGER.info(
            "status endpoint username=%s status=%s cache=hit duration_ms=%d",
            normalized, cached.status.value,
            round((time.monotonic() - started) * 1000),
        )
        return StatusResponse(
            username=normalized,
            status=cached.status.value,
            exists=exists,
            reason=cached.reason,
        )

    # Coalesce duplicate requests
    key_lock = await status_cache.lock_for(normalized)
    async with key_lock:
        cached = await status_cache.get(normalized)
        if cached is not None:
            exists = True if cached.status == AccountStatus.ACTIVE else (
                False if cached.status == AccountStatus.NOT_FOUND else None
            )
            return StatusResponse(
                username=normalized,
                status=cached.status.value,
                exists=exists,
                reason=cached.reason,
            )

        profiler = getattr(request.app.state, "profiler", None)
        async with semaphore:
            result = await checker.check(normalized)
            if result.status == AccountStatus.UNKNOWN and profiler:
                try:
                    p_data = await profiler.fetch_profile(normalized)
                    if p_data and p_data.exists:
                        acc_type = "Private account" if p_data.is_private else "Public account"
                        result = CheckResult(
                            status=AccountStatus.ACTIVE,
                            reason=f"{acc_type} found: {p_data.full_name or normalized}",
                        )
                    else:
                        result = CheckResult(
                            status=AccountStatus.NOT_FOUND,
                            reason="Account does not exist or is suspended",
                        )
                except Exception as exc:
                    LOGGER.warning("Secondary profile check failed for %s: %s", normalized, exc)

        await status_cache.put(normalized, result)

    exists = True if result.status == AccountStatus.ACTIVE else (
        False if result.status == AccountStatus.NOT_FOUND else None
    )

    duration_ms = round((time.monotonic() - started) * 1000)
    LOGGER.info(
        "status endpoint username=%s status=%s cache=miss duration_ms=%d",
        normalized, result.status.value, duration_ms,
    )

    return StatusResponse(
        username=normalized,
        status=result.status.value,
        exists=exists,
        reason=result.reason,
    )


@router.post("/api/status/batch", response_model=BatchStatusResponse)
async def batch_check_status(body: BatchStatusRequest, request: Request) -> BatchStatusResponse:
    """Batch status check for multiple usernames.

    Requires API key authentication when configured.
    """
    # Check API key for batch endpoint
    if not getattr(request.state, "api_key_valid", False):
        raise HTTPException(status_code=403, detail="API key required for batch endpoint")

    settings = request.app.state.settings
    max_batch = settings.max_batch_size

    if len(body.usernames) > max_batch:
        raise HTTPException(
            status_code=400,
            detail=f"Maximum {max_batch} usernames per batch request",
        )

    if not body.usernames:
        return BatchStatusResponse(results=[])

    checker = request.app.state.checker
    status_cache = request.app.state.status_cache
    semaphore = request.app.state.semaphore

    # Normalize and validate all usernames, preserving order
    normalized_map: list[tuple[str, str | None]] = []
    for raw in body.usernames:
        norm = normalize_username(raw)
        normalized_map.append((raw, norm))

    async def check_one(raw: str, normalized: str | None) -> BatchStatusItem:
        if normalized is None:
            return BatchStatusItem(
                username=raw[:30],
                status=AccountStatus.INVALID_USERNAME.value,
                exists=False,
                reason="Invalid username format",
            )

        # Check cache
        cached = await status_cache.get(normalized)
        if cached is not None:
            exists = True if cached.status == AccountStatus.ACTIVE else (
                False if cached.status == AccountStatus.NOT_FOUND else None
            )
            return BatchStatusItem(
                username=normalized,
                status=cached.status.value,
                exists=exists,
                reason=cached.reason,
            )

        # Coalesce and check
        key_lock = await status_cache.lock_for(normalized)
        async with key_lock:
            cached = await status_cache.get(normalized)
            if cached is not None:
                exists = True if cached.status == AccountStatus.ACTIVE else (
                    False if cached.status == AccountStatus.NOT_FOUND else None
                )
                return BatchStatusItem(
                    username=normalized,
                    status=cached.status.value,
                    exists=exists,
                    reason=cached.reason,
                )

            profiler = getattr(request.app.state, "profiler", None)
            try:
                async with semaphore:
                    result = await checker.check(normalized)
                    if result.status == AccountStatus.UNKNOWN and profiler:
                        try:
                            p_data = await profiler.fetch_profile(normalized)
                            if p_data and p_data.exists:
                                acc_type = "Private account" if p_data.is_private else "Public account"
                                result = CheckResult(
                                    status=AccountStatus.ACTIVE,
                                    reason=f"{acc_type} found: {p_data.full_name or normalized}",
                                )
                            else:
                                result = CheckResult(
                                    status=AccountStatus.NOT_FOUND,
                                    reason="Account does not exist or is suspended",
                                )
                        except Exception as exc:
                            LOGGER.warning("Secondary profile check failed for %s: %s", normalized, exc)

                await status_cache.put(normalized, result)
            except Exception as exc:
                LOGGER.error("Batch check error for %s: %s", normalized, exc)
                result = None

        if result is None:
            return BatchStatusItem(
                username=normalized,
                status=AccountStatus.UNKNOWN.value,
                exists=None,
                reason="Internal error during check",
            )

        exists = True if result.status == AccountStatus.ACTIVE else (
            False if result.status == AccountStatus.NOT_FOUND else None
        )
        return BatchStatusItem(
            username=normalized,
            status=result.status.value,
            exists=exists,
            reason=result.reason,
        )

    # Run all checks concurrently (semaphore controls actual Instagram concurrency)
    tasks = [check_one(raw, norm) for raw, norm in normalized_map]
    results = await asyncio.gather(*tasks, return_exceptions=True)

    # Convert any exceptions to UNKNOWN results
    final_results: list[BatchStatusItem] = []
    for i, r in enumerate(results):
        if isinstance(r, Exception):
            raw = body.usernames[i] if i < len(body.usernames) else "unknown"
            LOGGER.error("Batch check exception for %s: %s", raw, r)
            final_results.append(BatchStatusItem(
                username=raw[:30],
                status=AccountStatus.UNKNOWN.value,
                exists=None,
                reason="Internal error",
            ))
        else:
            final_results.append(r)

    LOGGER.info("batch endpoint count=%d", len(final_results))
    return BatchStatusResponse(results=final_results)
