---
paths:
  - "android/**"
  - "ios/**"
  - "capacitor.config.ts"
  - "src/lib/native/**"
  - "src/components/native/**"
---

# Native Build Rules (Capacitor)

## Before Every Native Build
- The project is in iCloud, which creates `file 2.ext` duplicates. They cause iOS white screens (HTML references chunks missing from the bundle) and break Android `mergeDebugResources` and dexing.
- Remove them from `out`, `ios`, `android` and `node_modules/@capacitor*`, `node_modules/@capgo*`. Don't match by pattern alone: `assets/Mellon Logo clean 1.0.png` is a real file, so only touch untracked files whose original exists.
- Then: `npm run build` → `npx cap sync <platform>`.

## iOS
- Build with `-derivedDataPath` outside the project folder. iCloud xattrs inside it make CodeSign fail (`resource fork … detritus not allowed`).
- Build with `-sdk iphonesimulator -destination 'generic/platform=iOS Simulator'`, then `xcrun simctl install` and `launch`. xcodebuild doesn't find simulators by `id=`.
- If SwiftPM fails on `safe.bareRepository=explicit`, override it per build: `GIT_CONFIG_COUNT=1 GIT_CONFIG_KEY_0=safe.bareRepository GIT_CONFIG_VALUE_0=all`.
- A new `GoogleService-Info.plist` must also be registered in `project.pbxproj`; `cap sync` doesn't do that.
- Never send `⌘K` to the simulator.

## Android
- The foojay resolver in `android/settings.gradle` and `proguard-android-optimize.txt` in `android/app/build.gradle` are manual fixes. `cap sync` keeps them, but `cap add android` overwrites them, so reapply them then.
- Always target devices with `adb -s <serial>`: a physical phone may be connected as well.

## Routing
Next's static export is multi-page, while Capacitor's default router assumes a single-page app. `MainViewController.swift` (iOS) and `NextStaticWebViewClient.java` (Android) resolve directory routes to their `index.html`. Keep them when regenerating native projects.

## Data
Emulators may be signed in with a real account. Check which account is active before changing anything, and use the QA account for tests.
