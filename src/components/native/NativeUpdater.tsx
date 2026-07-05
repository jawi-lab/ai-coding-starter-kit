'use client';

import { useEffect } from 'react';
import { isNativePlatform } from '@/lib/native/platform';
import { notifyAppReady, setOtaChannel, type OtaChannel } from '@/lib/native/ota';

/**
 * Native OTA bootstrap (PROJ-11). Mounted once in `layout.tsx`, alongside the
 * other `Native*` components. No-op on the web — everything runs only inside the
 * Capacitor shell behind `isNativePlatform()`, so the Vercel build is untouched.
 *
 * Two responsibilities, both invisible to the user:
 *  1. Call `notifyAppReady()` after the app has rendered — this "I started
 *     cleanly" signal disarms Capgo's auto-rollback for the current bundle. If it
 *     never fires (a broken bundle), Capgo rolls back to the last working version
 *     within `appReadyTimeout` (10 s, set in capacitor.config.ts).
 *  2. On a developer's test build, opt this device into the `beta` channel once,
 *     so beta bundles reach only that device before promotion to production.
 *
 * Renders nothing. The background update check + silent download + apply-at-next-
 * cold-start is handled entirely by the plugin (`autoUpdate: true`); this
 * component owns only the app-side signals.
 */

// Build-time channel override. A developer builds their own test device with
// `NEXT_PUBLIC_OTA_CHANNEL=beta` to self-assign the beta channel once; unset (the
// normal case) leaves every device on the `production` default. Inlined at build
// time by Next.js — see capacitor.config.ts `defaultChannel`.
const OTA_CHANNEL = process.env.NEXT_PUBLIC_OTA_CHANNEL as OtaChannel | undefined;

export function NativeUpdater() {
  useEffect(() => {
    if (!isNativePlatform()) return;

    // Disarm auto-rollback: we rendered, so this bundle is good. Fire first — it
    // is the safety-net signal and must not wait on anything else.
    void notifyAppReady();

    // One-time channel opt-in for test builds. No-op on production builds (env
    // unset) and silently ignored if Capgo has no account yet.
    if (OTA_CHANNEL === 'beta' || OTA_CHANNEL === 'production') {
      void setOtaChannel(OTA_CHANNEL);
    }
  }, []);

  return null;
}
