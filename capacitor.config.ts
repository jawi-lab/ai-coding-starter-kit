import type { CapacitorConfig } from '@capacitor/cli';
import { KeyboardResize } from '@capacitor/keyboard';

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
  plugins: {
    // The WebView extends under the status bar (overlaysWebView); content is
    // kept clear of it via `env(safe-area-inset-top)` in the CSS. The concrete
    // light/dark text style is set at runtime from the app theme — see
    // src/components/native/NativeStatusBar.tsx.
    StatusBar: {
      overlaysWebView: true,
      style: 'DEFAULT',
    },
    // `resize: 'none'` keeps the WebView full-height and lets the visual viewport
    // shrink when the keyboard opens — i.e. it behaves exactly like mobile Safari,
    // which is what the existing `useKeyboardInset` hook (visualViewport-based,
    // pins the activity sheet above the keyboard) was engineered for. A native
    // resize would silently make that hook inert. A scroll-into-view assist for
    // normal-flow inputs runs on top — see NativeKeyboard.tsx. (PROJ-9 edge case
    // "Tastatur überdeckt Eingabefelder".)
    Keyboard: {
      resize: KeyboardResize.None,
    },
    // Use the brand cream as the splash background; the auto-generated splash
    // assets (npx @capacitor/assets) center the ZUSAMMEN logo on it.
    SplashScreen: {
      launchShowDuration: 600,
      backgroundColor: '#F8EBD9',
      showSpinner: false,
    },
  },
};

export default config;
