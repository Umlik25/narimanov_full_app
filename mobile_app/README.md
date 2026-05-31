# City Grind Mobile App

Standalone PWA + Capacitor app built from the polished mobile demo UI.

## Run as PWA

```bash
cd mobile_app
npm install --legacy-peer-deps
npm run dev -- --host 0.0.0.0 --port 5174
```

Open `http://localhost:5174`.

## Run Over HTTPS

```bash
make https
```

This starts a local HTTPS server for the production build and generates a local CA in your temp directory if needed.

On Android, install the CA certificate shown in the terminal first, then open the HTTPS URL printed by the server.

If you are using Chrome on Android, this is the path that allows the app to be treated as a secure PWA origin.

## Connect Backend

The app reads the FastAPI backend URL from `VITE_API_BASE_URL`.

```bash
cp .env.example .env
```

Default:

```bash
VITE_API_BASE_URL=/backend
VITE_USE_BACKEND=true
```

When running the HTTPS PWA preview, `/backend` is proxied to `http://main-server:8989` so the browser can call the HTTP backend from the secure app origin.

## Generate API Client

The typed API client is generated from the backend OpenAPI schema with Hey API.

```bash
npm run api:generate
```

This reads the OpenAPI schema from `http://main-server:8989/openapi.json`.

## Build Web Assets

```bash
npm run build
```

## Sync Native Apps

```bash
npm run cap:sync
```

## Open Native Projects

```bash
npm run android
npm run ios
```

Android opens in Android Studio. iOS opens in Xcode.

## Build Android Debug APK

Capacitor Android requires Java 21 or newer.

```bash
JAVA_HOME=$(/usr/libexec/java_home -v 23) PATH=$(/usr/libexec/java_home -v 23)/bin:$PATH npm run android:debug
```

The APK is created at:

```bash
android/app/build/outputs/apk/debug/app-debug.apk
```

## App Identity

- App name: City Grind
- Bundle/package ID: az.narimanov.ops
- Web directory: dist
