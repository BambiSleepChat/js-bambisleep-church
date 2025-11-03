@echo off
REM BambiSleep Church - Development Server Launcher (Windows Batch)
REM Bypasses PowerShell execution policy issues

echo.
echo 👑 BambiSleep Church - Development Server
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.

REM Run nodemon for hot reload
node node_modules\nodemon\bin\nodemon.js src\server.js --watch src --ext js,ejs

echo.
echo Server stopped.
echo.
