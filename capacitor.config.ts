import type { CapacitorConfig } from '@capacitor/cli';

/**
 * Capacitor configuration for ZUSAMMEN (PROJ-9).
 *
 * The native shell loads the locally bundled static export (`out/`, produced by
 * `npm run build` with `output: 'export'`) instead of the remote Vercel URL —
 * see PROJ-9 Decision Log ("Lokal gebündelter Static Export").
 *
 * `appId` is the final bundle ID / custom URL scheme. The Supabase auth redirect
 * `com.zusammen.app://auth/callback` is resolved back into the app as a deep link
 * by @capacitor/app's `appUrlOpen` listener (see src/lib/native/deep-link.ts).
 */
const config: CapacitorConfig = {
  appId: 'com.zusammen.app',
  appName: 'ZUSAMMEN',
  webDir: 'out',
};

export default config;
