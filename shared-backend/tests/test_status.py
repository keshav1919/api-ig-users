import os
import tempfile
from types import SimpleNamespace
from unittest.mock import MagicMock, patch

import pyotp
import pytest
from instagrapi.exceptions import (
    ChallengeRequired,
    ClientConnectionError,
    ClientRequestTimeout,
    LoginRequired,
    PleaseWaitFewMinutes,
)

from app.services.instagram_status import InstagramChecker
from app.models import AccountStatus, CheckResult


@pytest.mark.asyncio
async def test_exact_matching_username_in_search_is_active():
    mock_client = MagicMock()
    mock_client.search_users.return_value = [
        SimpleNamespace(username="instagram"),
        SimpleNamespace(username="instagram_news"),
    ]
    checker = InstagramChecker(
        username="test_user",
        password="test_pass",
        client=mock_client,
        session_file="nonexistent_session.json",
    )
    checker._is_authenticated = True

    result = await checker.check("instagram")
    assert result.status is AccountStatus.ACTIVE
    mock_client.search_users.assert_called_once_with("instagram")


@pytest.mark.asyncio
async def test_case_insensitive_matching_username_is_active():
    mock_client = MagicMock()
    mock_client.search_users.return_value = [
        SimpleNamespace(username="Instagram_VIP"),
    ]
    checker = InstagramChecker(
        username="test_user",
        password="test_pass",
        client=mock_client,
        session_file="nonexistent_session.json",
    )
    checker._is_authenticated = True

    result = await checker.check("instagram_vip")
    assert result.status is AccountStatus.ACTIVE


@pytest.mark.asyncio
async def test_non_matching_username_in_search_is_not_found():
    mock_client = MagicMock()
    mock_client.search_users.return_value = [
        SimpleNamespace(username="some_other_user"),
        SimpleNamespace(username="another_user"),
    ]
    checker = InstagramChecker(
        username="test_user",
        password="test_pass",
        client=mock_client,
        session_file="nonexistent_session.json",
    )
    checker._is_authenticated = True

    result = await checker.check("missing_account")
    assert result.status is AccountStatus.NOT_FOUND


@pytest.mark.asyncio
async def test_empty_search_results_is_not_found():
    mock_client = MagicMock()
    mock_client.search_users.return_value = []
    checker = InstagramChecker(
        username="test_user",
        password="test_pass",
        client=mock_client,
        session_file="nonexistent_session.json",
    )
    checker._is_authenticated = True

    result = await checker.check("banned_or_deleted")
    assert result.status is AccountStatus.NOT_FOUND


@pytest.mark.asyncio
async def test_login_required_triggers_relogin_and_retries_search():
    mock_client = MagicMock()
    mock_client.search_users.side_effect = [
        LoginRequired("Session expired"),
        [SimpleNamespace(username="instagram")],
    ]
    mock_client.login.return_value = True

    checker = InstagramChecker(
        username="test_user",
        password="test_pass",
        client=mock_client,
        session_file="nonexistent_session.json",
        retry_delay=0.01,
        max_attempts=2,
    )
    checker._is_authenticated = True

    result = await checker.check("instagram")
    assert result.status is AccountStatus.ACTIVE
    assert mock_client.search_users.call_count == 2
    mock_client.login.assert_called_once()


@pytest.mark.asyncio
async def test_rate_limited_returns_unknown():
    mock_client = MagicMock()
    mock_client.search_users.side_effect = PleaseWaitFewMinutes("Throttled")
    checker = InstagramChecker(
        username="test_user",
        password="test_pass",
        client=mock_client,
        session_file="nonexistent_session.json",
    )
    checker._is_authenticated = True

    result = await checker.check("instagram")
    assert result.status is AccountStatus.UNKNOWN
    assert result.error_category == "rate_limited"


@pytest.mark.asyncio
async def test_challenge_required_returns_unknown():
    mock_client = MagicMock()
    mock_client.search_users.side_effect = ChallengeRequired("Checkpoint")
    checker = InstagramChecker(
        username="test_user",
        password="test_pass",
        client=mock_client,
        session_file="nonexistent_session.json",
    )
    checker._is_authenticated = True

    result = await checker.check("instagram")
    assert result.status is AccountStatus.UNKNOWN
    assert result.error_category == "challenge_required"


@pytest.mark.asyncio
async def test_search_timeout_returns_unknown():
    mock_client = MagicMock()
    mock_client.search_users.side_effect = ClientRequestTimeout("Timeout")
    checker = InstagramChecker(
        username="test_user",
        password="test_pass",
        client=mock_client,
        session_file="nonexistent_session.json",
        retry_delay=0.01,
        max_attempts=2,
    )
    checker._is_authenticated = True

    result = await checker.check("instagram")
    assert result.status is AccountStatus.UNKNOWN
    assert result.error_category == "timeout"


@pytest.mark.asyncio
async def test_network_error_returns_unknown():
    mock_client = MagicMock()
    mock_client.search_users.side_effect = ClientConnectionError("Network down")
    checker = InstagramChecker(
        username="test_user",
        password="test_pass",
        client=mock_client,
        session_file="nonexistent_session.json",
        retry_delay=0.01,
        max_attempts=2,
    )
    checker._is_authenticated = True

    result = await checker.check("instagram")
    assert result.status is AccountStatus.UNKNOWN
    assert result.error_category == "network_error"


@pytest.mark.asyncio
async def test_unauthenticated_without_credentials_returns_unknown():
    checker = InstagramChecker(
        username="",
        password="",
        session_file="nonexistent_session.json",
    )
    with patch.object(checker, "_check_fallback", return_value=CheckResult(AccountStatus.UNKNOWN, "Authentication required", error_category="unauthenticated")):
        result = await checker.check("instagram")
        assert result.status is AccountStatus.UNKNOWN
        assert result.error_category == "unauthenticated"


@pytest.mark.asyncio
async def test_session_file_loading_restores_authentication():
    with tempfile.NamedTemporaryFile(delete=False, suffix=".json") as f:
        session_path = f.name

    try:
        mock_client = MagicMock()
        mock_client.user_id = "12345678"
        checker = InstagramChecker(
            username="test_user",
            password="test_pass",
            session_file=session_path,
            client=mock_client,
        )
        authenticated = await checker.authenticate(force_relogin=False)
        assert authenticated is True
        assert checker.is_authenticated is True
        mock_client.load_settings.assert_called_once_with(session_path)
    finally:
        if os.path.exists(session_path):
            os.remove(session_path)


@pytest.mark.asyncio
async def test_login_with_2fa_and_dump_session():
    with tempfile.NamedTemporaryFile(delete=False, suffix=".json") as f:
        session_path = f.name
    if os.path.exists(session_path):
        os.remove(session_path)

    secret_2fa = pyotp.random_base32()
    mock_client = MagicMock()
    mock_client.login.return_value = True

    try:
        checker = InstagramChecker(
            username="test_user",
            password="test_password",
            two_factor_key=secret_2fa,
            session_file=session_path,
            client=mock_client,
        )
        authenticated = await checker.authenticate(force_relogin=False)
        assert authenticated is True
        assert checker.is_authenticated is True
        mock_client.login.assert_called_once()
        _, kwargs = mock_client.login.call_args
        assert kwargs["username"] == "test_user"
        assert kwargs["password"] == "test_password"
        assert len(kwargs["verification_code"]) == 6  # 6-digit TOTP code
        mock_client.dump_settings.assert_called_once_with(session_path)
    finally:
        if os.path.exists(session_path):
            os.remove(session_path)


@pytest.mark.asyncio
async def test_client_unauthorized_triggers_relogin():
    from instagrapi.exceptions import ClientUnauthorizedError
    mock_client = MagicMock()
    mock_client.search_users.side_effect = [
        ClientUnauthorizedError("Unauthorized"),
        [SimpleNamespace(username="instagram")],
    ]
    mock_client.login.return_value = True

    checker = InstagramChecker(
        username="test_user",
        password="test_pass",
        client=mock_client,
        session_file="nonexistent_session.json",
        retry_delay=0.01,
        max_attempts=2,
    )
    checker._is_authenticated = True

    result = await checker.check("instagram")
    assert result.status is AccountStatus.ACTIVE
    assert mock_client.search_users.call_count == 2
    mock_client.login.assert_called_once()


@pytest.mark.asyncio
async def test_rate_limit_error_instagrapi_returns_unknown():
    from instagrapi.exceptions import RateLimitError
    mock_client = MagicMock()
    mock_client.search_users.side_effect = RateLimitError("Rate limited")
    checker = InstagramChecker(
        username="test_user",
        password="test_pass",
        client=mock_client,
        session_file="nonexistent_session.json",
    )
    checker._is_authenticated = True

    result = await checker.check("instagram")
    assert result.status is AccountStatus.UNKNOWN
    assert result.error_category == "rate_limited"


@pytest.mark.asyncio
async def test_requests_timeout_returns_unknown():
    import requests
    mock_client = MagicMock()
    mock_client.search_users.side_effect = requests.exceptions.Timeout("Connection timed out")
    checker = InstagramChecker(
        username="test_user",
        password="test_pass",
        client=mock_client,
        session_file="nonexistent_session.json",
        retry_delay=0.01,
        max_attempts=2,
    )
    checker._is_authenticated = True

    result = await checker.check("instagram")
    assert result.status is AccountStatus.UNKNOWN
    assert result.error_category == "timeout"
