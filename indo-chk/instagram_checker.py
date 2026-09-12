"""Authenticated Instagram account status checker using in-app search and session persistence."""

from __future__ import annotations

import asyncio
import logging
import os
import pathlib
import time
from typing import Any

import pyotp
import requests
from instagrapi import Client
from instagrapi.exceptions import (
    BadCredentials,
    BadPassword,
    ChallengeRequired,
    ClientConnectionError,
    ClientForbiddenError,
    ClientLoginRequired,
    ClientRequestTimeout,
    ClientThrottledError,
    ClientUnauthorizedError,
    FeedbackRequired,
    LoginRequired,
    PleaseWaitFewMinutes,
    RateLimitError,
    SentryBlock,
    TwoFactorRequired,
)

from models import AccountStatus, CheckResult

LOGGER = logging.getLogger(__name__)


class InstagramChecker:
    """Checks account active status via authenticated Instagram search.
    
    If the exact username appears in search results, the account is ACTIVE.
    If it does not appear in search results, it is classified as NOT FOUND / SUSPENDED.
    """

    def __init__(
        self,
        *,
        username: str = "",
        password: str = "",
        two_factor_key: str = "",
        session_file: str | pathlib.Path = "ig_session.json",
        sessionid: str = "",
        client: Any | None = None,
        connect_timeout: float = 5.0,
        read_timeout: float = 10.0,
        retry_delay: float = 0.75,
        max_attempts: int = 2,
    ) -> None:
        self._username = username.strip()
        self._password = password.strip()
        self._two_factor_key = two_factor_key.strip()
        self._session_file = str(session_file)
        self._sessionid = sessionid.strip()
        self._retry_delay = retry_delay
        self._max_attempts = max(1, max_attempts)
        self._client = client or Client()
        if hasattr(self._client, "set_retry_config"):
            try:
                self._client.set_retry_config(request_timeout=read_timeout)
            except Exception:
                pass
        if hasattr(self._client, "request_timeout"):
            self._client.request_timeout = read_timeout
        self._auth_lock = asyncio.Lock()
        self._is_authenticated = False
        self._last_auth_error: str | None = None

    @property
    def is_authenticated(self) -> bool:
        return self._is_authenticated

    async def authenticate(self, force_relogin: bool = False) -> bool:
        """Authenticate using saved session or credentials with TOTP 2FA."""
        async with self._auth_lock:
            return await asyncio.to_thread(self._authenticate_sync, force_relogin)

    def _authenticate_sync(self, force_relogin: bool = False) -> bool:
        """Synchronous authentication and session handling."""
        # 1. Attempt restoring from permanent session file
        if not force_relogin and os.path.exists(self._session_file):
            try:
                LOGGER.info("Loading saved Instagram session from %s", self._session_file)
                self._client.load_settings(self._session_file)
                user_id = getattr(self._client, "user_id", None)
                if user_id:
                    self._is_authenticated = True
                    self._last_auth_error = None
                    LOGGER.info("Successfully loaded Instagram session for user_id=%s", user_id)
                    return True
            except Exception as exc:
                LOGGER.warning("Could not load saved session (%s), falling back to login", exc)
                self._is_authenticated = False

        # 2. Attempt login by sessionid cookie if provided
        if self._sessionid:
            try:
                LOGGER.info("Attempting Instagram authentication via IG_SESSIONID...")
                logged_in = self._client.login_by_sessionid(self._sessionid)
                if logged_in:
                    LOGGER.info("Instagram sessionid authentication successful. Saving session to %s", self._session_file)
                    try:
                        session_dir = os.path.dirname(os.path.abspath(self._session_file))
                        if session_dir:
                            os.makedirs(session_dir, exist_ok=True)
                        self._client.dump_settings(self._session_file)
                    except Exception as exc:
                        LOGGER.warning("Could not persist session file: %s", exc)
                    self._is_authenticated = True
                    self._last_auth_error = None
                    return True
            except Exception as exc:
                LOGGER.warning("Instagram login_by_sessionid failed: %s", exc)
                self._last_auth_error = f"SessionID authentication failed: {exc}"

        # 3. Check if credentials are provided
        if not self._username or not self._password:
            LOGGER.warning("No Instagram credentials configured (IG_USERNAME, IG_PASSWORD)")
            self._last_auth_error = "No Instagram credentials configured (IG_USERNAME, IG_PASSWORD missing)"
            return False

        # 4. Generate dynamic 2FA TOTP code if secret key is present
        verification_code = ""
        if self._two_factor_key:
            try:
                clean_key = self._two_factor_key.replace(" ", "").upper()
                totp = pyotp.TOTP(clean_key)
                verification_code = totp.now()
                LOGGER.info("Generated 2FA TOTP code for Instagram login")
            except Exception as exc:
                LOGGER.error("Failed to generate TOTP code from IG_2FA_KEY: %s", exc)

        # 4. Perform login
        LOGGER.info("Logging into Instagram as %s (relogin=%s)...", self._username, force_relogin)
        try:
            if hasattr(self._client, "relogin_attempt") and force_relogin:
                self._client.relogin_attempt = 0
            logged_in = self._client.login(
                username=self._username,
                password=self._password,
                relogin=force_relogin,
                verification_code=verification_code,
            )
            if logged_in:
                LOGGER.info("Instagram login successful. Saving session to %s", self._session_file)
                try:
                    session_dir = os.path.dirname(os.path.abspath(self._session_file))
                    if session_dir:
                        os.makedirs(session_dir, exist_ok=True)
                    self._client.dump_settings(self._session_file)
                except Exception as exc:
                    LOGGER.warning("Could not persist session file: %s", exc)
                self._is_authenticated = True
                self._last_auth_error = None
                return True
            LOGGER.error("Instagram login returned False")
            self._last_auth_error = "Instagram login failed (returned False)"
            return False
        except (BadCredentials, BadPassword) as exc:
            LOGGER.error("Instagram login failed: invalid credentials (%s)", exc)
            self._last_auth_error = f"Invalid credentials or Instagram rejected login context: {exc}"
            return False
        except TwoFactorRequired as exc:
            LOGGER.error("Instagram 2FA verification required: %s", exc)
            self._last_auth_error = f"Instagram 2FA verification required: {exc}"
            return False
        except (ChallengeRequired, FeedbackRequired) as exc:
            LOGGER.error("Instagram checkpoint or challenge required: %s", exc)
            self._last_auth_error = f"Instagram checkpoint or security challenge required: {exc}"
            return False
        except Exception as exc:
            LOGGER.error("Instagram login encountered an error: %s", exc)
            self._last_auth_error = f"Instagram login error: {exc}"
            return False

    async def check(self, username: str) -> CheckResult:
        """Search Instagram for exact username and return status."""
        started = time.monotonic()
        target = username.lower().strip()

        for attempt in range(1, self._max_attempts + 1):
            try:
                if not self._is_authenticated:
                    if self._sessionid or (self._username and self._password):
                        authenticated = await self.authenticate(force_relogin=False)
                    else:
                        authenticated = False
                    if not authenticated:
                        return CheckResult(
                            AccountStatus.UNKNOWN,
                            "Instagram verification is temporarily unavailable. Please try again shortly.",
                            duration_seconds=time.monotonic() - started,
                            error_category="unauthenticated",
                        )

                # Search Instagram users
                users = await asyncio.to_thread(self._search_users_sync, target)

                # Determine if target matches any search result exactly
                match_found = False
                for u in (users or []):
                    u_name = ""
                    if isinstance(u, dict):
                        u_name = u.get("username") or ""
                    elif hasattr(u, "username"):
                        u_name = getattr(u, "username", "") or ""
                    if isinstance(u_name, str) and u_name.lower() == target:
                        match_found = True
                        break

                duration = time.monotonic() - started
                if match_found:
                    return CheckResult(
                        AccountStatus.ACTIVE,
                        "The account appears active and verified in Instagram search.",
                        duration_seconds=duration,
                    )
                else:
                    return CheckResult(
                        AccountStatus.NOT_FOUND,
                        "The username was not found in Instagram search. It may be suspended, disabled, or does not exist.",
                        duration_seconds=duration,
                    )

            except (LoginRequired, ClientLoginRequired, ClientUnauthorizedError, ClientForbiddenError):
                LOGGER.warning("Instagram session expired on attempt %d/%d", attempt, self._max_attempts)
                self._is_authenticated = False
                if attempt < self._max_attempts:
                    try:
                        await self.authenticate(force_relogin=True)
                    except Exception as exc:
                        LOGGER.error("Re-login failed: %s", exc)
                        return CheckResult(
                            AccountStatus.UNKNOWN,
                            f"Instagram session expired and re-login failed: {exc}",
                            duration_seconds=time.monotonic() - started,
                            error_category="login_failed",
                        )
                    await asyncio.sleep(self._retry_delay)
                    continue
                return CheckResult(
                    AccountStatus.UNKNOWN,
                    "Instagram session expired and could not be renewed.",
                    duration_seconds=time.monotonic() - started,
                    error_category="session_expired",
                )

            except (PleaseWaitFewMinutes, ClientThrottledError, RateLimitError):
                LOGGER.warning("Instagram rate limited the search request")
                return CheckResult(
                    AccountStatus.UNKNOWN,
                    "Instagram rate-limited the search verification request.",
                    duration_seconds=time.monotonic() - started,
                    error_category="rate_limited",
                )

            except (ChallengeRequired, FeedbackRequired, SentryBlock):
                LOGGER.warning("Instagram challenge or checkpoint encountered")
                return CheckResult(
                    AccountStatus.UNKNOWN,
                    "Instagram required a security challenge or checkpoint.",
                    duration_seconds=time.monotonic() - started,
                    error_category="challenge_required",
                )

            except (ClientRequestTimeout, TimeoutError, requests.exceptions.Timeout):
                LOGGER.warning("Instagram request timed out on attempt %d/%d", attempt, self._max_attempts)
                if attempt < self._max_attempts:
                    await asyncio.sleep(self._retry_delay)
                    continue
                return CheckResult(
                    AccountStatus.UNKNOWN,
                    "Instagram search request timed out.",
                    duration_seconds=time.monotonic() - started,
                    error_category="timeout",
                )

            except (ClientConnectionError, requests.exceptions.ConnectionError):
                LOGGER.warning("Instagram network error on attempt %d/%d", attempt, self._max_attempts)
                if attempt < self._max_attempts:
                    await asyncio.sleep(self._retry_delay)
                    continue
                return CheckResult(
                    AccountStatus.UNKNOWN,
                    "A network error prevented search verification.",
                    duration_seconds=time.monotonic() - started,
                    error_category="network_error",
                )

            except Exception as exc:
                LOGGER.exception("Unexpected error during Instagram search")
                return CheckResult(
                    AccountStatus.UNKNOWN,
                    f"Instagram check error: {type(exc).__name__}",
                    duration_seconds=time.monotonic() - started,
                    error_category="unexpected_error",
                )

        return CheckResult(
            AccountStatus.UNKNOWN,
            "Instagram search couldn't be completed right now.",
            duration_seconds=time.monotonic() - started,
            error_category="unknown",
        )

    def _search_users_sync(self, query: str) -> list[Any]:
        """Perform search_users using the underlying client."""
        return self._client.search_users(query)

    async def close(self) -> None:
        """Close checker without logging out to preserve permanent session."""
        LOGGER.debug("Closing InstagramChecker (session preserved, never logged out)")

