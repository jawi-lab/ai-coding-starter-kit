import { describe, it, expect } from 'vitest'
import { MEMORY_ACCENTS, memoryAccent, memoryCardDate, isCardNew } from './memory-card'

describe('memoryAccent', () => {
  it('maps each duration category to its accent', () => {
    expect(memoryAccent('spontan')).toBe(MEMORY_ACCENTS.spontan)
    expect(memoryAccent('wochenende')).toBe(MEMORY_ACCENTS.wochenende)
    expect(memoryAccent('laengerer_zeitraum')).toBe(MEMORY_ACCENTS.laengerer_zeitraum)
  })

  it('falls back to blush for unknown values', () => {
    expect(memoryAccent('kaputt')).toBe(MEMORY_ACCENTS.spontan)
  })
})

describe('memoryCardDate', () => {
  const base = {
    start_date: null as string | null,
    end_date: null as string | null,
    completed_at: null as string | null,
    created_at: '2026-01-10T12:00:00+00:00',
  }

  it('prefers the scheduled date over the completion date', () => {
    const label = memoryCardDate({
      ...base,
      start_date: '2026-05-02',
      end_date: '2026-05-02',
      completed_at: '2026-05-04T10:00:00+00:00',
    })
    expect(label).toBe('02.05.26')
  })

  it('renders a range when start and end differ', () => {
    const label = memoryCardDate({
      ...base,
      start_date: '2026-05-02',
      end_date: '2026-05-04',
    })
    expect(label).toBe('02.05.26 – 04.05.26')
  })

  it('falls back to completed_at without a scheduled date', () => {
    const label = memoryCardDate({ ...base, completed_at: '2026-03-15T18:30:00+00:00' })
    expect(label).toBe(new Date('2026-03-15T18:30:00+00:00').toLocaleDateString('de-DE', {
      day: '2-digit', month: '2-digit', year: '2-digit',
    }))
  })

  it('falls back to created_at when completed_at is missing (defensive)', () => {
    const label = memoryCardDate(base)
    expect(label).toBe(new Date(base.created_at).toLocaleDateString('de-DE', {
      day: '2-digit', month: '2-digit', year: '2-digit',
    }))
  })
})

describe('isCardNew', () => {
  const seen = '2026-07-10T08:00:00+00:00'

  it('is new when completed after the last album visit', () => {
    expect(isCardNew('2026-07-11T09:00:00+00:00', seen)).toBe(true)
  })

  it('is not new when completed before the last album visit (backfill case)', () => {
    expect(isCardNew('2026-07-01T09:00:00+00:00', seen)).toBe(false)
  })

  it('is never new without a completion or last-seen timestamp', () => {
    expect(isCardNew(null, seen)).toBe(false)
    expect(isCardNew('2026-07-11T09:00:00+00:00', null)).toBe(false)
    expect(isCardNew('2026-07-11T09:00:00+00:00', undefined)).toBe(false)
  })
})
