import { describe, it, expect } from 'vitest'
import {
  MIN_COMPLETED_FOR_WRAPPED,
  monthNameDe,
  wrappedYearForActivity,
  wrappedMonthForActivity,
  isWrappedSeason,
  availableWrappedYears,
  isCurrentYearWrappedLive,
  buildWrappedSlides,
  type WrappedActivity,
  type WrappedVote,
  type BuildWrappedInput,
} from './wrapped'

// Helper: a completed activity dated by start_date only.
function act(overrides: Partial<WrappedActivity> = {}): WrappedActivity {
  return {
    id: Math.random().toString(36).slice(2),
    name: 'Aktivität',
    current_votes: 0,
    initiator_id: 'u1',
    status: 'abgeschlossen',
    start_date: '2026-06-15',
    completed_at: null,
    created_at: '2026-06-01T10:00:00Z',
    ...overrides,
  }
}

describe('wrappedYearForActivity (Fallback-Kette)', () => {
  it('uses start_date when present', () => {
    expect(wrappedYearForActivity({ start_date: '2025-03-01', completed_at: '2026-01-01T00:00:00Z', created_at: '2026-01-01T00:00:00Z' })).toBe(2025)
  })

  it('falls back to completed_at without start_date', () => {
    expect(wrappedYearForActivity({ start_date: null, completed_at: '2026-11-30T23:00:00Z', created_at: '2027-01-05T00:00:00Z' })).toBe(2026)
  })

  it('falls back to created_at without start_date or completed_at', () => {
    expect(wrappedYearForActivity({ start_date: null, completed_at: null, created_at: '2024-08-08T00:00:00Z' })).toBe(2024)
  })

  it('parses date-only start_date in local time (no UTC off-by-one)', () => {
    // A bare YYYY-MM-DD must not shift the year regardless of local offset.
    expect(wrappedYearForActivity({ start_date: '2026-01-01', completed_at: null, created_at: '2026-01-01T00:00:00Z' })).toBe(2026)
  })
})

describe('wrappedMonthForActivity', () => {
  it('returns 0-indexed month from the reference date', () => {
    expect(wrappedMonthForActivity(act({ start_date: '2026-07-11' }))).toBe(6)
  })
})

describe('monthNameDe', () => {
  it('maps indices to German month names', () => {
    expect(monthNameDe(0)).toBe('Januar')
    expect(monthNameDe(11)).toBe('Dezember')
  })
})

describe('isWrappedSeason', () => {
  it('is true only in December', () => {
    expect(isWrappedSeason(new Date(2026, 11, 1))).toBe(true)
    expect(isWrappedSeason(new Date(2026, 11, 31))).toBe(true)
    expect(isWrappedSeason(new Date(2026, 10, 30))).toBe(false)
    expect(isWrappedSeason(new Date(2027, 0, 1))).toBe(false)
  })
})

describe('availableWrappedYears', () => {
  const dec = new Date(2026, 11, 15)
  const nov = new Date(2026, 10, 15)
  const jan = new Date(2027, 0, 10)

  it('lists past years with >= 3 completions regardless of season', () => {
    const completed = [
      act({ start_date: '2025-02-01' }),
      act({ start_date: '2025-05-01' }),
      act({ start_date: '2025-09-01' }),
    ]
    expect(availableWrappedYears(completed, nov)).toEqual([2025])
    expect(availableWrappedYears(completed, jan)).toEqual([2025])
  })

  it('excludes years below the threshold', () => {
    const completed = [act({ start_date: '2024-02-01' }), act({ start_date: '2024-05-01' })]
    expect(availableWrappedYears(completed, dec)).toEqual([])
  })

  it('includes the current year only in December', () => {
    const completed = [
      act({ start_date: '2026-02-01' }),
      act({ start_date: '2026-05-01' }),
      act({ start_date: '2026-09-01' }),
    ]
    expect(availableWrappedYears(completed, nov)).toEqual([])
    expect(availableWrappedYears(completed, dec)).toEqual([2026])
  })

  it('sorts newest first', () => {
    const completed = [
      ...Array(3).fill(0).map(() => act({ start_date: '2024-03-01' })),
      ...Array(3).fill(0).map(() => act({ start_date: '2025-03-01' })),
    ]
    expect(availableWrappedYears(completed, jan)).toEqual([2025, 2024])
  })
})

describe('isCurrentYearWrappedLive', () => {
  it('is false outside December even with enough activities', () => {
    const completed = Array(5).fill(0).map(() => act({ start_date: '2026-06-01' }))
    expect(isCurrentYearWrappedLive(completed, new Date(2026, 10, 30))).toBe(false)
  })

  it('is true in December at the threshold', () => {
    const completed = Array(MIN_COMPLETED_FOR_WRAPPED).fill(0).map(() => act({ start_date: '2026-06-01' }))
    expect(isCurrentYearWrappedLive(completed, new Date(2026, 11, 1))).toBe(true)
  })

  it('is false below the threshold', () => {
    const completed = Array(2).fill(0).map(() => act({ start_date: '2026-06-01' }))
    expect(isCurrentYearWrappedLive(completed, new Date(2026, 11, 1))).toBe(false)
  })
})

// --- Slide building ---------------------------------------------------------

function input(overrides: Partial<BuildWrappedInput> = {}): BuildWrappedInput {
  return {
    year: 2026,
    groupName: 'Die Crew',
    activities: [],
    votes: [],
    memberIds: new Set(['u1', 'u2', 'u3']),
    nameById: new Map([['u1', 'Anna'], ['u2', 'Ben'], ['u3', 'Cem']]),
    momentumCount: 4,
    ...overrides,
  }
}

function slideTypes(slides: ReturnType<typeof buildWrappedSlides>) {
  return slides.map((s) => s.type)
}

describe('buildWrappedSlides — always-on slides', () => {
  it('always emits intro, count and outro', () => {
    const slides = buildWrappedSlides(input({
      activities: [act(), act(), act()],
    }))
    expect(slideTypes(slides)).toEqual(
      expect.arrayContaining(['intro', 'count', 'outro']),
    )
    expect(slides[0].type).toBe('intro')
    expect(slides[slides.length - 1].type).toBe('outro')
  })

  it('count only tallies completed activities of the wrapped year', () => {
    const slides = buildWrappedSlides(input({
      activities: [
        act({ start_date: '2026-01-01' }),
        act({ start_date: '2026-02-01' }),
        act({ start_date: '2025-02-01' }), // other year
        act({ start_date: '2026-03-01', status: 'zu_planen' }), // not completed
      ],
    }))
    const count = slides.find((s) => s.type === 'count')
    expect(count).toMatchObject({ type: 'count', count: 2 })
  })
})

describe('buildWrappedSlides — top month (tie → earlier month)', () => {
  it('picks the earlier month on a tie', () => {
    const slides = buildWrappedSlides(input({
      activities: [
        act({ start_date: '2026-03-01' }),
        act({ start_date: '2026-07-01' }),
      ],
    }))
    const m = slides.find((s) => s.type === 'top-month')
    expect(m).toMatchObject({ type: 'top-month', monthIndex: 2, count: 1 })
  })
})

describe('buildWrappedSlides — top activity', () => {
  it('picks the most-voted, earlier one on a tie, and skips when no votes', () => {
    const withVotes = buildWrappedSlides(input({
      activities: [
        act({ name: 'Später', current_votes: 5, start_date: '2026-09-01' }),
        act({ name: 'Früher', current_votes: 5, start_date: '2026-03-01' }),
      ],
    }))
    expect(withVotes.find((s) => s.type === 'top-activity')).toMatchObject({ name: 'Früher', votes: 5 })

    const noVotes = buildWrappedSlides(input({
      activities: [act({ current_votes: 0 }), act({ current_votes: 0 }), act({ current_votes: 0 })],
    }))
    expect(slideTypes(noVotes)).not.toContain('top-activity')
  })
})

describe('buildWrappedSlides — votes slide', () => {
  it('counts only votes cast in the wrapped year, skips at zero', () => {
    const votes: WrappedVote[] = [
      { user_id: 'u1', created_at: '2026-04-01T00:00:00Z' },
      { user_id: 'u2', created_at: '2026-05-01T00:00:00Z' },
      { user_id: 'u1', created_at: '2025-05-01T00:00:00Z' }, // other year
    ]
    const slides = buildWrappedSlides(input({ activities: [act()], votes }))
    expect(slides.find((s) => s.type === 'votes')).toMatchObject({ type: 'votes', count: 2 })

    const none = buildWrappedSlides(input({ activities: [act()], votes: [] }))
    expect(slideTypes(none)).not.toContain('votes')
  })
})

describe('buildWrappedSlides — momentum', () => {
  it('names the current level and milestones crossed this year', () => {
    // 4 completed before 2026, 7 completed in 2026 → total 11 crosses 5 and 10.
    const activities = [
      ...Array(4).fill(0).map(() => act({ start_date: '2025-06-01' })),
      ...Array(7).fill(0).map(() => act({ start_date: '2026-06-01' })),
    ]
    const slides = buildWrappedSlides(input({ activities, momentumCount: 11 }))
    expect(slides.find((s) => s.type === 'momentum')).toMatchObject({
      type: 'momentum',
      levelName: 'Eingespielte Gruppe',
      milestones: [5, 10],
    })
  })

  it('is skipped when momentum data is missing', () => {
    const slides = buildWrappedSlides(input({ activities: [act()], momentumCount: null }))
    expect(slideTypes(slides)).not.toContain('momentum')
  })
})

describe('buildWrappedSlides — shout-outs', () => {
  it('honours the top idea-giver with their own count only', () => {
    const activities = [
      act({ initiator_id: 'u1' }),
      act({ initiator_id: 'u1' }),
      act({ initiator_id: 'u2' }),
    ]
    const slides = buildWrappedSlides(input({ activities }))
    const s = slides.find((s) => s.type === 'shoutout-ideas')
    expect(s).toMatchObject({ type: 'shoutout-ideas', count: 2 })
    expect(s && 'people' in s && s.people).toEqual([{ id: 'u1', name: 'Anna' }])
  })

  it('honours up to 3 tied people together', () => {
    const activities = [
      act({ initiator_id: 'u1' }),
      act({ initiator_id: 'u2' }),
      act({ initiator_id: 'u3' }),
    ]
    const s = buildWrappedSlides(input({ activities })).find((s) => s.type === 'shoutout-ideas')
    expect(s && 'people' in s && s.people.map((p) => p.id).sort()).toEqual(['u1', 'u2', 'u3'])
  })

  it('drops the slide when more than 3 are tied', () => {
    const members = new Set(['u1', 'u2', 'u3', 'u4'])
    const nameById = new Map([['u1', 'A'], ['u2', 'B'], ['u3', 'C'], ['u4', 'D']])
    const activities = ['u1', 'u2', 'u3', 'u4'].map((id) => act({ initiator_id: id }))
    const s = buildWrappedSlides(input({ activities, memberIds: members, nameById }))
    expect(slideTypes(s)).not.toContain('shoutout-ideas')
  })

  it('falls through to the next tier when the whole top tier has left the group', () => {
    // u9 (former member) has 3 ideas, u1 (current) has 2 → u1 is honoured.
    const activities = [
      act({ initiator_id: 'u9' }),
      act({ initiator_id: 'u9' }),
      act({ initiator_id: 'u9' }),
      act({ initiator_id: 'u1' }),
      act({ initiator_id: 'u1' }),
    ]
    const s = buildWrappedSlides(input({ activities })).find((s) => s.type === 'shoutout-ideas')
    expect(s).toMatchObject({ type: 'shoutout-ideas', count: 2 })
    expect(s && 'people' in s && s.people).toEqual([{ id: 'u1', name: 'Anna' }])
  })

  it('drops the slide when no honouree remains in the group', () => {
    const activities = [act({ initiator_id: 'u9' }), act({ initiator_id: 'u9' })]
    const s = buildWrappedSlides(input({ activities }))
    expect(slideTypes(s)).not.toContain('shoutout-ideas')
  })
})
