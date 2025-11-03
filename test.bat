@echo off
REM BambiSleep Church - Jest Test Runner (Fixed)

echo.
echo 🧪 Running Jest Tests with Coverage
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.

REM Run Jest directly with Node
node --experimental-vm-modules node_modules/jest/bin/jest.js --coverage --verbose

echo.
if %ERRORLEVEL% EQU 0 (
    echo ✅ Tests passed!
) else (
    echo ❌ Tests failed with exit code %ERRORLEVEL%
)
echo.
