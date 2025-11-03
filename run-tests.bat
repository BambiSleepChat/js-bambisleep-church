@echo off
REM BambiSleep Church - Test Runner (Windows Batch)
REM Bypasses PowerShell execution policy issues

echo.
echo 🧪 Running Jest Tests with Coverage
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.

REM Set Node options for ES modules
set NODE_OPTIONS=--experimental-vm-modules

REM Run Jest with coverage
node node_modules\jest\bin\jest.js --coverage --verbose

echo.
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo ✅ Tests complete!
echo.
