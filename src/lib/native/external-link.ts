/**
 * External links in the native shell (PROJ-9).
 *
 * Inside the Capacitor WebView the app is served from `capacitor://localhost`.
 * A normal `<a href="https://…" target="_blank">` would otherwise try to open
 * inside the WebView (replacing the app or doing nothing). External links must
 * open in the system browser instead — that is what `@capacitor/browser` does.
 *
 * The web build keeps the default anchor behaviour untouched (no-op interceptor).
 */
import { isNativePlatform } from './platform';

/** Opens an http(s) URL in the system browser (native) / a new tab (web). */
export async function openExternalUrl(url: string): Promise<void> {
  if (isNativePlatform()) {
    const { Browser } = await import('@capacitor/browser');
    await Browser.open({ url });
    return;
  }
  window.open(url, '_blank', 'noopener,noreferrer');
}

/**
 * True only for a well-formed absolute http(s) URL. Guards against schemes like
 * `javascript:`/`data:` that `new URL()` would otherwise accept and that would
 * execute in the WebView when used as an `<a href>` (PROJ-9 BUG-9-1).
 */
export function isHttpUrl(href: string): boolean {
  if (!/^https?:\/\//i.test(href)) return false;
  try {
    const { protocol } = new URL(href);
    return protocol === 'http:' || protocol === 'https:';
  } catch {
    return false;
  }
}

/** True for an absolute http(s) URL that points outside the app's own origin. */
export function isExternalHttpUrl(href: string): boolean {
  if (!isHttpUrl(href)) return false;
  try {
    return new URL(href).origin !== window.location.origin;
  } catch {
    return false;
  }
}

/** Dangerous URL schemes that must never be navigated to inside the WebView. */
const DANGEROUS_SCHEME = /^\s*(javascript|data|vbscript|blob|file):/i;

/**
 * Registers a document-level click interceptor that routes external http(s)
 * links through the system browser. Delegated on purpose: it covers every
 * current and future external `<a>` (e.g. an activity's URL) without each
 * component having to know about the native platform.
 *
 * No-op on the web. Returns a cleanup function.
 */
export function registerExternalLinkInterceptor(): () => void {
  if (!isNativePlatform()) return () => {};

  const onClick = (event: MouseEvent) => {
    // Respect modified clicks and already-handled events.
    if (event.defaultPrevented || event.button !== 0) return;
    const anchor = (event.target as Element | null)?.closest('a');
    const href = anchor?.getAttribute('href');
    if (!href) return;

    // Defense-in-depth: never let a javascript:/data:/… link navigate inside the
    // WebView (it would run with bridge + session access). Block it outright.
    if (DANGEROUS_SCHEME.test(href)) {
      event.preventDefault();
      return;
    }

    // External http(s) links open in the system browser.
    if (isExternalHttpUrl(href)) {
      event.preventDefault();
      void openExternalUrl(href);
    }
    // Everything else (relative app routes, mailto:, tel:) keeps default behaviour.
  };

  document.addEventListener('click', onClick);
  return () => document.removeEventListener('click', onClick);
}
