# Telegram Instagram Username Status Checker

An asynchronous Telegram bot that checks whether an Instagram username is currently active by performing authenticated in-app searches using a permanently logged-in Instagram account.

If the exact username appears in the search results, the account is classified as **ACTIVE**. If the username does not appear in search results, it is classified as **SUSPENDED / NOT FOUND**.

## 1. Install Python

Install Python 3.11 or newer from [python.org](https://www.python.org/downloads/). On Windows, enable **Add Python to PATH** during installation.

Check the installation in PowerShell:

```powershell
python --version
```

## 2. Open the project folder

```powershell
cd C:\path\to\indo-chk
```

Using a virtual environment is recommended:

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
```

## 3. Install requirements

```powershell
python -m pip install --upgrade pip
pip install -r requirements.txt
```

## 4. Set Environment Variables in `.env`

Edit your `.env` file with your Telegram bot token and Instagram account credentials:

```dotenv
# Telegram Bot Token from @BotFather
BOT_TOKEN=YOUR_BOT_TOKEN_HERE

# Instagram Credentials for In-App Search
IG_USERNAME=your_instagram_username
IG_PASSWORD=your_instagram_password
IG_2FA_KEY=your_2fa_secret_key_here
IG_SESSION_FILE=ig_session.json
```

### Configuration Options

| Variable | Default | Purpose |
| --- | ---: | --- |
| `BOT_TOKEN` | - | Telegram bot token from @BotFather |
| `IG_USERNAME` | - | Instagram username for search session |
| `IG_PASSWORD` | - | Instagram password |
| `IG_2FA_KEY` | - | Base32 2FA secret key (generates TOTP codes automatically) |
| `IG_SESSION_FILE` | `ig_session.json` | Local session cache (stays permanently logged in) |
| `MAX_CONCURRENT_CHECKS` | `5` | Maximum simultaneous Instagram requests |
| `USER_COOLDOWN_SECONDS` | `4` | Delay between checks by one Telegram user |
| `CACHE_TTL_SECONDS` | `45` | Cache duration for `ACTIVE`/`NOT FOUND` |
| `UNKNOWN_CACHE_TTL_SECONDS` | `3` | Very short cache for temporary failures; use `0` to disable |
| `LOG_LEVEL` | `INFO` | Logging verbosity |

### Permanent Session Storage
When the bot first logs in, it dumps the session to `ig_session.json`. Subsequent runs automatically restore this session without logging in again or triggering new 2FA codes. The session is never logged out.

## 5. Run the bot

```powershell
python bot.py
```

The console displays:

```text
========================================
Instagram Username Checker
==========================

Bot starting...
Status: ONLINE
Waiting for Telegram messages...
```

## 6. Open Telegram & Test

1. Open your bot on Telegram and send `/start`.
2. Send an Instagram username (e.g., `@instagram` or `https://instagram.com/instagram`).
3. Expected results:
   - `✅ ACTIVE`: The exact username was found in Instagram search.
   - `❌ SUSPENDED / NOT FOUND`: The username was not found in Instagram search (suspended, disabled, banned, or deleted).
   - `⚠️ UNKNOWN`: Temporary network issue, rate limiting, or login required.
   - `🚫 INVALID USERNAME`: Username syntax is invalid.

## 7. Run tests

```powershell
python -m pytest -q
```

