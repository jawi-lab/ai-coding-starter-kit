'use client';

import { useEffect, useState } from 'react';
import { WifiOff } from 'lucide-react';
import { isNativePlatform } from '@/lib/native/platform';

/**
 * Shows a "Keine Verbindung" banner while the device is offline (PROJ-9).
 *
 * The native shell loads its UI from the locally bundled static export, so the
 * app shell always renders — but Supabase data calls fail without a connection.
 * This banner makes that state explicit instead of leaving the user with empty
 * screens / silent failures (PROJ-9 edge case "Keine Internetverbindung").
 *
 * No-op on the web (the browser handles its own offline UX). It sits below the
 * status bar via `pt-safe` and overlays the top of the app.
 */
export function NativeNetworkBanner() {
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    if (!isNativePlatform()) return;

    let cancelled = false;
    let cleanup: (() => void) | undefined;

    (async () => {
      const { Network } = await import('@capacitor/network');
      if (cancelled) return;

      const status = await Network.getStatus();
      if (!cancelled) setOffline(!status.connected);

      const handle = await Network.addListener('networkStatusChange', (s) => {
        setOffline(!s.connected);
      });
      cleanup = () => void handle.remove();
    })();

    return () => {
      cancelled = true;
      cleanup?.();
    };
  }, []);

  if (!offline) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="pt-safe fixed inset-x-0 top-0 z-50 bg-ink-2 text-surface"
    >
      <div className="flex h-10 items-center justify-center gap-2 px-4 text-[13px] font-medium">
        <WifiOff className="h-4 w-4 flex-shrink-0" />
        <span>Keine Verbindung &ndash; einige Inhalte sind nicht verf&uuml;gbar.</span>
      </div>
    </div>
  );
}
