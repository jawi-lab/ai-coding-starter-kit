import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// Mock the native + supabase modules so the parser/handler can be tested in
// isolation without loading the real Capacitor bridge or a Supabase client.
// `vi.hoisted` keeps the mock fn defined before the hoisted vi.mock factories run.
const { exchangeCodeForSession } = vi.hoisted(() => ({
  exchangeCodeForSession: vi.fn(),
}))

vi.mock('@capacitor/app', () => ({
  App: {
    getLaunchUrl: vi.fn(),
    addListener: vi.fn(),
  },
}))

vi.mock('@/lib/supabase', () => ({
  supabase: { auth: { exchangeCodeForSession } },
}))

import { App } from '@capacitor/app'
import { parseAuthDeepLink, handleAuthDeepLink, registerAuthDeepLinkListener } from './deep-link'

beforeEach(() => {
  exchangeCodeForSession.mockReset()
})

describe('parseAuthDeepLink', () => {
  it('ignores URLs that are not our custom scheme', () => {
    expect(parseAuthDeepLink('https://example.com/auth/callback?code=abc')).toEqual({
      kind: 'ignored',
    })
  })

  it('ignores our scheme without a query string', () => {
    expect(parseAuthDeepLink('com.zusammen.app://auth/callback')).toEqual({ kind: 'ignored' })
  })

  it('extracts a PKCE code', () => {
    expect(parseAuthDeepLink('com.zusammen.app://auth/callback?code=abc123')).toEqual({
      kind: 'code',
      code: 'abc123',
      isRecovery: false,
    })
  })

  it('flags a recovery link', () => {
    expect(
      parseAuthDeepLink('com.zusammen.app://auth/callback?code=abc123&type=recovery'),
    ).toEqual({ kind: 'code', code: 'abc123', isRecovery: true })
  })

  it('classifies an expired OTP error', () => {
    expect(
      parseAuthDeepLink(
        'com.zusammen.app://auth/callback?error=access_denied&error_code=otp_expired',
      ),
    ).toEqual({ kind: 'error', errorKind: 'expired' })
  })

  it('classifies an access_denied (already-used / cancelled) error', () => {
    expect(
      parseAuthDeepLink('com.zusammen.app://auth/callback?error=access_denied'),
    ).toEqual({ kind: 'error', errorKind: 'used' })
  })

  it('falls back to a generic error', () => {
    expect(
      parseAuthDeepLink('com.zusammen.app://auth/callback?error=server_error'),
    ).toEqual({ kind: 'error', errorKind: 'generic' })
  })
})

describe('handleAuthDeepLink', () => {
  it('exchanges the code and reports signed-in', async () => {
    exchangeCodeForSession.mockResolvedValue({ error: null })
    const result = await handleAuthDeepLink('com.zusammen.app://auth/callback?code=abc123')
    expect(exchangeCodeForSession).toHaveBeenCalledWith('abc123')
    expect(result).toEqual({ status: 'signed-in' })
  })

  it('reports recovery for a recovery link', async () => {
    exchangeCodeForSession.mockResolvedValue({ error: null })
    const result = await handleAuthDeepLink(
      'com.zusammen.app://auth/callback?code=abc123&type=recovery',
    )
    expect(result).toEqual({ status: 'recovery' })
  })

  it('does not call exchange for an ignored URL', async () => {
    const result = await handleAuthDeepLink('https://example.com/?code=abc')
    expect(exchangeCodeForSession).not.toHaveBeenCalled()
    expect(result).toEqual({ status: 'ignored' })
  })

  it('passes through a parsed error without exchanging', async () => {
    const result = await handleAuthDeepLink(
      'com.zusammen.app://auth/callback?error=access_denied&error_code=otp_expired',
    )
    expect(exchangeCodeForSession).not.toHaveBeenCalled()
    expect(result).toEqual({ status: 'error', kind: 'expired' })
  })

  it('maps a failed exchange to a generic error', async () => {
    exchangeCodeForSession.mockResolvedValue({ error: { message: 'bad code' } })
    const result = await handleAuthDeepLink('com.zusammen.app://auth/callback?code=bad')
    expect(result).toEqual({ status: 'error', kind: 'generic' })
  })

  it('maps a thrown exchange to a generic error', async () => {
    exchangeCodeForSession.mockRejectedValue(new Error('network'))
    const result = await handleAuthDeepLink('com.zusammen.app://auth/callback?code=bad')
    expect(result).toEqual({ status: 'error', kind: 'generic' })
  })
})

describe('registerAuthDeepLinkListener — cold-start launch URL', () => {
  const originalLocation = window.location

  beforeEach(() => {
    sessionStorage.clear()
    vi.mocked(App.addListener).mockResolvedValue({ remove: vi.fn() } as never)
    // navigateForResult assigns window.location.href; stub it so jsdom doesn't
    // attempt a real navigation.
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: { href: '' },
    })
  })

  afterEach(() => {
    Object.defineProperty(window, 'location', { configurable: true, value: originalLocation })
  })

  it('handles the launch URL on the first (cold-start) registration', async () => {
    exchangeCodeForSession.mockResolvedValue({ error: null })
    vi.mocked(App.getLaunchUrl).mockResolvedValue({ url: 'com.zusammen.app://auth/callback?code=abc' })

    await registerAuthDeepLinkListener()

    expect(exchangeCodeForSession).toHaveBeenCalledTimes(1)
    expect(window.location.href).toBe('/')
    expect(sessionStorage.getItem('zusammen.auth.launchUrlHandled')).toBe(
      'com.zusammen.app://auth/callback?code=abc',
    )
  })

  it('does NOT re-process the same launch URL after a full-page reload (no redirect loop)', async () => {
    exchangeCodeForSession.mockResolvedValue({ error: null })
    vi.mocked(App.getLaunchUrl).mockResolvedValue({ url: 'com.zusammen.app://auth/callback?code=abc' })

    // First mount (cold start) consumes the code and marks it handled.
    await registerAuthDeepLinkListener()
    // Second mount simulates the static-export full reload re-running startup.
    window.location.href = ''
    await registerAuthDeepLinkListener()

    // The code is exchanged exactly once; the reload does not navigate again.
    expect(exchangeCodeForSession).toHaveBeenCalledTimes(1)
    expect(window.location.href).toBe('')
  })

  it('does nothing when the app was not launched from a deep link', async () => {
    vi.mocked(App.getLaunchUrl).mockResolvedValue(null as never)

    await registerAuthDeepLinkListener()

    expect(exchangeCodeForSession).not.toHaveBeenCalled()
    expect(window.location.href).toBe('')
  })
})
