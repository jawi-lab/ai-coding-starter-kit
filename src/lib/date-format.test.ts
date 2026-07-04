import { describe, it, expect } from 'vitest'
import { formatGermanDate, formatGermanDateRange, formatRelativeGerman } from './date-format'

describe('formatGermanDate', () => {
  it('formats a date-only string in local time with a 2-digit year', () => {
    expect(formatGermanDate('2026-06-21', { dateOnly: true })).toBe('21.06.26')
  })

  it('formats a date-only string with a full year', () => {
    expect(formatGermanDate('2026-06-21', { dateOnly: true, year: 'numeric' })).toBe('21.06.2026')
  })

  it('formats a full ISO timestamp without shifting the day', () => {
    expect(formatGermanDate('2026-06-21T08:30:00Z')).toBe('21.06.26')
  })
})

describe('formatGermanDateRange', () => {
  it('returns null when both ends are missing', () => {
    expect(formatGermanDateRange(null, null)).toBeNull()
  })

  // Kanban / activity detail behaviour: "Ab " prefix, never collapses equal ends
  it('formats an open-ended range with a prefix', () => {
    expect(
      formatGermanDateRange('2026-06-21', null, { dateOnly: true, openEndedPrefix: 'Ab ' }),
    ).toBe('Ab 21.06.26')
  })

  it('keeps a full range even when start equals end (no collapse)', () => {
    expect(
      formatGermanDateRange('2026-06-21', '2026-06-21', { dateOnly: true, openEndedPrefix: 'Ab ' }),
    ).toBe('21.06.26 – 21.06.26')
  })

  // Archive behaviour: collapses equal ends, no prefix
  it('collapses an equal range to a single date when requested', () => {
    expect(
      formatGermanDateRange('2026-06-21', '2026-06-21', { collapseEqual: true }),
    ).toBe('21.06.26')
  })

  it('formats a distinct range', () => {
    expect(
      formatGermanDateRange('2026-06-21', '2026-06-23', { dateOnly: true }),
    ).toBe('21.06.26 – 23.06.26')
  })
})

describe('formatRelativeGerman', () => {
  const now = new Date('2026-07-04T12:00:00Z')

  it('shows "gerade eben" for very recent times', () => {
    expect(formatRelativeGerman('2026-07-04T11:59:30Z', now)).toBe('gerade eben')
  })

  it('shows minutes', () => {
    expect(formatRelativeGerman('2026-07-04T11:55:00Z', now)).toBe('vor 5 Min.')
  })

  it('shows hours', () => {
    expect(formatRelativeGerman('2026-07-04T09:00:00Z', now)).toBe('vor 3 Std.')
  })

  it('shows days', () => {
    expect(formatRelativeGerman('2026-07-02T12:00:00Z', now)).toBe('vor 2 Tg.')
  })

  it('falls back to a full date beyond a week', () => {
    expect(formatRelativeGerman('2026-06-01T12:00:00Z', now)).toBe('01.06.2026')
  })
})
