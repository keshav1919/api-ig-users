@echo off
echo ==================================================
echo   Instagram Shared API Backend
echo ==================================================
echo.

REM Activate virtual environment if it exists
if exist ".venv\Scripts\activate.bat" (
    call .venv\Scripts\activate.bat
)

REM Create data directory for session persistence
if not exist "data" mkdir data

REM Start the server
python -m app.main

pause
