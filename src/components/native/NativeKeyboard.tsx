'use client';

import { useEffect } from 'react';
import { isNativePlatform } from '@/lib/native/platform';

/**
 * Keeps the focused input visible when the native keyboard opens (PROJ-9).
 *
 * `Keyboard.resize: 'native'` (capacitor.config.ts) shrinks the WebView so the
 * keyboard never overlaps content; this assist additionally scrolls the active
 * field into view, which matters for inputs low on a long form. No-op on web.
 */
export function NativeKeyboard() {
  useEffect(() => {
    if (!isNativePlatform()) return;

    let cancelled = false;
    let cleanup: (() => void) | undefined;

    (async () => {
      const { Keyboard } = await import('@capacitor/keyboard');
      if (cancelled) return;

      const handle = await Keyboard.addListener('keyboardDidShow', () => {
        const el = document.activeElement;
        if (el instanceof HTMLElement) {
          el.scrollIntoView({ block: 'center', behavior: 'smooth' });
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
