@echo off
setlocal enabledelayedexpansion

cd /d "%~dp0deep-learning"

if not exist "docker-compose.yml" (
    echo [ERROR] docker-compose.yml not found!
    echo Expected: %CD%\docker-compose.yml
    pause
    exit /b 1
)

if not exist "docker\Dockerfile" (
    echo [ERROR] Dockerfile not found!
    echo Expected: %CD%\docker\Dockerfile
    echo.
    echo Checking if docker directory exists:
    if exist "docker\" (
        echo   docker\ folder EXISTS
        dir docker\
    ) else (
        echo   docker\ folder NOT FOUND
    )
    pause
    exit /b 1
)

echo.
echo ===== DOCKER BUILD START =====
echo.
echo Building ML environment container...
echo Location: %CD%
echo.
echo This may take 5-10 minutes on first run
echo Progress:
echo  1. Download Python 3.10 base image
echo  2. Install system packages
echo  3. Install Python dependencies (torch, jupyter, fastapi, etc)
echo  4. Create ready-to-use container
echo.

docker-compose build

if !ERRORLEVEL! EQU 0 (
    echo.
    echo ===== BUILD SUCCESSFUL =====
    echo.
    echo Next: Run the container with:
    echo   docker-compose up
    echo.
    echo Or in background:
    echo   docker-compose up -d
    echo.
    echo Then access:
    echo   - Jupyter Lab: http://localhost:8888
    echo   - FastAPI: http://localhost:8000
    echo.
) else (
    echo.
    echo ===== BUILD FAILED =====
    echo.
    echo Troubleshooting:
    echo  1. Check internet connection
    echo  2. Verify Docker daemon is running
    echo  3. Check available disk space (need at least 5GB)
    echo  4. Try again or check Docker logs
    echo.
)

pause
