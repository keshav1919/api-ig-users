@echo off
title Push to GitHub
cd /d "%~dp0blue-tick"
echo ========================================================
echo  Pushing blue-tick repository to GitHub
echo  Repository: https://github.com/keshav1919/badge.git
echo ========================================================
echo.
git --git-dir="%~dp0blue-tick\.git_badge" --work-tree="%~dp0blue-tick" push origin main
echo.
if %ERRORLEVEL% equ 0 (
    echo ========================================================
    echo  [SUCCESS] Successfully pushed to GitHub!
    echo ========================================================
) else (
    echo ========================================================
    echo  [FAILED] Push failed. Check your network or permissions.
    echo ========================================================
)
echo.
pause
