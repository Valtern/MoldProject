@echo off
REM Check Docker availability
echo Checking Docker installation...
docker --version >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo [OK] Docker is installed:
    docker --version
) else (
    echo [ERROR] Docker is NOT installed
    echo Please install Docker Desktop from: https://www.docker.com/products/docker-desktop
    pause
    exit /b 1
)

echo.
echo Checking docker-compose...
docker-compose --version >nul 2>&1
if not errorlevel 1 goto DOCKER_COMPOSE_V1_OK

docker compose version >nul 2>&1
if not errorlevel 1 goto DOCKER_COMPOSE_V2_OK

echo [ERROR] docker-compose is NOT available
pause
exit /b 1

:DOCKER_COMPOSE_V1_OK
echo [OK] docker-compose is available:
docker-compose --version
goto DOCKER_COMPOSE_DONE

:DOCKER_COMPOSE_V2_OK
echo [OK] docker compose (v2) is available:
docker compose version
goto DOCKER_COMPOSE_DONE

:DOCKER_COMPOSE_DONE

echo.
echo Checking Docker daemon...
docker ps >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo [OK] Docker daemon is running
) else (
    echo [ERROR] Docker daemon is NOT running
    echo Please start Docker Desktop
    pause
    exit /b 1
)

echo.
echo ===== Docker Setup OK =====
pause
