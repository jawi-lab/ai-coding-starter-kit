'use client';

import { useEffect } from 'react';
import { isNativePlatform } from '@/lib/native/platform';
import { registerAuthDeepLinkListener } from '@/lib/native/deep-link';

/**
 * Mounts the native auth deep-link listener (PROJ-9). No-op on the web — only
 * inside the Capacitor shell does it register @capacitor/app's `appUrlOpen`
 * handler that completes the OAuth/magic-link round-trip via
 * `exchangeCodeForSession()`. Renders nothing.
 */
export function NativeAuthListener() {
  useEffect(() => {
    if (!isNativePlatform()) return;

    let cleanup: (() => void) | undefined;
    let cancelled = false;

    registerAuthDeepLinkListener().then((remove) => {
      // If the component unmounted before the listener finished registering,
      // remove it immediately.
      if (cancelled) remove();
      else cleanup = remove;
    });

    return () => {
      cancelled = true;
      cleanup?.();
    };
  }, []);

  return null;
}
