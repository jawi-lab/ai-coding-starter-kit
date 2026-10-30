import { describe, it, expect, vi } from 'vitest'
import {
  commentImagePathFromSrc,
  ownedCommentImagePaths,
  toStoredCommentContent,
} from './comment-images'

vi.mock('./supabase', () => ({ supabase: {} }))

const BASE = 'https://proj.supabase.co'
const OBJECT = 'act/user/f.png'
const PUBLIC_URL = `${BASE}/storage/v1/object/public/activity-comment-images/${OBJECT}`
const SIGNED_URL = `${BASE}/storage/v1/object/sign/activity-comment-images/${OBJECT}?token=abc`

describe('commentImagePathFromSrc', () => {
  it('understands stored, legacy public and signed sources', () => {
    expect(commentImagePathFromSrc(`storage://activity-comment-images/${OBJECT}`, BASE)).toBe(OBJECT)
    expect(commentImagePathFromSrc(PUBLIC_URL, BASE)).toBe(OBJECT)
    expect(commentImagePathFromSrc(SIGNED_URL, BASE)).toBe(OBJECT)
  })

  it('rejects foreign hosts, other buckets and traversal', () => {
    expect(commentImagePathFromSrc('https://evil.example/x.png', BASE)).toBeNull()
    expect(commentImagePathFromSrc(`${BASE}/storage/v1/object/public/activity-photos/${OBJECT}`, BASE)).toBeNull()
    expect(commentImagePathFromSrc(`storage://activity-comment-images/act/../x.png`, BASE)).toBeNull()
  })
})

describe('toStoredCommentContent', () => {
  it('stores signed editor URLs as paths without touching other nodes', () => {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', BASE)
    const stored = toStoredCommentContent({
      type: 'doc',
      content: [
        { type: 'paragraph', content: [{ type: 'text', text: 'hi' }] },
        { type: 'image', attrs: { src: SIGNED_URL } },
      ],
    })
    expect(stored.content?.[0]).toEqual({ type: 'paragraph', content: [{ type: 'text', text: 'hi' }] })
    expect(stored.content?.[1].attrs?.src).toBe(`storage://activity-comment-images/${OBJECT}`)
    vi.unstubAllEnvs()
  })
})

describe('ownedCommentImagePaths', () => {
  it('keeps only images in the author folder of this activity', () => {
    const content = {
      type: 'doc',
      content: [
        { type: 'image', attrs: { src: `storage://activity-comment-images/${OBJECT}` } },
        { type: 'image', attrs: { src: 'storage://activity-comment-images/act/victim/v.png' } },
        { type: 'image', attrs: { src: 'storage://activity-comment-images/other/user/v.png' } },
        { type: 'image', attrs: { src: 'https://evil.example/x.png' } },
      ],
    }
    expect(ownedCommentImagePaths(content, 'act', 'user')).toEqual([OBJECT])
  })
})
