@echo off
echo Building Har Ghar Munga APK with Docker...

REM Check if Docker is installed
docker --version >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Docker is not installed!
    echo Please install Docker Desktop from: https://www.docker.com/products/docker-desktop
    pause
    exit /b 1
)

REM Build Docker image
echo Building Docker image...
docker build -t har-ghar-munga-builder .

if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Docker build failed!
    pause
    exit /b 1
)

REM Run container and copy APK
echo Building APK...
docker run --name temp-builder har-ghar-munga-builder

REM Copy APK from container
echo Copying APK...
docker cp temp-builder:/app/har-ghar-munga.apk ./har-ghar-munga.apk

REM Clean up
docker rm temp-builder

if exist har-ghar-munga.apk (
    echo.
    echo SUCCESS! APK built successfully!
    echo APK location: har-ghar-munga.apk
    echo.
) else (
    echo.
    echo ERROR: APK not found!
    echo.
)

pause 