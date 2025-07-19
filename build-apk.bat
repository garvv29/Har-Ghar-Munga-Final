@echo off
echo Building Har Ghar Munga APK...

REM Install dependencies
echo Installing dependencies...
npm install

REM Build for Android
echo Building Android APK...
cd android
call gradlew assembleRelease

if %ERRORLEVEL% EQU 0 (
    echo.
    echo SUCCESS! APK built successfully!
    echo APK location: android/app/build/outputs/apk/release/app-release.apk
    echo.
    pause
) else (
    echo.
    echo ERROR: Build failed!
    echo.
    echo Possible solutions:
    echo 1. Install Android Studio and Android SDK
    echo 2. Set ANDROID_HOME environment variable
    echo 3. Use EAS Build instead: eas build --platform android --profile production
    echo.
    pause
) 