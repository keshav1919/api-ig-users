# Instagram Shared API Backend

Unified HTTP API backend that serves both the **blue-tick** React website and the **indo-chk** Telegram bot.

## Architecture

```
Netlify React Website ──HTTPS──▶ Shared Backend API (this) ◀──HTTP──── Telegram Bot
                                        │
                                        ▼
                                  Instagram API
                          (authenticated session + public scraping)
```

## Quick Start (Windows PowerShell)

```powershell
cd shared-backend

# Create virtual environment
python -m venv .venv
.\.venv\Scripts\Activate.ps1

# Install dependencies
pip install -r requirements.txt

# Create data directory for session persistence
New-Item -ItemType Directory -Force -Path data

# Copy and configure environment
Copy-Item .env.example .env
# Edit .env with your Instagram credentials and settings

# Start the server
python -m app.main
```

Or use the batch script:
```cmd
start_backend.bat
```

## API Endpoints

| Method | Path | Description | Auth |
|--------|------|-------------|------|
| `GET` | `/health` | Health check | None |
| `GET` | `/api/instagram/{username}` | Full profile (for website) | None |
| `GET` | `/api/status/{username}` | Status only (for bot) | Optional |
| `POST` | `/api/status/batch` | Batch status check | API Key |
| `GET` | `/api/avatar-proxy?url=...` | CDN image proxy | None |

## Environment Variables

See `.env.example` for all configuration options.

### Required
- `IG_USERNAME` — Instagram account username
- `IG_PASSWORD` — Instagram account password
- `IG_2FA_KEY` — TOTP 2FA secret (if enabled)

### Optional
- `API_PORT` — Server port (default: 8000)
- `API_KEY` — API key for batch endpoints
- `ALLOWED_ORIGINS` — Comma-separated CORS origins
- `MAX_CONCURRENT_CHECKS` — Max parallel Instagram checks (default: 5)
- See `.env.example` for the complete list

## Session Persistence

The Instagram session is saved to `data/ig_session.json` and automatically restored on restart. This avoids re-authentication on every server restart.

## Running Tests

```powershell
python -m pytest tests/ -v
```
