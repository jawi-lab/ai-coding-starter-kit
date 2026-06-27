import { describe, it, expect } from 'vitest';
import { isHttpUrl, isExternalHttpUrl, registerExternalLinkInterceptor } from './external-link';

describe('isHttpUrl', () => {
  it('accepts absolute http(s) URLs', () => {
    expect(isHttpUrl('https://example.com')).toBe(true);
    expect(isHttpUrl('http://localhost:3000/x')).toBe(true);
  });

  it('rejects dangerous and non-http schemes (BUG-9-1)', () => {
    expect(isHttpUrl('javascript:alert(1)')).toBe(false);
    expect(isHttpUrl('data:text/html,<script>1</script>')).toBe(false);
    expect(isHttpUrl('vbscript:msgbox')).toBe(false);
    expect(isHttpUrl('file:///etc/passwd')).toBe(false);
    expect(isHttpUrl('mailto:hi@example.com')).toBe(false);
    expect(isHttpUrl('/relative')).toBe(false);
    expect(isHttpUrl('https://')).toBe(false);
  });
});

// jsdom origin is http://localhost.
describe('isExternalHttpUrl', () => {
  it('treats absolute http(s) URLs to another origin as external', () => {
    expect(isExternalHttpUrl('https://example.com/foo')).toBe(true);
    expect(isExternalHttpUrl('http://maps.google.com')).toBe(true);
  });

  it('treats same-origin absolute URLs as internal', () => {
    expect(isExternalHttpUrl(`${window.location.origin}/groups`)).toBe(false);
  });

  it('ignores relative paths and non-http schemes', () => {
    expect(isExternalHttpUrl('/groups/view')).toBe(false);
    expect(isExternalHttpUrl('#')).toBe(false);
    expect(isExternalHttpUrl('mailto:hi@example.com')).toBe(false);
    expect(isExternalHttpUrl('tel:+49123')).toBe(false);
  });

  it('does not throw on malformed input', () => {
    expect(isExternalHttpUrl('https://')).toBe(false);
  });
});

describe('registerExternalLinkInterceptor', () => {
  it('is a no-op on the web (returns a cleanup that does nothing)', () => {
    // jsdom => isNativePlatform() is false, so no document listener is attached.
    const cleanup = registerExternalLinkInterceptor();
    expect(typeof cleanup).toBe('function');
    expect(() => cleanup()).not.toThrow();
  });
});
