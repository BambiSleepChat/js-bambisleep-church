@echo off
REM BambiSleep Church - Development Server Launcher
REM Direct Node.js execution bypassing npm

echo.
echo 👑 BambiSleep™ Church - MCP Control Tower
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo Environment: Development
echo Port: 3000
echo WebSocket: Enabled
echo Telemetry: OpenTelemetry + Prometheus
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.
echo Starting server with hot reload...
echo Press Ctrl+C to stop
echo.

REM Start with nodemon for hot reload
node node_modules\nodemon\bin\nodemon.js src\server.js --watch src --ext js,ejs

echo.
echo Server stopped.
