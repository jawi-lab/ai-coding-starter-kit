import { describe, it, expect, afterEach, vi } from 'vitest'
import {
  getAuthCallbackUrl,
  isNativePlatform,
  NATIVE_AUTH_CALLBACK_URL,
} from './auth-redirect'

afterEach(() => {
  // Remove any Capacitor global a test may have injected.
  delete (window as unknown as { Capacitor?: unknown }).Capacitor
  vi.unstubAllGlobals()
})

function stubCapacitor(isNative: boolean) {
  ;(window as unknown as { Capacitor?: unknown }).Capacitor = {
    isNativePlatform: () => isNative,
  }
}

describe('NATIVE_AUTH_CALLBACK_URL', () => {
  it('is the final com.zusammen.app deep link', () => {
    expect(NATIVE_AUTH_CALLBACK_URL).toBe('com.zusammen.app://auth/callback')
  })
})

describe('isNativePlatform', () => {
  it('returns false when no Capacitor global is present (web)', () => {
    expect(isNativePlatform()).toBe(false)
  })

  it('returns false when Capacitor reports a web platform', () => {
    stubCapacitor(false)
    expect(isNativePlatform()).toBe(false)
  })

  it('returns true inside the native Capacitor shell', () => {
    stubCapacitor(true)
    expect(isNativePlatform()).toBe(true)
  })
})

describe('getAuthCallbackUrl', () => {
  it('uses the current web origin on the web', () => {
    expect(getAuthCallbackUrl()).toBe(`${window.location.origin}/auth/callback`)
  })

  it('uses the native deep link inside the Capacitor shell', () => {
    stubCapacitor(true)
    expect(getAuthCallbackUrl()).toBe('com.zusammen.app://auth/callback')
  })
})
