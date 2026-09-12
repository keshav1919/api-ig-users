@echo off
title Cloudflare Tunnel (Shared API)
cd /d "%~dp0"
echo Starting Cloudflare Tunnel to http://localhost:8000...
echo.
python run_tunnel.py
pause

