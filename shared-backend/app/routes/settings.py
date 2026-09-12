"""Routes for dynamic web app settings (price, UPI ID, payee details, etc.)."""

from __future__ import annotations

import json
import logging
from pathlib import Path
from typing import Any

from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field

LOGGER = logging.getLogger(__name__)

router = APIRouter(tags=["settings"])

SETTINGS_FILE = Path(__file__).resolve().parent.parent.parent / "data" / "web_settings.json"

DEFAULT_SETTINGS: dict[str, Any] = {
    "amount": 30.0,
    "currency": "INR",
    "currencySymbol": "₹",
    "billingPeriod": "year",
    "planName": "Verification Assistance",
    "upiId": "paytm.s1x87m2@pty",
    "payeeName": "Verified Badge",
    "transactionNote": "Verified Badge",
    "adminPassword": "xd",
    "themeMode": "verification",
    "customHtml": "",
}


def _load_settings() -> dict[str, Any]:
    if not SETTINGS_FILE.exists():
        # Fallback to local cwd relative data/web_settings.json if present
        local_path = Path("data/web_settings.json")
        if local_path.exists():
            try:
                with open(local_path, "r", encoding="utf-8") as f:
                    merged = dict(DEFAULT_SETTINGS)
                    merged.update(json.load(f))
                    return merged
            except Exception:
                pass
        return dict(DEFAULT_SETTINGS)
    try:
        with open(SETTINGS_FILE, "r", encoding="utf-8") as f:
            data = json.load(f)
            merged = dict(DEFAULT_SETTINGS)
            merged.update(data)
            return merged
    except Exception as exc:
        LOGGER.error("Failed to load settings from %s: %s", SETTINGS_FILE, exc)
        return dict(DEFAULT_SETTINGS)


def _save_settings(settings: dict[str, Any]) -> None:
    SETTINGS_FILE.parent.mkdir(parents=True, exist_ok=True)
    with open(SETTINGS_FILE, "w", encoding="utf-8") as f:
        json.dump(settings, f, indent=2, ensure_ascii=False)


class PublicSettingsResponse(BaseModel):
    amount: float
    currency: str = "INR"
    currencySymbol: str = "₹"
    billingPeriod: str = "year"
    planName: str = "Verification Assistance"
    upiId: str
    payeeName: str
    transactionNote: str
    themeMode: str = "verification"
    customHtml: str = ""


class AdminSettingsRequest(BaseModel):
    adminPassword: str
    amount: float = Field(..., gt=0)
    upiId: str = Field(..., min_length=3)
    payeeName: str = Field(..., min_length=1)
    transactionNote: str = Field(default="Verified Badge")
    themeMode: str = Field(default="verification")
    customHtml: str = Field(default="")
    newAdminPassword: str | None = None


@router.get("/api/public-settings", response_model=PublicSettingsResponse)
async def get_public_settings() -> dict[str, Any]:
    """Return public settings for the frontend (price, UPI ID, payee details, active theme)."""
    current = _load_settings()
    return {
        "amount": float(current.get("amount", 30.0)),
        "currency": current.get("currency", "INR"),
        "currencySymbol": current.get("currencySymbol", "₹"),
        "billingPeriod": current.get("billingPeriod", "year"),
        "planName": current.get("planName", "Verification Assistance"),
        "upiId": current.get("upiId", "paytm.s1x87m2@pty"),
        "payeeName": current.get("payeeName", "Verified Badge"),
        "transactionNote": current.get("transactionNote", "Verified Badge"),
        "themeMode": current.get("themeMode", "verification"),
        "customHtml": current.get("customHtml", ""),
    }


@router.post("/api/admin/settings")
async def update_admin_settings(payload: AdminSettingsRequest) -> dict[str, Any]:
    """Update settings on server. Requires current admin password."""
    current = _load_settings()
    expected_password = current.get("adminPassword", "admin123")

    if payload.adminPassword != expected_password:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect admin password",
        )

    current["amount"] = float(payload.amount)
    current["upiId"] = payload.upiId.strip()
    current["payeeName"] = payload.payeeName.strip()
    current["transactionNote"] = payload.transactionNote.strip()
    current["themeMode"] = payload.themeMode.strip() if payload.themeMode else "verification"
    current["customHtml"] = payload.customHtml or ""

    if payload.newAdminPassword and payload.newAdminPassword.strip():
        current["adminPassword"] = payload.newAdminPassword.strip()

    _save_settings(current)
    LOGGER.info(
        "Admin settings updated: amount=%s, upiId=%s, themeMode=%s",
        current["amount"],
        current["upiId"],
        current["themeMode"],
    )

    return {
        "ok": True,
        "message": "Settings updated successfully",
        "settings": {
            "amount": current["amount"],
            "upiId": current["upiId"],
            "payeeName": current["payeeName"],
            "transactionNote": current["transactionNote"],
            "themeMode": current["themeMode"],
            "customHtml": current["customHtml"],
        },
    }
