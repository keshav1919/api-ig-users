@echo off
title Caddy Reverse Proxy (HTTPS for legendtech.store)
cd /d "%~dp0"
caddy.exe run --config Caddyfile
pause
