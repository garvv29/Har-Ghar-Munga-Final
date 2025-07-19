# Har Ghar Munga App

A React Native application for tracking family progress and Anganwadi activities.

## Features

- **Role-based Authentication**: Family, Anganwadi, and Admin roles
- **Photo Upload**: Capture and upload photos without cropping
- **Progress Tracking**: Monitor family progress with 100% cap
- **Local Storage**: Photos persist locally on device
- **Dynamic Notifications**: 24-hour expiry notifications for Anganwadi
- **Error Handling**: Robust error handling and fallback navigation

## Build Options

### 1. GitHub Actions (Recommended)
- Automatic build on code push
- No local setup required
- APK available for download

### 2. Docker Build
```bash
build-with-docker.bat
```

### 3. Local Build
```bash
build-apk.bat
```

### 4. EAS Build
```bash
eas build --platform android --profile production
```

## Installation

1. Clone the repository
2. Install dependencies: `npm install`
3. Run the app: `npx expo start`

## API Endpoints

See `API_ENDPOINTS.md` for detailed API documentation.

---

**Latest Build**: Ready for production deployment! 🚀
