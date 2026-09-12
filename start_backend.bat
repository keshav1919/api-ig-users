@echo off
title Instagram Shared API Backend (Port 8000)
cd /d "%~dp0shared-backend"
python -m app.main
pause
