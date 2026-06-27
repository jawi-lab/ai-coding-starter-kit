'use client';

import { useEffect } from 'react';
import { isNativePlatform } from '@/lib/native/platform';

/**
 * Wires the Android hardware/gesture back button (PROJ-9).
 *
 * Default Capacitor behaviour closes the app on every back press. Instead we
 * navigate one step back when there is history, and only exit the app from a
 * root screen with nothing to go back to. iOS has no system back button, so the
 * `backButton` event never fires there — the listener is harmless. No-op on web.
 */
export function NativeBackButton() {
  useEffect(() => {
    if (!isNativePlatform()) return;

    let cancelled = false;
    let cleanup: (() => void) | undefined;

    (async () => {
      const { App } = await import('@capacitor/app');
      if (cancelled) return;

      const handle = await App.addListener('backButton', ({ canGoBack }) => {
        if (canGoBack || window.history.length > 1) {
          window.history.back();
        } else {
          void App.exitApp();
        }
      });
      cleanup = () => void handle.remove();
    })();

    return () => {
      cancelled = true;
      cleanup?.();
    };
  }, []);

  return null;
}
