"""Telegram entry point for the Instagram username status checker.

Features:
- Telegram Premium Animated Custom Emojis
- Live in-progress mass check updates (e.g. 10/52)
- Zero artificial cooldowns (ultra-fast processing)
- Support for text input and .txt file uploads
- New user join notifications for admins
- Full concurrency (40 parallel checks)
"""

from __future__ import annotations

import asyncio
import html
import json
import logging
import os
import re
import sys
import uuid
from datetime import datetime
from io import BytesIO

import httpx
from telegram import InlineKeyboardButton, InlineKeyboardMarkup, Update
from telegram.error import Forbidden, TelegramError
from telegram.ext import (
    Application,
    CallbackQueryHandler,
    CommandHandler,
    ContextTypes,
    MessageHandler,
    filters,
)

from config import ConfigurationError, Settings
from models import AccountStatus, CheckResult
from username import normalize_username

LOGGER = logging.getLogger(__name__)

# ── Telegram Premium Custom Emojis ──
EMOJI_INSTAGRAM = '<tg-emoji emoji-id="5319160079465857105">📱</tg-emoji>'
EMOJI_CAT_HACKER = '<tg-emoji emoji-id="6300878887664486596">😇</tg-emoji>'
EMOJI_VERIFIED = '<tg-emoji emoji-id="5357521258474905985">✅</tg-emoji>'
EMOJI_FORBIDDEN = '<tg-emoji emoji-id="4956337889593000947">🚫</tg-emoji>'
EMOJI_CROSS_ANIM = '<tg-emoji emoji-id="4958526153955476488">❌</tg-emoji>'
EMOJI_WARN = '<tg-emoji emoji-id="5945169653260095496">⚠️</tg-emoji>'
EMOJI_CHECK_ANIM = '<tg-emoji emoji-id="4958610528588008305">✅</tg-emoji>'
EMOJI_CLOCK_GREEN = '<tg-emoji emoji-id="5260463209562776385">🟢</tg-emoji>'
EMOJI_DOT_GREEN = '<tg-emoji emoji-id="5260463209562776385">🟢</tg-emoji>'
EMOJI_NEW = '<tg-emoji emoji-id="4956287101604725699">🆕</tg-emoji>'

# ── Templates ──
START_MESSAGE = (
    f"{EMOJI_INSTAGRAM} <b>Instagram Username Checker</b>\n\n"
    f"{EMOJI_CAT_HACKER} Send me Instagram usernames or upload a .txt file.\n\n"
    "<b>Supported formats:</b>\n"
    "• Space-separated: <code>user1 user2 user3</code>\n"
    "• Line-separated:\n<code>user1\nuser2\nuser3</code>\n"
    "• Or upload any <code>.txt</code> file"
)

USERS_FILE = "users.json"
ADMIN_CONFIG_FILE = "admin_config.json"
MASS_SESSIONS: dict[str, list[str]] = {}


# ── User & Admin Tracking ──

def load_users() -> dict:
    if os.path.exists(USERS_FILE):
        try:
            with open(USERS_FILE, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            pass
    return {"users": {}}


def save_users(data: dict) -> None:
    try:
        with open(USERS_FILE, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
    except Exception as e:
        LOGGER.error("Error saving users: %s", e)


def load_admins() -> set[int]:
    admins = set()
    env_admin = os.getenv("ADMIN_ID")
    if env_admin:
        for a in env_admin.split(","):
            a = a.strip()
            if a.isdigit() or (a.startswith("-") and a[1:].isdigit()):
                admins.add(int(a))
    if os.path.exists(ADMIN_CONFIG_FILE):
        try:
            with open(ADMIN_CONFIG_FILE, "r", encoding="utf-8") as f:
                cfg = json.load(f)
                for a in cfg.get("admin_ids", []):
                    admins.add(int(a))
        except Exception:
            pass
    return admins


def save_admin(admin_id: int) -> None:
    admins = load_admins()
    admins.add(admin_id)
    try:
        with open(ADMIN_CONFIG_FILE, "w", encoding="utf-8") as f:
            json.dump({"admin_ids": list(admins)}, f, indent=2)
    except Exception as e:
        LOGGER.error("Error saving admin config: %s", e)


async def check_and_notify_new_user(update: Update, application: Application) -> None:
    user = update.effective_user
    if not user or user.is_bot:
        return

    users_data = load_users()
    user_id_str = str(user.id)

    if user_id_str not in users_data.get("users", {}):
        username_str = f"@{user.username}" if user.username else "None"
        users_data.setdefault("users", {})[user_id_str] = {
            "name": user.full_name,
            "username": username_str,
            "joined_at": datetime.now().isoformat(),
        }
        save_users(users_data)
        total_users = len(users_data["users"])

        # Auto-set first user as admin if none configured
        admins = load_admins()
        if not admins:
            save_admin(user.id)
            admins = {user.id}

        escaped_name = html.escape(user.full_name)
        notify_text = (
            f"{EMOJI_NEW} <b>New verified user</b>\n\n"
            f"<b>Name:</b> {escaped_name}\n"
            f"<b>Username:</b> {username_str}\n"
            f"<b>Total users:</b> {total_users}"
        )

        for admin_id in admins:
            if admin_id != user.id:
                try:
                    await application.bot.send_message(
                        chat_id=admin_id,
                        text=notify_text,
                        parse_mode="HTML",
                    )
                except Exception as err:
                    LOGGER.warning("Failed to send new user alert to %s: %s", admin_id, err)


# ── HTTP Backend Client ──

class SharedApiClient:
    """Reusable high-concurrency client connecting to the shared backend."""

    def __init__(self, base_url: str, api_key: str = "", read_timeout: float = 25.0) -> None:
        self._base_url = base_url.rstrip("/")
        headers = {}
        if api_key:
            headers["X-API-Key"] = api_key
        self._client = httpx.AsyncClient(
            headers=headers,
            timeout=httpx.Timeout(connect=5.0, read=read_timeout, write=10.0, pool=10.0),
            limits=httpx.Limits(max_connections=100, max_keepalive_connections=50),
            trust_env=False,
        )

    async def check_health(self) -> dict | None:
        try:
            resp = await self._client.get(f"{self._base_url}/health")
            if resp.status_code == 200:
                return resp.json()
        except Exception as exc:
            LOGGER.warning("Failed to reach shared backend /health at %s: %s", self._base_url, exc)
        return None

    async def check_status(self, username: str) -> CheckResult:
        try:
            resp = await self._client.get(f"{self._base_url}/api/status/{username}")
            if resp.status_code == 200:
                data = resp.json()
                raw_status = data.get("status", "UNKNOWN")
                try:
                    status = AccountStatus(raw_status)
                except ValueError:
                    status = AccountStatus.UNKNOWN
                return CheckResult(
                    status=status,
                    reason=data.get("reason", ""),
                    http_status=200,
                )
            return CheckResult(
                status=AccountStatus.UNKNOWN,
                reason=f"Shared backend returned HTTP {resp.status_code}",
                http_status=resp.status_code,
            )
        except httpx.TimeoutException:
            return CheckResult(
                status=AccountStatus.UNKNOWN,
                reason="Request to shared backend timed out.",
            )
        except Exception as exc:
            return CheckResult(
                status=AccountStatus.UNKNOWN,
                reason=f"Connection error: {type(exc).__name__}",
            )

    async def check_batch(self, usernames: list[str]) -> list[tuple[str, CheckResult]]:
        try:
            resp = await self._client.post(
                f"{self._base_url}/api/status/batch",
                json={"usernames": usernames},
            )
            if resp.status_code == 200:
                data = resp.json()
                items = data.get("results", [])
                results: list[tuple[str, CheckResult]] = []
                for item in items:
                    u = item.get("username", "")
                    raw_status = item.get("status", "UNKNOWN")
                    try:
                        s = AccountStatus(raw_status)
                    except ValueError:
                        s = AccountStatus.UNKNOWN
                    results.append((u, CheckResult(status=s, reason=item.get("reason", ""))))
                return results
            return [
                (u, CheckResult(status=AccountStatus.UNKNOWN, reason=f"API error: HTTP {resp.status_code}"))
                for u in usernames
            ]
        except Exception as exc:
            return [
                (u, CheckResult(status=AccountStatus.UNKNOWN, reason=f"Connection error: {type(exc).__name__}"))
                for u in usernames
            ]

    async def close(self) -> None:
        await self._client.aclose()


# ── Format Helpers ──

def format_single_result(username: str, result: CheckResult) -> str:
    profile_url = f"https://instagram.com/{username}/"
    if result.status is AccountStatus.ACTIVE:
        return (
            f"{EMOJI_VERIFIED} <b>PROFILE EXISTS</b>\n\n"
            f"{EMOJI_INSTAGRAM} <b>@{username}</b>\n"
            f"🔗 <a href=\"{profile_url}\">{profile_url}</a>\n\n"
            "Checked By @IndoChk_bot"
        )
    if result.status is AccountStatus.NOT_FOUND:
        return (
            f"<b>PROFILE NOT FOUND</b> {EMOJI_FORBIDDEN}\n\n"
            f"{EMOJI_CROSS_ANIM} <b>@{username}</b>\n\n"
            "The username currently doesn't resolve to an Instagram profile.\n\n"
            "Checked By @IndoChk_bot"
        )
    if result.status is AccountStatus.INVALID_USERNAME:
        return (
            f"{EMOJI_FORBIDDEN} <b>Invalid username format.</b>\n\n"
            f"{EMOJI_CROSS_ANIM} Instagram usernames can contain:\n"
            "• letters (a-z)\n"
            "• numbers (0-9)\n"
            "• periods (<code>.</code>)\n"
            "• underscores (<code>_</code>)\n\n"
            "Maximum length: 30 characters."
        )
    reason = result.reason or "Service is temporarily busy."
    if any(k in reason.lower() for k in ["login", "credential", "auth", "password", "session", "legend", "instagrapi"]):
        reason = "Instagram verification service is temporarily busy. Please try again shortly."
    return (
        f"{EMOJI_WARN} <b>STATUS: UNKNOWN</b>\n\n"
        f"{EMOJI_INSTAGRAM} <b>@{username}</b>\n\n"
        f"Instagram couldn't be reliably checked right now.\n"
        f"Reason: {html.escape(reason)}\n\n"
        "Please try again later."
    )


def format_mass_check_output(
    total: int,
    exists_items: list[str],
    not_found_items: list[str],
    total_input: int,
    in_progress: bool = False,
    is_overflow: bool = False,
    is_owner: bool = False,
) -> str:
    checked_count = len(exists_items) + len(not_found_items)
    if in_progress:
        header = f"{EMOJI_CAT_HACKER}{EMOJI_CAT_HACKER} Cheaking usernames  ({checked_count}/{total}) {EMOJI_DOT_GREEN}"
        lines = [
            header,
            "",
            f"{EMOJI_CLOCK_GREEN} (Exists / Valid): {len(exists_items)}",
            f"{EMOJI_CROSS_ANIM} (Not Found / Available): {len(not_found_items)}",
        ]
        if exists_items:
            lines.append("")
            lines.append(f"Found: {EMOJI_CLOCK_GREEN}")
            for u in exists_items[-30:]:
                lines.append(f"<code>{u}</code>")

        if not_found_items:
            lines.append("")
            lines.append(f"Invalid / Not Found {EMOJI_CROSS_ANIM}")
            for u in not_found_items[-20:]:
                lines.append(f"<code>{u}</code>")

        return "\n".join(lines)

    now_str = datetime.now().strftime("%Y-%m-%d  %H:%M:%S")
    owner_badge = " 👑 [Owner Unlimited]" if is_owner else ""

    if is_overflow:
        # Matches media_1789046191491.png 1:1
        lines = [
            f"{EMOJI_INSTAGRAM} Mass Check Results ({total}){owner_badge}",
            "",
            f"{EMOJI_CROSS_ANIM} (Not Found / Available): {len(not_found_items)}",
            f"{EMOJI_CLOCK_GREEN} (Exists / Valid): {len(exists_items)}",
            f"🕒 Live Checked: {now_str}",
            "",
        ]
        if exists_items:
            lines.append(f"Found ({len(exists_items)} accounts): {EMOJI_DOT_GREEN}")
            for u in exists_items[:30]:
                lines.append(f"<code>{u}</code>")
            if len(exists_items) > 30:
                lines.append(f"<i>... and {len(exists_items) - 30} more in attached file</i>")
            lines.append("")

        lines.append("📁 Full results attached below as .txt files!")
        lines.append("")
        lines.append("Checked By @IndoChk_bot")
        return "\n".join(lines)

    lines = [
        f"{EMOJI_INSTAGRAM} Mass Check Results ({total}){owner_badge}",
        "",
        f"{EMOJI_CLOCK_GREEN} (Exists / Valid): {len(exists_items)}",
        f"{EMOJI_CROSS_ANIM} (Not Found / Available): {len(not_found_items)}",
        "",
    ]

    if exists_items:
        lines.append(f"Found: {EMOJI_CLOCK_GREEN}")
        for u in exists_items:
            lines.append(f"<code>{u}</code>")
        lines.append("")

    if not_found_items:
        lines.append(f"Invalid / Not Found {EMOJI_CROSS_ANIM}")
        for u in not_found_items:
            lines.append(f"<code>{u}</code>")
        lines.append("")

    if total_input > total:
        lines.append(f"<i>Note: First {total} of {total_input} usernames checked.</i>\n")

    lines.append(f"{EMOJI_CLOCK_GREEN} Live Checked: {now_str}")
    lines.append("Checked By @IndoChk_bot")

    return "\n".join(lines)


def extract_usernames(raw_text: str) -> list[str]:
    """Extract valid Instagram usernames from any input format:
    spaces, newlines, commas, tabs, bullets, URLs, or mixed separators.
    Preserves order of appearance while deduplicating.
    """
    if not raw_text or not raw_text.strip():
        return []

    # Normalize unicode whitespace to regular space
    cleaned = re.sub(r"[\u00a0\u1680\u2000-\u200b\u202f\u205f\u3000\ufeff]", " ", raw_text)

    # Split by spaces, newlines, tabs, commas, semicolons, pipes, brackets, quotes
    raw_tokens = re.split(r"[\r\n\s,;|\[\]\(\)\{\}\<\>\"'`]+", cleaned)

    usernames: list[str] = []
    seen: set[str] = set()

    for token in raw_tokens:
        token = token.strip()
        if not token:
            continue

        # Skip isolated list bullets like '1.' or '2)' or '10.'
        if re.fullmatch(r"\d+[\.\)]", token):
            continue

        # Strip list numbering prefix if attached, e.g. '1.username' -> 'username'
        token = re.sub(r"^\d+[\.\)]\s*", "", token)

        # Check if URL or standard username
        norm = normalize_username(token)
        if not norm:
            token = token.strip(".:,;@#*-•")
            if token:
                norm = normalize_username(token)

        if norm and not norm.startswith(".") and not norm.endswith(".") and ".." not in norm:
            if norm not in seen:
                seen.add(norm)
                usernames.append(norm)

    return usernames


# ── Telegram Bot Class ──

class InstagramBot:
    def __init__(self, settings: Settings) -> None:
        self._settings = settings
        self._api = SharedApiClient(
            base_url=settings.shared_api_base_url,
            api_key=settings.shared_api_key,
            read_timeout=settings.read_timeout_seconds,
        )
        self._worker_semaphore = asyncio.Semaphore(40)

    async def post_init(self, application: Application) -> None:
        LOGGER.info("Verifying connection to shared backend at %s...", self._settings.shared_api_base_url)
        health = await self._api.check_health()
        if health and health.get("ok"):
            LOGGER.info(
                "Connected to shared backend! Service: %s, Authenticated: %s",
                health.get("service"),
                health.get("authenticated"),
            )
        else:
            LOGGER.warning(
                "Could not verify shared backend at %s. Bot will still attempt checks on incoming messages.",
                self._settings.shared_api_base_url,
            )

    async def start(self, update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
        message = update.effective_message
        if not message:
            return
        await check_and_notify_new_user(update, context.application)
        if context.args and len(context.args) > 0:
            target = " ".join(context.args).strip()
            await self._process_text_input(update, context, target)
            return
        try:
            await message.reply_text(START_MESSAGE, parse_mode="HTML")
        except TelegramError as exc:
            LOGGER.warning("Could not send start message: %s", exc)

    async def help_command(self, update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
        if update.effective_message:
            try:
                await update.effective_message.reply_text(START_MESSAGE, parse_mode="HTML")
            except TelegramError as exc:
                LOGGER.warning("Could not send help message: %s", exc)

    async def check_command(self, update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
        message = update.effective_message
        if not message:
            return
        await check_and_notify_new_user(update, context.application)
        if context.args and len(context.args) > 0:
            target = " ".join(context.args).strip()
            await self._process_text_input(update, context, target)
        else:
            try:
                await message.reply_text(
                    "Usage: /check &lt;username&gt;\nExample: /check @instagram",
                    parse_mode="HTML",
                )
            except TelegramError:
                pass

    async def stats_command(self, update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
        message = update.effective_message
        user = update.effective_user
        if not message or not user:
            return
        admins = load_admins()
        if user.id in admins or not admins:
            users_data = load_users()
            count = len(users_data.get("users", {}))
            await message.reply_text(f"📊 <b>Total users:</b> {count}", parse_mode="HTML")

    async def setadmin_command(self, update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
        message = update.effective_message
        user = update.effective_user
        if not message or not user:
            return
        save_admin(user.id)
        await message.reply_text(
            f"✅ Registered as admin (ID: <code>{user.id}</code>)!\n"
            "You will receive new user notifications here.",
            parse_mode="HTML",
        )

    async def id_command(self, update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
        if update.effective_message and update.effective_user:
            await update.effective_message.reply_text(
                f"🆔 Your ID: <code>{update.effective_user.id}</code>",
                parse_mode="HTML",
            )

    async def handle_document(self, update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
        """Handle uploaded .txt files with usernames."""
        message = update.effective_message
        if not message or not message.document:
            return
        await check_and_notify_new_user(update, context.application)

        doc = message.document
        if not doc.file_name or not doc.file_name.lower().endswith(".txt"):
            await message.reply_text("Please upload a <code>.txt</code> file containing usernames.", parse_mode="HTML")
            return

        try:
            status_msg = await message.reply_text("📥 <i>Downloading file...</i>", parse_mode="HTML")
            file = await context.bot.get_file(doc.file_id)
            buffer = BytesIO()
            await file.download_to_memory(buffer)
            text_content = buffer.getvalue().decode("utf-8", errors="ignore")
            usernames = extract_usernames(text_content)
            if not usernames:
                await status_msg.edit_text("❌ No valid usernames found in the uploaded file.", parse_mode="HTML")
                return

            admins = load_admins()
            chat_id = message.chat_id if message else None
            is_owner = bool(chat_id and chat_id in admins)
            batch_limit = 2000 if is_owner else self._settings.max_batch_size
            to_check = usernames[:batch_limit]
            total_to_check = len(to_check)

            try:
                await status_msg.edit_text(
                    f"{EMOJI_CAT_HACKER}{EMOJI_CAT_HACKER} Cheaking usernames  (0/{total_to_check}) {EMOJI_DOT_GREEN}",
                    parse_mode="HTML",
                )
            except TelegramError:
                pass

            await self._execute_mass_check(status_msg, to_check)
        except Exception as exc:
            LOGGER.error("Error processing document: %s", exc)
            await message.reply_text(f"❌ Error reading file: {exc}")

    async def handle_message(self, update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
        message = update.effective_message
        if not message:
            return
        await check_and_notify_new_user(update, context.application)
        raw_text = message.text or message.caption or ""

        # Auto-detect custom emojis if sent
        entities = message.entities or message.caption_entities or ()
        custom_entities = [e for e in entities if e.type == "custom_emoji"]
        if custom_entities and (not normalize_username(raw_text) or len(custom_entities) > 1 or raw_text.startswith("/emoji")):
            lines = ["✨ <b>Captured Custom Emojis:</b>\n"]
            captured = []
            for idx, ent in enumerate(custom_entities, 1):
                char = raw_text[ent.offset:ent.offset + ent.length] if raw_text else "★"
                lines.append(f"{idx}. <tg-emoji emoji-id=\"{ent.custom_emoji_id}\">{char}</tg-emoji>  ➔ ID: <code>{ent.custom_emoji_id}</code>")
                captured.append({"id": str(ent.custom_emoji_id), "char": char})

            try:
                with open("captured_emojis.json", "w", encoding="utf-8") as f:
                    json.dump(captured, f, ensure_ascii=False, indent=2)
            except Exception:
                pass

            lines.append("\n<i>All IDs detected and saved to captured_emojis.json!</i>")
            try:
                await message.reply_text("\n".join(lines), parse_mode="HTML")
            except TelegramError:
                pass
            return

        await self._process_text_input(update, context, raw_text)

    async def _process_text_input(self, update: Update, context: ContextTypes.DEFAULT_TYPE, raw_input: str) -> None:
        message = update.effective_message
        if not message:
            return

        usernames = extract_usernames(raw_input)
        if not usernames:
            raw_tokens = raw_input.strip().split()
            if len(raw_tokens) == 1:
                await self._process_single_check(message, raw_tokens[0])
            return

        if len(usernames) == 1:
            await self._process_single_check(message, usernames[0])
        else:
            admins = load_admins()
            chat_id = message.chat_id if message else None
            is_owner = bool(chat_id and chat_id in admins)
            batch_limit = 2000 if is_owner else self._settings.max_batch_size
            to_check = usernames[:batch_limit]
            total_to_check = len(to_check)

            status_msg = await message.reply_text(
                f"{EMOJI_CAT_HACKER}{EMOJI_CAT_HACKER} Cheaking usernames  (0/{total_to_check}) {EMOJI_DOT_GREEN}",
                parse_mode="HTML",
            )
            await self._execute_mass_check(status_msg, to_check)

    async def _process_single_check(self, message: Update.effective_message, raw_username: str) -> None:
        username = normalize_username(raw_username)
        if username is None:
            await message.reply_text(format_single_result(raw_username, CheckResult(AccountStatus.INVALID_USERNAME, "Invalid")), parse_mode="HTML")
            return

        try:
            checking_msg = await message.reply_text(
                f"{EMOJI_CAT_HACKER}{EMOJI_CAT_HACKER} Cheaking usernames  (0/1) {EMOJI_DOT_GREEN}",
                parse_mode="HTML",
            )
        except TelegramError:
            return

        result = await self._api.check_status(username)
        formatted_text = format_single_result(username, result)
        profile_url = f"https://instagram.com/{username}/"

        keyboard_buttons = []
        if result.status is AccountStatus.ACTIVE:
            keyboard_buttons.append([InlineKeyboardButton(text="Open Instagram Profile", url=profile_url)])
        keyboard_buttons.append([InlineKeyboardButton(text="🔄 Re-check", callback_data=f"recheck_s:{username}")])

        try:
            await checking_msg.edit_text(
                formatted_text,
                parse_mode="HTML",
                reply_markup=InlineKeyboardMarkup(keyboard_buttons),
                disable_web_page_preview=True,
            )
        except TelegramError:
            await message.reply_text(
                formatted_text,
                parse_mode="HTML",
                reply_markup=InlineKeyboardMarkup(keyboard_buttons),
                disable_web_page_preview=True,
            )

    async def _execute_mass_check(self, target_message: Update.effective_message, usernames: list[str]) -> None:
        admins = load_admins()
        chat_id = target_message.chat_id if target_message else None
        is_owner = bool(chat_id and chat_id in admins)

        max_batch = 2000 if is_owner else self._settings.max_batch_size
        batch = usernames[:max_batch]
        total = len(batch)
        LOGGER.info("Starting mass check for %s usernames (is_owner=%s)", total, is_owner)

        exists_items: list[str] = []
        not_found_items: list[str] = []
        stop_updater = asyncio.Event()

        # Fast background ticker to update progress message live (e.g. 10/52)
        async def fast_updater():
            last_rendered = ""
            while not stop_updater.is_set():
                await asyncio.sleep(0.5)
                current_text = format_mass_check_output(total, exists_items, not_found_items, len(usernames), in_progress=True)
                if current_text != last_rendered:
                    try:
                        await target_message.edit_text(current_text, parse_mode="HTML")
                        last_rendered = current_text
                    except Exception:
                        pass

        updater_task = asyncio.create_task(fast_updater())

        async def check_item(raw_u: str) -> None:
            norm = normalize_username(raw_u)
            if norm is None:
                not_found_items.append(raw_u)
                return

            async with self._worker_semaphore:
                res = await self._api.check_status(norm)
                if res.status is AccountStatus.ACTIVE:
                    exists_items.append(norm)
                else:
                    not_found_items.append(norm)

        # Concurrently execute all checks with 40 workers
        await asyncio.gather(*(check_item(u) for u in batch))

        stop_updater.set()
        try:
            await updater_task
        except Exception:
            pass

        session_id = uuid.uuid4().hex[:8]
        MASS_SESSIONS[session_id] = batch

        admins = load_admins()
        chat_id = target_message.chat_id if target_message else None
        is_owner = bool(chat_id and chat_id in admins)

        # Overflow condition: large batch where full usernames cannot or should not all flood the chat
        is_overflow = total > 30 or len(not_found_items) > 15 or len(exists_items) > 30

        final_text = format_mass_check_output(
            total, exists_items, not_found_items, len(usernames),
            in_progress=False, is_overflow=is_overflow, is_owner=is_owner,
        )
        keyboard = InlineKeyboardMarkup([
            [InlineKeyboardButton(text="🔄 Re-check All Live", callback_data=f"recheck_m:{session_id}")]
        ])

        try:
            await target_message.edit_text(final_text, parse_mode="HTML", reply_markup=keyboard)
        except TelegramError as err:
            LOGGER.error("Failed to edit final_text: %s", err)

        if is_overflow:
            now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

            # 1. found_{len(exists_items)}_accounts.txt
            found_data = "\n".join(exists_items) if exists_items else "No valid accounts found."
            found_bytes = BytesIO(found_data.encode("utf-8"))
            found_name = f"found_{len(exists_items)}_accounts.txt"
            found_caption = f"🟢 {len(exists_items)} Found Instagram Accounts"
            try:
                await target_message.reply_document(
                    document=found_bytes,
                    filename=found_name,
                    caption=found_caption,
                )
            except TelegramError as exc:
                LOGGER.error("Failed to send found txt file: %s", exc)

            # 2. full_results_{total}_accounts.txt
            report = [
                "=" * 50,
                f"Instagram Username Checker - Full Report ({total} accounts)",
                "=" * 50,
                f"Total Checked: {total}",
                f"Found (Exists / Valid): {len(exists_items)}",
                f"Not Found / Available: {len(not_found_items)}",
                f"Checked At: {now_str}",
                "=" * 50,
                "",
                f"--- FOUND ACCOUNTS ({len(exists_items)}) ---",
            ]
            report.extend(exists_items)
            report.append("")
            report.append(f"--- NOT FOUND / AVAILABLE ({len(not_found_items)}) ---")
            report.extend(not_found_items)
            report.append("")
            report.append("Checked By @IndoChk_bot")

            full_data = "\n".join(report)
            full_bytes = BytesIO(full_data.encode("utf-8"))
            full_name = f"full_results_{total}_accounts.txt"
            full_caption = f"📁 Full check report for {total} usernames"
            try:
                await target_message.reply_document(
                    document=full_bytes,
                    filename=full_name,
                    caption=full_caption,
                )
            except TelegramError as exc:
                LOGGER.error("Failed to send full report txt file: %s", exc)

    async def handle_callback(self, update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
        query = update.callback_query
        if not query or not query.data:
            return

        try:
            await query.answer("Re-checking...")
        except TelegramError:
            pass

        data = query.data
        if data.startswith("recheck_s:"):
            username = data.split(":", 1)[1]
            try:
                await query.edit_message_text(
                    f"{EMOJI_CAT_HACKER}{EMOJI_CAT_HACKER} Cheaking usernames  (0/1) {EMOJI_DOT_GREEN}",
                    parse_mode="HTML",
                )
            except TelegramError:
                pass

            result = await self._api.check_status(username)
            formatted_text = format_single_result(username, result)
            profile_url = f"https://instagram.com/{username}/"

            keyboard_buttons = []
            if result.status is AccountStatus.ACTIVE:
                keyboard_buttons.append([InlineKeyboardButton(text="Open Instagram Profile", url=profile_url)])
            keyboard_buttons.append([InlineKeyboardButton(text="🔄 Re-check", callback_data=f"recheck_s:{username}")])

            try:
                await query.edit_message_text(
                    formatted_text,
                    parse_mode="HTML",
                    reply_markup=InlineKeyboardMarkup(keyboard_buttons),
                    disable_web_page_preview=True,
                )
            except TelegramError:
                pass

        elif data.startswith("recheck_m:"):
            session_id = data.split(":", 1)[1]
            usernames = MASS_SESSIONS.get(session_id, [])
            if not usernames:
                await query.answer("Session expired. Please send usernames again.", show_alert=True)
                return
            admins = load_admins()
            chat_id = query.message.chat_id if query.message else None
            is_owner = bool(chat_id and chat_id in admins)
            limit = 2000 if is_owner else self._settings.max_batch_size
            total_to_check = min(len(usernames), limit)
            try:
                await query.edit_message_text(
                    f"{EMOJI_CAT_HACKER}{EMOJI_CAT_HACKER} Cheaking usernames  (0/{total_to_check}) {EMOJI_DOT_GREEN}",
                    parse_mode="HTML",
                )
            except TelegramError:
                pass
            await self._execute_mass_check(query.message, usernames)

    async def on_error(self, update: object, context: ContextTypes.DEFAULT_TYPE) -> None:
        if isinstance(context.error, Forbidden):
            LOGGER.warning("Telegram Forbidden: user blocked bot or chat inaccessible.")
            return
        LOGGER.error("Telegram error: %s", context.error)

    async def shutdown(self, application: Application) -> None:
        await self._api.close()


def configure_logging(level: str) -> None:
    try:
        sys.stdout.reconfigure(line_buffering=True)
    except Exception:
        pass
    logging.basicConfig(
        level=getattr(logging, level),
        format="%(asctime)s %(levelname)s %(name)s %(message)s",
        handlers=[logging.StreamHandler(sys.stdout)],
        force=True,
    )
    logging.getLogger("httpx").setLevel(logging.WARNING)


def build_application(settings: Settings) -> Application:
    bot = InstagramBot(settings)
    application = (
        Application.builder()
        .token(settings.bot_token)
        .concurrent_updates(50)
        .post_init(bot.post_init)
        .post_shutdown(bot.shutdown)
        .build()
    )
    application.add_handler(CommandHandler("start", bot.start))
    application.add_handler(CommandHandler("help", bot.help_command))
    application.add_handler(CommandHandler("check", bot.check_command))
    application.add_handler(CommandHandler("stats", bot.stats_command))
    application.add_handler(CommandHandler("users", bot.stats_command))
    application.add_handler(CommandHandler("setadmin", bot.setadmin_command))
    application.add_handler(CommandHandler("id", bot.id_command))
    application.add_handler(CallbackQueryHandler(bot.handle_callback))
    application.add_handler(MessageHandler(filters.Document.ALL, bot.handle_document))
    application.add_handler(
        MessageHandler(
            (filters.TEXT | filters.CAPTION) & ~filters.COMMAND,
            bot.handle_message,
        )
    )
    application.add_error_handler(bot.on_error)
    return application


def main() -> int:
    try:
        settings = Settings.from_environment()
    except ConfigurationError as exc:
        print(f"ERROR: {exc}", file=sys.stderr)
        return 1

    configure_logging(settings.log_level)
    print("========================================")
    print("Instagram Username Checker (Shared API)")
    print("========================================")
    print()
    print(f"Shared API Backend: {settings.shared_api_base_url}")
    print("Status: ONLINE (Ultra-Fast 40x Parallel)")
    print("Waiting for Telegram messages...")

    try:
        build_application(settings).run_polling(
            allowed_updates=Update.ALL_TYPES,
            drop_pending_updates=True,
        )
    except (KeyboardInterrupt, SystemExit):
        LOGGER.info("Bot stopped")
    except Exception:
        LOGGER.exception("Telegram bot stopped after error")
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
