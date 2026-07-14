import { describe, it, expect } from 'vitest'
import {
  BADGES,
  BADGE_TIERS,
  GOLD_THRESHOLD,
  badgeInfo,
  tierForCount,
  tierInfo,
  nextTier,
  progressToNextTier,
  progressLabel,
  pendingToastTier,
  hasUnseenTier,
} from './badges'

describe('BADGES', () => {
  it('contains the 4 roles in display order', () => {
    expect(BADGES.map((b) => b.key)).toEqual([
      'ideengeber',
      'entscheider',
      'planer',
      'immer_dabei',
    ])
  })

  it('resolves badge info by key', () => {
    expect(badgeInfo('planer').name).toBe('Planer')
    expect(badgeInfo('immer_dabei').icon).toBe('✅')
  })
})

describe('BADGE_TIERS', () => {
  it('contains exactly the spec thresholds 5/15/30', () => {
    expect(BADGE_TIERS.map((t) => t.threshold)).toEqual([5, 15, 30])
    expect(GOLD_THRESHOLD).toBe(30)
  })
})

describe('tierForCount (must match DB badge_tier_for)', () => {
  it('is 0 below Bronze', () => {
    expect(tierForCount(0)).toBe(0)
    expect(tierForCount(4)).toBe(0)
  })

  it('reaches Bronze exactly at 5', () => {
    expect(tierForCount(5)).toBe(5)
    expect(tierForCount(14)).toBe(5)
  })

  it('reaches Silber at 15 and Gold at 30', () => {
    expect(tierForCount(15)).toBe(15)
    expect(tierForCount(30)).toBe(30)
    expect(tierForCount(207)).toBe(30)
  })

  it('regresses with the live count (display only — earned tier stays in DB)', () => {
    expect(tierForCount(5)).toBe(5)
    expect(tierForCount(4)).toBe(0)
  })
})

describe('tierInfo', () => {
  it('maps thresholds to names', () => {
    expect(tierInfo(5)?.name).toBe('Bronze')
    expect(tierInfo(15)?.name).toBe('Silber')
    expect(tierInfo(30)?.name).toBe('Gold')
  })

  it('returns null for 0 and unknown values', () => {
    expect(tierInfo(0)).toBeNull()
    expect(tierInfo(7)).toBeNull()
  })
})

describe('nextTier / progress', () => {
  it('targets Bronze from a fresh account', () => {
    expect(nextTier(0)?.name).toBe('Bronze')
  })

  it('has no next tier at Gold (raw count instead of bar)', () => {
    expect(nextTier(30)).toBeNull()
    expect(progressToNextTier(30)).toBeNull()
    expect(progressLabel(30)).toBeNull()
  })

  it('computes percent within the current segment (10 of 5→15 = 50%)', () => {
    expect(progressToNextTier(10)).toBe(50)
  })

  it('is 0% right after reaching a tier', () => {
    expect(progressToNextTier(5)).toBe(0)
    expect(progressToNextTier(15)).toBe(0)
  })

  it('renders the spec wording "Noch 5 bis Bronze" at 0', () => {
    expect(progressLabel(0)).toBe('Noch 5 bis Bronze')
  })

  it('renders "Noch 1 bis Bronze" at 4 (AC: toast on the fifth action)', () => {
    expect(progressLabel(4)).toBe('Noch 1 bis Bronze')
  })

  it('targets Silber just below 15 and Gold just above', () => {
    expect(progressLabel(14)).toBe('Noch 1 bis Silber')
    expect(progressLabel(16)).toBe('Noch 14 bis Gold')
  })
})

describe('pendingToastTier', () => {
  it('toasts when the earned tier rises (4 → 5 actions crosses Bronze)', () => {
    expect(pendingToastTier(0, 5)).toBe(5)
  })

  it('toasts only the highest tier when several are skipped (backfill straggler)', () => {
    expect(pendingToastTier(0, 15)).toBe(15)
  })

  it('does not toast when the tier did not change (action 6 of 15)', () => {
    expect(pendingToastTier(5, 5)).toBeNull()
  })

  it('does not toast on re-crossing after deletions (monotone earned tier)', () => {
    // Zähler fiel unter 5 und stieg wieder — earned blieb 5, kein neuer Toast.
    expect(pendingToastTier(5, 5)).toBeNull()
  })

  it('never toasts a lower or invalid value', () => {
    expect(pendingToastTier(15, 5)).toBeNull()
    expect(pendingToastTier(0, 0)).toBeNull()
  })
})

describe('hasUnseenTier', () => {
  it('highlights when earned exceeds seen', () => {
    expect(hasUnseenTier(5, 0)).toBe(true)
  })

  it('does not highlight when seen is up to date (backfill: seen = earned)', () => {
    expect(hasUnseenTier(15, 15)).toBe(false)
    expect(hasUnseenTier(0, 0)).toBe(false)
  })
})
