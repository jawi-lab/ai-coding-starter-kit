'use client';

import { useEffect } from 'react';
import { registerExternalLinkInterceptor } from '@/lib/native/external-link';

/**
 * Mounts the external-link interceptor (PROJ-9) so http(s) links to other
 * origins open in the system browser instead of inside the WebView. No-op on
 * the web.
 */
export function NativeExternalLinks() {
  useEffect(() => registerExternalLinkInterceptor(), []);
  return null;
}
