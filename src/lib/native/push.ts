/**
 * Native push-notification bridge (PROJ-10).
 *
 * Push exists only inside the Capacitor shell — every function here is a no-op on
 * the web (guarded by `isNativePlatform()`), matching the project constraint that
 * all push paths are native-only. We use `@capacitor-firebase/messaging`, which
 * yields a single FCM token on both platforms (on iOS the Firebase SDK wraps APNs
 * underneath), so one code path covers iOS and Android.
 *
 * Responsibilities:
 *  - ask for / read the OS permission (the onboarding soft-ask explains the value
 *    *before* this triggers the hard OS dialog),
 *  - obtain the device's FCM token and store it per logged-in user in
 *    `device_tokens` (created in /backend),
 *  - decouple the token on logout,
 *  - mount the receive/tap listeners: a foreground push shows a tappable sonner
 *    toast; a tapped push deep-links into the right context using the payload data.
 *
 * The `device_tokens` table + RLS and the server-side `send-push` Edge Function
 * are built in /backend; this module is the client half that writes the token and
 * reacts to incoming pushes.
 */
import type { PermissionState, PluginListenerHandle } from '@capacitor/core';
import { FirebaseMessaging } from '@capacitor-firebase/messaging';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { isGroupTab, type GroupTab } from '@/lib/group-routes';
import { isNativePlatform, getPlatform } from './platform';

export type PushPermissionResult = 'granted' | 'denied' | 'unsupported';

/** Deep-link target carried in a push payload (see send-push in /backend). */
export interface PushTarget {
  groupId: string;
  activityId?: string;
  tab?: GroupTab;
}

function asString(value: unknown): string | undefined {
  return typeof value === 'string' && value.length > 0 ? value : undefined;
}

/**
 * Pure parse of a push `data` payload into a navigation target. FCM delivers all
 * data values as strings; we accept both snake_case (server style) and camelCase.
 * Returns `null` when there is no group to navigate to.
 */
export function parsePushTarget(data: unknown): PushTarget | null {
  if (!data || typeof data !== 'object') return null;
  const d = data as Record<string, unknown>;

  const groupId = asString(d.group_id ?? d.groupId);
  if (!groupId) return null;

  const activityId = asString(d.activity_id ?? d.activityId);
  const tabRaw = asString(d.tab);
  const tab = isGroupTab(tabRaw) ? tabRaw : undefined;

  return {
    groupId,
    ...(activityId ? { activityId } : {}),
    ...(tab ? { tab } : {}),
  };
}

/**
 * Builds the in-app path for a target. Trailing slash before the query matches
 * the static-export convention (`trailingSlash: true`). An `activity` param tells
 * the group view to open that activity's detail sheet on arrival.
 */
export function pushTargetToPath(target: PushTarget): string {
  const params = new URLSearchParams();
  params.set('id', target.groupId);
  if (target.tab) params.set('tab', target.tab);
  if (target.activityId) params.set('activity', target.activityId);
  return `/groups/view/?${params.toString()}`;
}

/**
 * Navigates to the push target via a full-page load. Static export reloads on
 * every hop anyway, and this keeps push tap navigation on the same mechanism the
 * auth deep-link uses (window.location.href). No-op if the payload has no target.
 * AuthGuard on the destination handles the logged-out cold-start case (→ login).
 */
export function navigateToPushTarget(data: unknown): void {
  const target = parsePushTarget(data);
  if (!target) return;
  window.location.href = pushTargetToPath(target);
}

/** Current OS push permission, or 'unsupported' on the web. */
export async function getPushPermissionState(): Promise<PermissionState | 'unsupported'> {
  if (!isNativePlatform()) return 'unsupported';
  try {
    const { receive } = await FirebaseMessaging.checkPermissions();
    return receive;
  } catch {
    return 'denied';
  }
}

/**
 * Obtains the device's FCM token and stores it for the current user via the
 * `register_device_token` RPC. The RPC upserts on the token (unique) and always
 * stamps the row with `auth.uid()`, so a re-login on the same device reassigns
 * the row to the new user (Re-Login edge case) without a permissive RLS policy.
 * Silently no-ops if there is no token yet (e.g. APNs not registered).
 */
export async function registerDeviceToken(): Promise<void> {
  if (!isNativePlatform()) return;

  let token: string | undefined;
  try {
    token = (await FirebaseMessaging.getToken()).token;
  } catch {
    // iOS can reject getToken() before APNs registration completes — try later.
    return;
  }
  if (!token) return;

  await supabase.rpc('register_device_token', {
    p_token: token,
    p_platform: getPlatform(),
  });
}

/** Registers the token only if the OS permission is already granted. */
export async function syncDeviceTokenIfPermitted(): Promise<void> {
  if ((await getPushPermissionState()) !== 'granted') return;
  await registerDeviceToken();
}

/**
 * Soft-ask "Erlauben" path: triggers the OS dialog and, on approval, registers
 * the token. Returns the outcome so the caller can adjust its UI.
 */
export async function requestPushPermission(): Promise<PushPermissionResult> {
  if (!isNativePlatform()) return 'unsupported';

  let receive: PermissionState;
  try {
    ({ receive } = await FirebaseMessaging.requestPermissions());
  } catch {
    return 'denied';
  }

  if (receive !== 'granted') return 'denied';
  await registerDeviceToken();
  return 'granted';
}

/**
 * Decouples this device's token on logout: removes the FCM token from the device
 * and deletes its `device_tokens` row so the old user no longer receives pushes
 * here. Best-effort — failures must never block the logout flow.
 */
export async function removeDeviceToken(): Promise<void> {
  if (!isNativePlatform()) return;
  try {
    const { token } = await FirebaseMessaging.getToken();
    if (token) {
      await supabase.from('device_tokens').delete().eq('token', token);
    }
    await FirebaseMessaging.deleteToken();
  } catch {
    // Ignore — worst case a stale row is cleaned up server-side on next send.
  }
}

/**
 * Mounts the push receive/tap listeners (native only). Returns an async cleanup.
 *  - `tokenReceived`            → re-store the rotated token.
 *  - `notificationReceived`     → foreground: tappable sonner toast (no banner).
 *  - `notificationActionPerformed` → tap: deep-link into the right context.
 */
export async function registerPushListeners(): Promise<() => void> {
  if (!isNativePlatform()) return () => {};

  const handles: PluginListenerHandle[] = [];

  handles.push(
    await FirebaseMessaging.addListener('tokenReceived', () => {
      void registerDeviceToken();
    }),
  );

  handles.push(
    await FirebaseMessaging.addListener('notificationReceived', ({ notification }) => {
      const target = parsePushTarget(notification.data);
      toast(notification.title ?? 'Neue Benachrichtigung', {
        description: notification.body ?? undefined,
        action: target
          ? { label: 'Öffnen', onClick: () => navigateToPushTarget(notification.data) }
          : undefined,
      });
    }),
  );

  handles.push(
    await FirebaseMessaging.addListener('notificationActionPerformed', ({ notification }) => {
      navigateToPushTarget(notification.data);
    }),
  );

  return () => {
    for (const handle of handles) void handle.remove();
  };
}
