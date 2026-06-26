/**
 * Native auth deep-link handling (PROJ-9).
 *
 * On the web the Supabase auth callback returns to `/auth/callback` and the page
 * component exchanges the PKCE `?code=` for a session. Inside the native shell
 * there is no web origin to return to, so Supabase redirects to the custom URL
 * scheme `com.zusammen.app://auth/callback?code=…`. The OS resolves that as a
 * deep link and hands it to @capacitor/app's `appUrlOpen` event (or, on a cold
 * start, `App.getLaunchUrl()`). This module turns that URL back into a real
 * Supabase session via `exchangeCodeForSession()` and routes the user onward.
 *
 * Mirrors the error/recovery classification of the web callback page
 * (src/app/auth/callback/page.tsx) so both flows behave identically.
 */
import { App } from '@capacitor/app';
import { supabase } from '@/lib/supabase';
import { NATIVE_AUTH_SCHEME } from '@/lib/auth-redirect';

export type AuthErrorKind = 'expired' | 'used' | 'generic';

export type DeepLinkAuthResult =
  | { status: 'signed-in' }
  | { status: 'recovery' }
  | { status: 'error'; kind: AuthErrorKind }
  | { status: 'ignored' };

type ParsedAuthDeepLink =
  | { kind: 'code'; code: string; isRecovery: boolean }
  | { kind: 'error'; errorKind: AuthErrorKind }
  | { kind: 'ignored' };

function classifyError(error: string | null, errorCode: string | null): AuthErrorKind {
  if (errorCode === 'otp_expired') return 'expired';
  if (error === 'access_denied') return 'used';
  return 'generic';
}

/**
 * Pure parse of an incoming deep-link URL. Custom URL schemes do not always
 * parse cleanly via `new URL()`, so the query string is extracted by hand.
 * Returns `ignored` for anything that is not our auth callback.
 */
export function parseAuthDeepLink(rawUrl: string): ParsedAuthDeepLink {
  if (!rawUrl.startsWith(`${NATIVE_AUTH_SCHEME}://`)) return { kind: 'ignored' };

  const queryIndex = rawUrl.indexOf('?');
  if (queryIndex === -1) return { kind: 'ignored' };

  const params = new URLSearchParams(rawUrl.slice(queryIndex + 1));

  const error = params.get('error');
  const errorCode = params.get('error_code');
  if (error) return { kind: 'error', errorKind: classifyError(error, errorCode) };

  const code = params.get('code');
  if (!code) return { kind: 'ignored' };

  return { kind: 'code', code, isRecovery: params.get('type') === 'recovery' };
}

/**
 * Parses the deep link and, for a valid PKCE link, exchanges the code for a
 * Supabase session. Returns the outcome; navigation is handled by the caller.
 */
export async function handleAuthDeepLink(rawUrl: string): Promise<DeepLinkAuthResult> {
  const parsed = parseAuthDeepLink(rawUrl);

  if (parsed.kind === 'ignored') return { status: 'ignored' };
  if (parsed.kind === 'error') return { status: 'error', kind: parsed.errorKind };

  try {
    const { error } = await supabase.auth.exchangeCodeForSession(parsed.code);
    if (error) return { status: 'error', kind: 'generic' };
  } catch {
    return { status: 'error', kind: 'generic' };
  }

  return parsed.isRecovery ? { status: 'recovery' } : { status: 'signed-in' };
}

/** Routes the user based on the deep-link outcome (trailing slash: static export). */
function navigateForResult(result: DeepLinkAuthResult): void {
  switch (result.status) {
    case 'signed-in':
      window.location.href = '/';
      break;
    case 'recovery':
      window.location.href = '/reset-password/';
      break;
    case 'error':
      window.location.href = `/login/?auth_error=${result.kind}`;
      break;
    case 'ignored':
      break;
  }
}

/**
 * Registers the auth deep-link listeners. Handles both:
 *  - cold start: the app was launched directly by the deep link, and
 *  - warm: the app was already running (`appUrlOpen`).
 *
 * Returns an async cleanup function that removes the listener.
 */
export async function registerAuthDeepLinkListener(): Promise<() => void> {
  // Cold start — the deep link may be the URL the app was launched with.
  const launch = await App.getLaunchUrl();
  if (launch?.url) {
    navigateForResult(await handleAuthDeepLink(launch.url));
  }

  const handle = await App.addListener('appUrlOpen', async ({ url }) => {
    navigateForResult(await handleAuthDeepLink(url));
  });

  return () => {
    void handle.remove();
  };
}
