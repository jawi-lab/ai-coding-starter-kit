import { describe, it, expect } from 'vitest'
import { signUserId, verifyUserId } from './unsubscribe'

// PROJ-12: the login-free List-Unsubscribe token is the only authority the
// unsubscribe endpoint has. Its security property — a token is valid ONLY for the
// exact (user, secret) it was minted from, and can't be forged or reused across
// users — is what these tests pin down. Uses Web Crypto (globalThis.crypto), the
// same primitive the Deno edge function runs on.

const SECRET = 'test-signing-secret-with-enough-entropy'
const USER_A = '11111111-1111-1111-1111-111111111111'
const USER_B = '22222222-2222-2222-2222-222222222222'

describe('signUserId', () => {
  it('is deterministic for the same user + secret', async () => {
    const a = await signUserId(USER_A, SECRET)
    const b = await signUserId(USER_A, SECRET)
    expect(a).toBe(b)
  })

  it('produces a lowercase hex SHA-256 signature (64 chars)', async () => {
    const sig = await signUserId(USER_A, SECRET)
    expect(sig).toMatch(/^[0-9a-f]{64}$/)
  })

  it('yields different signatures for different users', async () => {
    expect(await signUserId(USER_A, SECRET)).not.toBe(await signUserId(USER_B, SECRET))
  })

  it('yields different signatures for different secrets (secret actually keys it)', async () => {
    expect(await signUserId(USER_A, SECRET)).not.toBe(await signUserId(USER_A, 'a-different-secret'))
  })
})

describe('verifyUserId', () => {
  it('accepts a token it just signed', async () => {
    const token = await signUserId(USER_A, SECRET)
    expect(await verifyUserId(USER_A, token, SECRET)).toBe(true)
  })

  it('rejects a tampered token', async () => {
    const token = await signUserId(USER_A, SECRET)
    const tampered = token.slice(0, -1) + (token.endsWith('a') ? 'b' : 'a')
    expect(await verifyUserId(USER_A, tampered, SECRET)).toBe(false)
  })

  it("rejects user A's token when presented for user B (no cross-user forgery)", async () => {
    const tokenForA = await signUserId(USER_A, SECRET)
    expect(await verifyUserId(USER_B, tokenForA, SECRET)).toBe(false)
  })

  it('rejects a token signed with a different secret', async () => {
    const tokenOtherSecret = await signUserId(USER_A, 'attacker-guessed-secret')
    expect(await verifyUserId(USER_A, tokenOtherSecret, SECRET)).toBe(false)
  })

  it('rejects empty uid or token without throwing', async () => {
    expect(await verifyUserId('', await signUserId(USER_A, SECRET), SECRET)).toBe(false)
    expect(await verifyUserId(USER_A, '', SECRET)).toBe(false)
  })

  it('rejects a token of the wrong length (constant-time length guard)', async () => {
    expect(await verifyUserId(USER_A, 'deadbeef', SECRET)).toBe(false)
  })
})
