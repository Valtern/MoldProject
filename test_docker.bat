@echo off
setlocal enabledelayedexpansion

echo.
echo ====== DOCKER SYSTEM CHECK ======
echo.

REM Test 1: Docker command exists
echo [Test 1] Checking if Docker is installed...
docker --version >nul 2>&1
if !ERRORLEVEL! EQU 0 (
    echo [PASS] Docker installed:
    for /f "tokens=*" %%i in ('docker --version') do echo   %%i
) else (
    echo [FAIL] Docker NOT found
    echo Action: Install Docker Desktop from https://www.docker.com/products/docker-desktop
    goto ERROR
)

echo.

REM Test 2: Docker daemon is running
echo [Test 2] Checking if Docker daemon is running...
docker ps >nul 2>&1
if !ERRORLEVEL! EQU 0 (
    echo [PASS] Docker daemon is running
) else (
    echo [FAIL] Docker daemon is NOT running
    echo Action: Start Docker Desktop and wait for it to initialize
    goto ERROR
)

echo.

REM Test 3: Docker compose available
echo [Test 3] Checking docker-compose...
docker compose version >nul 2>&1
if !ERRORLEVEL! EQU 0 (
    echo [PASS] docker compose (v2) available
) else (
    docker-compose --version >nul 2>&1
    if !ERRORLEVEL! EQU 0 (
        echo [PASS] docker-compose (v1) available
    ) else (
        echo [WARN] docker-compose NOT available
        echo Action: May cause issues - consider updating Docker Desktop
    )
)

echo.

REM Test 4: Check available disk space (needs at least 5GB)
echo [Test 4] Checking system resources...
for /f "tokens=3" %%A in ('dir C:\ ^| find "bytes free"') do (
    set free_bytes=%%A
    set free_bytes=!free_bytes:,=!
)
if defined free_bytes (
    set /a free_gb=!free_bytes!/1024/1024/1024
    echo   Free space: !free_gb! GB
    if !free_gb! GEQ 5 (
        echo [PASS] Sufficient disk space for Docker
    ) else (
        echo [WARN] Low disk space - Docker build may fail
    )
) else (
    echo [WARN] Could not check disk space
)

echo.
echo ====== RESULT: READY TO BUILD DOCKER =====
echo.
echo Next step: Run docker build
echo.
pause
goto END

:ERROR
echo.
echo ====== RESULT: NOT READY =====
echo Please fix the issues above and try again.
echo.
pause

:END
endlocal
