@echo off
REM ============================================
REM MEMORYCARE - QUICK START SCRIPT (Windows)
REM One-click setup for the application
REM ============================================

echo.
echo ========================================== 
echo   MemoryCare - Alzheimer's Assistive App
echo ==========================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js is not installed!
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo [OK] Node.js found
node --version
echo.

REM Install dependencies
echo [STEP 1] Installing dependencies...
call npm install
echo.

if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Failed to install dependencies
    pause
    exit /b 1
)

echo [OK] Dependencies installed successfully!
echo.

REM Start the server
echo [STEP 2] Starting MemoryCare application...
echo.
echo ==========================================
echo   APPLICATION READY!
echo ==========================================
echo.
echo Open your browser and navigate to:
echo   http://localhost:3000
echo.
echo Patient Interface: 
echo   http://localhost:3000/patient
echo.
echo Caregiver Dashboard:
echo   http://localhost:3000/caregiver
echo.
echo Press Ctrl+C to stop the server
echo ==========================================
echo.

REM Open browser after 5 seconds
start /b cmd /c "timeout /t 5 >nul & start http://localhost:3000"

call npm start
