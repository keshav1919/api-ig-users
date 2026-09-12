from app.models import AccountStatus, CheckResult

def test_account_status_enum():
    assert AccountStatus.ACTIVE == "ACTIVE"
    assert AccountStatus.NOT_FOUND == "NOT_FOUND"
    assert AccountStatus.UNKNOWN == "UNKNOWN"
    assert AccountStatus.INVALID_USERNAME == "INVALID_USERNAME"

def test_check_result_defaults():
    result = CheckResult(status=AccountStatus.ACTIVE, reason="reachable")
    assert result.status == AccountStatus.ACTIVE
    assert result.reason == "reachable"
    assert result.http_status is None
    assert result.duration_seconds == 0.0
    assert result.error_category is None

def test_check_result_fields():
    result = CheckResult(
        status=AccountStatus.NOT_FOUND,
        reason="missing",
        http_status=404,
        duration_seconds=1.5,
        error_category="not_found"
    )
    assert result.status == AccountStatus.NOT_FOUND
    assert result.reason == "missing"
    assert result.http_status == 404
    assert result.duration_seconds == 1.5
    assert result.error_category == "not_found"
