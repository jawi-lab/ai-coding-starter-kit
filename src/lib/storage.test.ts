import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getSignedUrl, getSignedUrls, isOwnedMediaPath } from './storage'

const { mockCreateSignedUrl, mockCreateSignedUrls } = vi.hoisted(() => ({
  mockCreateSignedUrl: vi.fn(),
  mockCreateSignedUrls: vi.fn(),
}))

vi.mock('./supabase', () => ({
  supabase: {
    storage: {
      from: () => ({
        createSignedUrl: mockCreateSignedUrl,
        createSignedUrls: mockCreateSignedUrls,
      }),
    },
  },
}))

beforeEach(() => vi.clearAllMocks())

describe('getSignedUrl', () => {
  it('returns the signed URL', async () => {
    mockCreateSignedUrl.mockResolvedValue({ data: { signedUrl: 'https://x/sign' }, error: null })
    expect(await getSignedUrl('b', 'p')).toBe('https://x/sign')
  })

  it('returns null when signing is refused', async () => {
    mockCreateSignedUrl.mockResolvedValue({ data: null, error: { message: 'denied' } })
    expect(await getSignedUrl('b', 'p')).toBeNull()
  })
})

describe('getSignedUrls', () => {
  it('does not call storage without paths', async () => {
    expect(await getSignedUrls('b', [])).toEqual({})
    expect(mockCreateSignedUrls).not.toHaveBeenCalled()
  })

  it('maps paths to URLs and leaves out refused paths', async () => {
    mockCreateSignedUrls.mockResolvedValue({
      data: [
        { path: 'a', signedUrl: 'https://x/a', error: null },
        { path: 'b', signedUrl: '', error: 'denied' },
      ],
      error: null,
    })
    expect(await getSignedUrls('bucket', ['a', 'b'])).toEqual({ a: 'https://x/a' })
  })
})

describe('isOwnedMediaPath', () => {
  it('accepts a file in the author folder', () => {
    expect(isOwnedMediaPath('act/user/f.png', 'act', 'user')).toBe(true)
  })

  it('rejects another member, another activity and traversal', () => {
    expect(isOwnedMediaPath('act/victim/f.png', 'act', 'user')).toBe(false)
    expect(isOwnedMediaPath('other/user/f.png', 'act', 'user')).toBe(false)
    expect(isOwnedMediaPath('act/user/../victim/f.png', 'act', 'user')).toBe(false)
  })
})
