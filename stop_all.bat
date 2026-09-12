@echo off
title Stop Instagram Services
echo Stopping Instagram backend, bot, and cloudflare...
taskkill /F /IM cloudflared.exe /T 2>nul
taskkill /F /IM caddy.exe /T 2>nul
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":8000" ^| findstr "LISTENING"') do taskkill /F /PID %%a 2>nul
powershell -Command "Get-CimInstance Win32_Process | Where-Object { $_.CommandLine -like '*indo-chk*' -or $_.CommandLine -like '*bot.py*' } | ForEach-Object { Stop-Process -Id $_.ProcessId -Force }" 2>nul
echo All Instagram services stopped.
pause

