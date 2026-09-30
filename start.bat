@echo off
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 goto nonode
echo Starting the lesson server. Keep this window open while you use the page.
start "" cmd /c "timeout /t 2 >nul & start http://localhost:8793/lesson17_v2.html"
node server.js
echo.
echo Server stopped. If the port is already in use, another window is already running it - use that one.
pause
exit /b
:nonode
echo Node.js is not installed. Install the LTS version from https://nodejs.org and run this file again.
pause
