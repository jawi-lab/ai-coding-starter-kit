/**
 * Auth redirect helper for the Supabase email/OAuth callback.
 *
 * On the web the callback returns to the current origin
 * (`https://…/auth/callback`). Inside the native Capacitor shell (PROJ-9)
 * `window.location.origin` is `capacitor://localhost`, which Supabase cannot
 * route back to — so we hand Supabase a custom URL scheme that the OS resolves
 * as a deep link back into the app:
 *
 *   com.zusammen.app://auth/callback
 *
 * The matching native deep-link listener (@capacitor/app `appUrlOpen`) is wired
 * in the /frontend step; it extracts the `?code=` and calls
 * `supabase.auth.exchangeCodeForSession()` (PKCE).
 *
 * BACKEND/DASHBOARD: this exact URL must be added to the Supabase project's
 * Authentication → URL Configuration → Redirect URLs allow-list, otherwise
 * Supabase rejects it.
 */

/** Bundle-ID / custom URL scheme for ZUSAMMEN (iOS + Android, final — PROJ-9). */
export const NATIVE_AUTH_SCHEME = 'com.zusammen.app'

/** Path segment of the Supabase auth callback. */
export const AUTH_CALLBACK_PATH = '/auth/callback'

/** Native deep link Supabase redirects to after auth (PKCE `?code=` appended). */
export const NATIVE_AUTH_CALLBACK_URL = `${NATIVE_AUTH_SCHEME}:/${AUTH_CALLBACK_PATH}`

/**
 * Detects the native Capacitor runtime without a hard dependency on
 * `@capacitor/core` (which is installed later in the PROJ-9 frontend step).
 * Capacitor injects a `window.Capacitor` global; until then this is `false`
 * and the web path is used unchanged.
 */
export function isNativePlatform(): boolean {
  if (typeof window === 'undefined') return false
  const cap = (window as unknown as {
    Capacitor?: { isNativePlatform?: () => boolean }
  }).Capacitor
  return cap?.isNativePlatform?.() ?? false
}

/**
 * Returns the redirect URL to pass to Supabase auth calls
 * (`emailRedirectTo`, `resetPasswordForEmail`, OAuth `redirectTo`).
 *
 * - Native: `com.zusammen.app://auth/callback`
 * - Web:    `<origin>/auth/callback`
 */
export function getAuthCallbackUrl(): string {
  if (isNativePlatform()) return NATIVE_AUTH_CALLBACK_URL
  return `${window.location.origin}${AUTH_CALLBACK_PATH}`
}
