import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// Mock the native + supabase modules so the pure parser/navigator can be tested
// without loading the real Firebase bridge or a Supabase client.
vi.mock('@capacitor-firebase/messaging', () => ({
  FirebaseMessaging: {
    checkPermissions: vi.fn(),
    requestPermissions: vi.fn(),
    getToken: vi.fn(),
    deleteToken: vi.fn(),
    addListener: vi.fn(),
  },
}))

vi.mock('sonner', () => ({ toast: vi.fn() }))

vi.mock('@/lib/supabase', () => ({ supabase: {} }))

vi.mock('./platform', () => ({
  isNativePlatform: vi.fn(() => false),
  getPlatform: vi.fn(() => 'web'),
}))

import { parsePushTarget, pushTargetToPath, navigateToPushTarget } from './push'

describe('parsePushTarget', () => {
  it('returns null for non-object payloads', () => {
    expect(parsePushTarget(null)).toBeNull()
    expect(parsePushTarget('foo')).toBeNull()
    expect(parsePushTarget(undefined)).toBeNull()
  })

  it('returns null when there is no group id', () => {
    expect(parsePushTarget({ activity_id: 'a1' })).toBeNull()
  })

  it('parses a group-only target (snake_case)', () => {
    expect(parsePushTarget({ group_id: 'g1' })).toEqual({ groupId: 'g1' })
  })

  it('accepts camelCase keys', () => {
    expect(parsePushTarget({ groupId: 'g1', activityId: 'a1' })).toEqual({
      groupId: 'g1',
      activityId: 'a1',
    })
  })

  it('parses an activity target', () => {
    expect(parsePushTarget({ group_id: 'g1', activity_id: 'a1' })).toEqual({
      groupId: 'g1',
      activityId: 'a1',
    })
  })

  it('keeps a valid tab and drops an invalid one', () => {
    expect(parsePushTarget({ group_id: 'g1', tab: 'planung' })).toEqual({
      groupId: 'g1',
      tab: 'planung',
    })
    expect(parsePushTarget({ group_id: 'g1', tab: 'bogus' })).toEqual({ groupId: 'g1' })
  })
})

describe('pushTargetToPath', () => {
  it('builds a group path with a trailing slash before the query', () => {
    expect(pushTargetToPath({ groupId: 'g1' })).toBe('/groups/view/?id=g1')
  })

  it('includes the activity param so the detail sheet opens on arrival', () => {
    expect(pushTargetToPath({ groupId: 'g1', activityId: 'a1' })).toBe(
      '/groups/view/?id=g1&activity=a1',
    )
  })

  it('includes the tab when present', () => {
    expect(pushTargetToPath({ groupId: 'g1', tab: 'termine' })).toBe(
      '/groups/view/?id=g1&tab=termine',
    )
  })

  it('url-encodes the group id', () => {
    expect(pushTargetToPath({ groupId: 'a b' })).toBe('/groups/view/?id=a+b')
  })
})

describe('navigateToPushTarget', () => {
  const originalLocation = window.location

  beforeEach(() => {
    Object.defineProperty(window, 'location', { configurable: true, value: { href: '' } })
  })

  afterEach(() => {
    Object.defineProperty(window, 'location', { configurable: true, value: originalLocation })
  })

  it('navigates to the parsed target', () => {
    navigateToPushTarget({ group_id: 'g1', activity_id: 'a1' })
    expect(window.location.href).toBe('/groups/view/?id=g1&activity=a1')
  })

  it('does nothing for a payload without a group', () => {
    navigateToPushTarget({ foo: 'bar' })
    expect(window.location.href).toBe('')
  })
})
