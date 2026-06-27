'use client';

import { useEffect } from 'react';
import { isNativePlatform } from '@/lib/native/platform';

/**
 * Keeps the iOS status-bar text legible against the current theme (PROJ-9).
 * No-op on the web. The WebView overlays the status bar (see capacitor.config.ts),
 * so the bar floats over the app's background — light mode needs dark text, dark
 * mode needs light text. Reacts to theme changes by observing the `dark` class
 * that the theme switch toggles on <html>.
 *
 * Note the inverted Capacitor naming: `Style.Light` = dark text (for light
 * backgrounds), `Style.Dark` = light text (for dark backgrounds).
 */
export function NativeStatusBar() {
  useEffect(() => {
    if (!isNativePlatform()) return;

    let observer: MutationObserver | undefined;
    let cancelled = false;

    (async () => {
      const { StatusBar, Style } = await import('@capacitor/status-bar');
      if (cancelled) return;

      const apply = () => {
        const isDark = document.documentElement.classList.contains('dark');
        void StatusBar.setStyle({ style: isDark ? Style.Dark : Style.Light }).catch(() => {});
      };

      apply();
      observer = new MutationObserver(apply);
      observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['class'],
      });
    })();

    return () => {
      cancelled = true;
      observer?.disconnect();
    };
  }, []);

  return null;
}
