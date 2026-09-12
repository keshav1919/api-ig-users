import pytest
from app.username import normalize_username

def test_invalid_username():
    assert normalize_username("invalid username!") is None
    assert normalize_username("a" * 31) is None
    assert normalize_username("https://example.com/instagram") is None
    assert normalize_username("https://instagram.com/explore") is None
    assert normalize_username("https://instagram.com/p/C123456") is None
    assert normalize_username("https://instagram.com/reel/C123456") is None


def test_valid_username():
    assert normalize_username("Instagram_Official.1") == "instagram_official.1"


def test_instagram_url_input():
    assert (
        normalize_username(" https://www.instagram.com/Instagram/?hl=en ")
        == "instagram"
    )


def test_at_username_input():
    assert normalize_username(" @Instagram ") == "instagram"
    assert normalize_username(" @@Instagram ") == "instagram"


def test_url_variations_and_domains():
    assert normalize_username("instagram.com/instagram") == "instagram"
    assert normalize_username("www.instagram.com/instagram") == "instagram"
    assert normalize_username("https://m.instagram.com/instagram") == "instagram"
    assert normalize_username("https://instagr.am/instagram") == "instagram"
    assert normalize_username("https://instagram.com/_u/instagram") == "instagram"
    assert normalize_username("https://www.instagram.com/stories/instagram/123456") == "instagram"
