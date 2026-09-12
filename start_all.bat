@echo off
title Instagram Suite Manager
echo ==========================================================
echo Starting Instagram Shared Backend and Telegram Bot
echo ==========================================================
echo.

cd /d "%~dp0"

echo Cleaning up any old instances to avoid port conflicts...
taskkill /F /IM cloudflared.exe /T 2>nul
taskkill /F /IM caddy.exe /T 2>nul
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":8000" ^| findstr "LISTENING"') do taskkill /F /PID %%a 2>nul
powershell -Command "Get-CimInstance Win32_Process | Where-Object { $_.CommandLine -like '*indo-chk*' -or $_.CommandLine -like '*bot.py*' } | ForEach-Object { Stop-Process -Id $_.ProcessId -Force }" 2>nul
timeout /t 1 /nobreak >nul

echo [1/3] Launching Shared Backend API on port 8000...
start "Instagram Shared API Backend (Port 8000)" cmd /k "cd /d ""%~dp0shared-backend"" && python -m app.main"

echo Waiting 3 seconds for backend initialization...
timeout /t 3 /nobreak >nul

echo [2/3] Launching Caddy HTTPS Server (legendtech.store)...
start "Caddy HTTPS Server (legendtech.store)" cmd /k "cd /d ""%~dp0"" && caddy.exe run --config Caddyfile"

echo [3/3] Launching IndoChk Telegram Bot (40x parallel)...
start "Instagram Telegram Bot (@IndoChk_bot)" cmd /k "cd /d ""%~dp0indo-chk"" && python bot.py"

echo.
echo ==========================================================
echo [SUCCESS] All 3 services are running in separate windows!
echo.
echo - Custom Domain:     https://legendtech.store
echo - Subdomain:         https://api.legendtech.store
echo - Backend API:       http://localhost:8000
echo - Health Check:      https://legendtech.store/health
echo - Public Info:       https://legendtech.store/api/public-settings
echo - Telegram Bot:      Listening for messages...
echo ==========================================================
echo Keep the opened service windows running.
echo.
pause
