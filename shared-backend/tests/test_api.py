import pytest
from unittest.mock import AsyncMock, MagicMock, patch
from fastapi.testclient import TestClient

from app.main import create_app
from app.config import Settings
from app.models import AccountStatus, CheckResult
from app.services.instagram_profile import ProfileData


def get_test_settings():
    return Settings(
        api_host="127.0.0.1",
        api_port=8000,
        ig_username="",
        ig_password="",
        ig_2fa_key="",
        ig_session_file="",
        ig_sessionid="",
        max_concurrent_checks=5,
        max_batch_size=10,
        cache_ttl_seconds=45,
        unknown_cache_ttl_seconds=3,
        profile_cache_ttl_seconds=300,
        connect_timeout_seconds=5,
        read_timeout_seconds=10,
        retry_delay_seconds=0.75,
        allowed_origins=["https://my-site.netlify.app"],
        api_key="test_key"
    )

@pytest.fixture
def test_app():
    settings = get_test_settings()
    app = create_app(settings)
    return app

@pytest.fixture
def client(test_app):
    with TestClient(test_app) as c:
        yield c


def test_health_check(client):
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["ok"] is True
    assert data["service"] == "instagram-shared-api"


def test_get_instagram_profile_invalid_username(client):
    response = client.get("/api/instagram/invalid username!")
    assert response.status_code == 200
    data = response.json()
    assert data.get("status") == "INVALID_USERNAME"
    assert data.get("exists") is False


def test_get_status_invalid_username(client):
    response = client.get("/api/status/invalid username!")
    assert response.status_code == 200
    data = response.json()
    assert data.get("status") == "INVALID_USERNAME"
    assert data.get("exists") is False


def test_post_status_batch_without_api_key(client):
    response = client.post("/api/status/batch", json={"usernames": ["test"]})
    assert response.status_code == 403


def test_post_status_batch_empty_list(client):
    response = client.post(
        "/api/status/batch", 
        json={"usernames": []}, 
        headers={"X-API-Key": "test_key"}
    )
    assert response.status_code == 200
    assert response.json() == {"results": []}


def test_post_status_batch_exceeds_max(client):
    response = client.post(
        "/api/status/batch", 
        json={"usernames": ["test"] * 11}, 
        headers={"X-API-Key": "test_key"}
    )
    assert response.status_code == 400


def test_get_status_active_mocked(client, test_app):
    mock_checker = MagicMock()
    mock_checker.check = AsyncMock(return_value=CheckResult(
        status=AccountStatus.ACTIVE,
        reason="Found in search"
    ))
    test_app.state.checker = mock_checker

    response = client.get("/api/status/instagram")
    assert response.status_code == 200
    data = response.json()
    assert data["username"] == "instagram"
    assert data["status"] == "ACTIVE"
    assert data["exists"] is True


def test_get_status_not_found_mocked(client, test_app):
    mock_checker = MagicMock()
    mock_checker.check = AsyncMock(return_value=CheckResult(
        status=AccountStatus.NOT_FOUND,
        reason="Not found in search"
    ))
    test_app.state.checker = mock_checker

    response = client.get("/api/status/nonexistentuser999")
    assert response.status_code == 200
    data = response.json()
    assert data["username"] == "nonexistentuser999"
    assert data["status"] == "NOT_FOUND"
    assert data["exists"] is False


def test_post_status_batch_mixed_and_order_preserved(client, test_app):
    async def mock_check(u):
        if u == "active_user":
            return CheckResult(status=AccountStatus.ACTIVE, reason="Active account")
        elif u == "missing_user":
            return CheckResult(status=AccountStatus.NOT_FOUND, reason="Not found")
        return CheckResult(status=AccountStatus.UNKNOWN, reason="Error")

    mock_checker = MagicMock()
    mock_checker.check = AsyncMock(side_effect=mock_check)
    test_app.state.checker = mock_checker

    usernames = ["active_user", "invalid username!", "missing_user"]
    response = client.post(
        "/api/status/batch",
        json={"usernames": usernames},
        headers={"X-API-Key": "test_key"},
    )
    assert response.status_code == 200
    results = response.json()["results"]
    assert len(results) == 3
    # Verify exact input order preserved
    assert results[0]["username"] == "active_user"
    assert results[0]["status"] == "ACTIVE"
    assert results[0]["exists"] is True

    assert results[1]["status"] == "INVALID_USERNAME"
    assert results[1]["exists"] is False

    assert results[2]["username"] == "missing_user"
    assert results[2]["status"] == "NOT_FOUND"
    assert results[2]["exists"] is False


def test_get_instagram_profile_active_with_metadata(client, test_app):
    mock_checker = MagicMock()
    mock_checker.check = AsyncMock(return_value=CheckResult(
        status=AccountStatus.ACTIVE,
        reason="Account found"
    ))
    test_app.state.checker = mock_checker

    mock_profiler = MagicMock()
    mock_profiler.fetch_profile = AsyncMock(return_value=ProfileData(
        exists=True,
        username="instagram",
        full_name="Instagram Official",
        profile_pic="https://scontent.cdninstagram.com/avatar.jpg",
        avatar_url="https://scontent.cdninstagram.com/avatar.jpg",
        raw_profile_pic="https://scontent.cdninstagram.com/avatar.jpg",
        followers="650M",
        following="50",
        posts="7,000",
        is_private=False,
    ))
    test_app.state.profiler = mock_profiler

    response = client.get("/api/instagram/instagram")
    assert response.status_code == 200
    data = response.json()
    assert data["exists"] is True
    assert data["status"] == "ACTIVE"
    assert data["username"] == "instagram"
    assert data["fullName"] == "Instagram Official"
    assert data["followers"] == "650M"
    assert data["following"] == "50"
    assert data["posts"] == "7,000"
    assert data["isPrivate"] is False


def test_avatar_proxy_rejects_ssrf_and_non_instagram_urls(client):
    # Public non-CDN
    r1 = client.get("/api/avatar-proxy?url=https://example.com/image.jpg")
    assert r1.status_code == 403

    # Localhost SSRF
    r2 = client.get("/api/avatar-proxy?url=http://localhost:8080/admin")
    assert r2.status_code == 403

    # Private IP SSRF
    r3 = client.get("/api/avatar-proxy?url=http://192.168.1.1/secret.jpg")
    assert r3.status_code == 403


def test_cors_headers(client):
    response = client.options(
        "/api/status/test",
        headers={
            "Origin": "https://my-site.netlify.app",
            "Access-Control-Request-Method": "GET",
        },
    )
    assert response.status_code == 200
    assert response.headers.get("access-control-allow-origin") == "https://my-site.netlify.app"
