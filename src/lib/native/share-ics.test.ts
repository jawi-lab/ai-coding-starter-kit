import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock the native plugins so the bridge can be tested without the real Capacitor
// runtime. `vi.hoisted` keeps the mock fns defined before the hoisted factories run.
const { writeFile, share } = vi.hoisted(() => ({
  writeFile: vi.fn(),
  share: vi.fn(),
}))

vi.mock('@capacitor/filesystem', () => ({
  Filesystem: { writeFile },
  Directory: { Cache: 'CACHE' },
  Encoding: { UTF8: 'utf8' },
}))

vi.mock('@capacitor/share', () => ({
  Share: { share },
}))

import { shareIcsNative } from './share-ics'

const OPTS = {
  content: 'BEGIN:VCALENDAR\r\nEND:VCALENDAR',
  filename: 'Wandertag.ics',
  title: 'Wandertag',
}

beforeEach(() => {
  writeFile.mockReset().mockResolvedValue({ uri: 'file:///cache/Wandertag.ics' })
  share.mockReset().mockResolvedValue(undefined)
})

describe('shareIcsNative', () => {
  it('writes the .ics to the cache directory as UTF-8', async () => {
    await shareIcsNative(OPTS)
    expect(writeFile).toHaveBeenCalledWith({
      path: 'Wandertag.ics',
      data: OPTS.content,
      directory: 'CACHE',
      encoding: 'utf8',
    })
  })

  it('shares the written file URL via the native share sheet', async () => {
    await shareIcsNative(OPTS)
    expect(share).toHaveBeenCalledWith({
      title: 'Wandertag',
      url: 'file:///cache/Wandertag.ics',
      dialogTitle: 'Wandertag',
    })
  })

  it('writes before sharing', async () => {
    const order: string[] = []
    writeFile.mockImplementation(async () => {
      order.push('write')
      return { uri: 'file:///cache/Wandertag.ics' }
    })
    share.mockImplementation(async () => {
      order.push('share')
    })
    await shareIcsNative(OPTS)
    expect(order).toEqual(['write', 'share'])
  })

  it('swallows a cancelled / dismissed share (does not throw)', async () => {
    share.mockRejectedValue(new Error('Share canceled'))
    await expect(shareIcsNative(OPTS)).resolves.toBeUndefined()
  })

  it('propagates a filesystem write failure', async () => {
    writeFile.mockRejectedValue(new Error('disk full'))
    await expect(shareIcsNative(OPTS)).rejects.toThrow('disk full')
    expect(share).not.toHaveBeenCalled()
  })
})
