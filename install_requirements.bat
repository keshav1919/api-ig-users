@echo off
title Installing Instagram Suite Dependencies
echo ==========================================================
echo [1/2] Upgrading pip...
echo ==========================================================
python -m pip install --upgrade pip

echo.
echo ==========================================================
echo [2/2] Installing required Python packages...
echo ==========================================================
pip install -r requirements.txt

echo.
echo ==========================================================
echo [SUCCESS] All dependencies have been installed!
echo You can now double-click 'start_all.bat' to run the suite.
echo ==========================================================
pause
