'use client';

import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { isNativePlatform } from '@/lib/native/platform';
import { registerPushListeners, syncDeviceTokenIfPermitted } from '@/lib/native/push';

/**
 * Mounts the native push listeners (PROJ-10) and keeps the device token in sync.
 * No-op on the web — only inside the Capacitor shell does it register the FCM
 * receive/tap handlers (foreground toast + deep-link navigation) and (re)store
 * the device token. Renders nothing. Mirrors the other Native* listener pattern.
 */
export function NativePushListener() {
  const { user } = useAuth();

  // Receive/tap listeners — mounted once for the app's lifetime.
  useEffect(() => {
    if (!isNativePlatform()) return;

    let cleanup: (() => void) | undefined;
    let cancelled = false;

    registerPushListeners().then((remove) => {
      if (cancelled) remove();
      else cleanup = remove;
    });

    return () => {
      cancelled = true;
      cleanup?.();
    };
  }, []);

  // Whenever a user becomes authenticated (cold start with a session, or a
  // re-login on the same device), make sure their token is registered — but only
  // if push permission was already granted, so this never triggers the OS dialog.
  useEffect(() => {
    if (!isNativePlatform() || !user) return;
    void syncDeviceTokenIfPermitted();
  }, [user]);

  return null;
}
