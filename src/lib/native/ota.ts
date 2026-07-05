/**
 * Over-the-air (OTA) update bridge for the native Capacitor shell (PROJ-11).
 *
 * OTA lets the installed native app receive new *web-bundle* versions
 * (JS/HTML/CSS from the `out/` static export) without an App-Store / TestFlight /
 * Play-Store rebuild. It exists **only** inside the Capacitor container: every
 * function here is a no-op on the web (guarded by `isNativePlatform()`), so the
 * Vercel build is untouched — mirroring all other native-only modules.
 *
 * We use `@capgo/capacitor-updater`, which handles the background download,
 * apply-at-next-cold-start, auto-rollback and channel routing itself. This helper
 * is only the thin client half that the app calls:
 *   - `notifyAppReady()` — tells Capgo "this bundle started cleanly", which is the
 *     signal that DISARMS auto-rollback. Without it, Capgo rolls back after
 *     `appReadyTimeout` (10 s, set in capacitor.config.ts). This is the core of
 *     the safety net.
 *   - `setOtaChannel()` — one-time channel assignment so a test device can opt
 *     into the "beta" channel (all other devices stay on "production").
 *   - `getOtaStatus()` — read-only current bundle/channel, for diagnostics.
 *
 * Deliberate scope (see PROJ-11 spec): the Capgo *account* and the first live
 * bundle upload are a later manual step. Until then the app runs entirely on its
 * locally bundled `out/`; a missing account / no published updates simply means
 * "no update" — never an error or crash. Every call below fails silently.
 *
 * The plugin is loaded via dynamic `import()` so its native code never ends up in
 * the web bundle — same pattern as `external-link.ts` / `push.ts`.
 */
import { isNativePlatform } from './platform';

/** The two fixed channels. Test devices opt into `beta`; everyone else stays on
 *  `production` (the `defaultChannel` in capacitor.config.ts). */
export type OtaChannel = 'beta' | 'production';

/**
 * Signals to Capgo that the current web bundle has rendered successfully, which
 * disarms auto-rollback for this bundle. Must run on every successful app render
 * (mounted in `NativeUpdater`). No-op on the web; never throws.
 */
export async function notifyAppReady(): Promise<void> {
  if (!isNativePlatform()) return;
  try {
    const { CapacitorUpdater } = await import('@capgo/capacitor-updater');
    await CapacitorUpdater.notifyAppReady();
  } catch {
    // No plugin / no account / offline → the built-in bundle stays active. Silent
    // by design: OTA must never surface an error to the user.
  }
}

/**
 * Assigns this device to an OTA channel (one-time, persisted by the plugin).
 * Used to put a developer's own test device on `beta` so it — and only it —
 * receives beta bundles before they are promoted to production.
 *
 * Returns `true` when the channel was accepted. No-op → `false` on the web or
 * when Capgo is unreachable / has no account yet. Never throws.
 */
export async function setOtaChannel(channel: OtaChannel): Promise<boolean> {
  if (!isNativePlatform()) return false;
  try {
    const { CapacitorUpdater } = await import('@capgo/capacitor-updater');
    const res = await CapacitorUpdater.setChannel({ channel });
    return res.status === 'ok';
  } catch {
    return false;
  }
}

/** Current OTA state, for diagnostics only. `null` on the web / when unavailable. */
export interface OtaStatus {
  /** Version string of the bundle currently running (`builtin` = the shipped one). */
  bundleVersion: string;
  /** Native shell version the bundle is running against. */
  nativeVersion: string;
  /** The channel this device is assigned to, if known. */
  channel?: string;
}

/**
 * Reads the currently active bundle + assigned channel. Read-only, for debugging
 * / support. No-op → `null` on the web or when the plugin/account is unavailable.
 */
export async function getOtaStatus(): Promise<OtaStatus | null> {
  if (!isNativePlatform()) return null;
  try {
    const { CapacitorUpdater } = await import('@capgo/capacitor-updater');
    const current = await CapacitorUpdater.current();
    let channel: string | undefined;
    try {
      channel = (await CapacitorUpdater.getChannel()).channel;
    } catch {
      // getChannel needs a reachable backend; ignore when offline / no account.
    }
    return {
      bundleVersion: current.bundle.version,
      nativeVersion: current.native,
      ...(channel ? { channel } : {}),
    };
  } catch {
    return null;
  }
}
