import { describe, it, expect, vi, beforeEach } from 'vitest'

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

import { parseAuthDeepLink, handleAuthDeepLink } from './deep-link'

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
