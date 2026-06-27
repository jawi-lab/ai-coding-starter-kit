import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock @capacitor/camera so the bridge can be tested without the real runtime.
// `vi.hoisted` keeps the mock fn defined before the hoisted factory runs.
const { getPhoto } = vi.hoisted(() => ({ getPhoto: vi.fn() }))

vi.mock('@capacitor/camera', () => ({
  Camera: { getPhoto },
  CameraResultType: { Uri: 'uri' },
  CameraSource: { Prompt: 'PROMPT' },
}))

import { pickAvatarPhoto, classifyCameraError } from './camera'

beforeEach(() => {
  getPhoto.mockReset()
  // jsdom lacks fetch — stub it to return a blob for the photo's webPath.
  vi.stubGlobal(
    'fetch',
    vi.fn(async () => ({ blob: async () => new Blob(['img'], { type: 'image/jpeg' }) })),
  )
})

describe('classifyCameraError', () => {
  it('detects a user cancellation', () => {
    expect(classifyCameraError(new Error('User cancelled photos app'))).toBe('cancelled')
  })

  it('detects a permission denial', () => {
    expect(classifyCameraError(new Error('User denied access to camera'))).toBe('denied')
    expect(classifyCameraError(new Error('No access to photos'))).toBe('denied')
  })

  it('treats unknown errors as other', () => {
    expect(classifyCameraError(new Error('something broke'))).toBe('other')
    expect(classifyCameraError('weird')).toBe('other')
  })
})

describe('pickAvatarPhoto', () => {
  it('prompts for camera or library and returns the image as a File', async () => {
    getPhoto.mockResolvedValue({ webPath: 'blob:abc', format: 'jpeg' })
    const result = await pickAvatarPhoto()

    expect(getPhoto).toHaveBeenCalledWith(
      expect.objectContaining({ source: 'PROMPT', resultType: 'uri' }),
    )
    expect(result.status).toBe('picked')
    if (result.status !== 'picked') throw new Error('expected picked')
    expect(result.file).toBeInstanceOf(File)
    expect(result.file.name).toBe('avatar.jpg')
    expect(result.file.type).toBe('image/jpeg')
  })

  it('returns cancelled when the user dismisses the picker', async () => {
    getPhoto.mockRejectedValue(new Error('User cancelled photos app'))
    expect(await pickAvatarPhoto()).toEqual({ status: 'cancelled' })
  })

  it('returns denied when permission is refused', async () => {
    getPhoto.mockRejectedValue(new Error('User denied access to camera'))
    expect(await pickAvatarPhoto()).toEqual({ status: 'denied' })
  })

  it('re-throws an unexpected failure', async () => {
    getPhoto.mockRejectedValue(new Error('hardware exploded'))
    await expect(pickAvatarPhoto()).rejects.toThrow('hardware exploded')
  })
})
