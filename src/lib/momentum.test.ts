import { describe, it, expect } from 'vitest'
import {
  MOMENTUM_LEVELS,
  MOMENTUM_MILESTONES,
  levelForCount,
  nextLevel,
  progressToNextLevel,
  progressLabel,
  pendingCelebrationMilestone,
  levelForMilestone,
} from './momentum'

describe('MOMENTUM_MILESTONES', () => {
  it('contains exactly the celebrated thresholds 5/10/25', () => {
    expect(MOMENTUM_MILESTONES).toEqual([5, 10, 25])
  })
})

describe('levelForCount', () => {
  it('returns "Neue Gruppe" for 0 completed activities', () => {
    expect(levelForCount(0).name).toBe('Neue Gruppe')
  })

  it('stays "Neue Gruppe" up to 4', () => {
    expect(levelForCount(4).name).toBe('Neue Gruppe')
  })

  it('reaches "Gruppe" exactly at 5', () => {
    expect(levelForCount(5).name).toBe('Gruppe')
  })

  it('reaches "Eingespielte Gruppe" at 10', () => {
    expect(levelForCount(10).name).toBe('Eingespielte Gruppe')
  })

  it('reaches "Legendäre Gruppe" at 25 and stays there for high counts', () => {
    expect(levelForCount(25).name).toBe('Legendäre Gruppe')
    expect(levelForCount(132).name).toBe('Legendäre Gruppe')
  })

  it('regresses when the count drops below a threshold (live count after delete)', () => {
    expect(levelForCount(5).name).toBe('Gruppe')
    expect(levelForCount(4).name).toBe('Neue Gruppe')
  })
})

describe('nextLevel / progress', () => {
  it('targets "Gruppe" from a fresh group', () => {
    expect(nextLevel(0)?.name).toBe('Gruppe')
  })

  it('has no next level at 25+', () => {
    expect(nextLevel(25)).toBeNull()
    expect(progressToNextLevel(25)).toBeNull()
    expect(progressLabel(25)).toBeNull()
  })

  it('computes percent within the current segment (7 of 5→10 = 40%)', () => {
    expect(progressToNextLevel(7)).toBe(40)
  })

  it('is 0% right after reaching a level', () => {
    expect(progressToNextLevel(5)).toBe(0)
  })

  it('renders the spec wording "Noch 5 bis Gruppe" at 0', () => {
    expect(progressLabel(0)).toBe('Noch 5 bis Gruppe')
  })

  it('renders "Noch 3 bis Eingespielte Gruppe" at 7', () => {
    expect(progressLabel(7)).toBe('Noch 3 bis Eingespielte Gruppe')
  })
})

describe('pendingCelebrationMilestone', () => {
  it('celebrates when the group milestone exceeds the seen value', () => {
    expect(pendingCelebrationMilestone(5, 0)).toBe(5)
  })

  it('celebrates only the highest missed milestone (5 and 10 missed → 10)', () => {
    expect(pendingCelebrationMilestone(10, 0)).toBe(10)
  })

  it('does not celebrate when already seen', () => {
    expect(pendingCelebrationMilestone(10, 10)).toBeNull()
  })

  it('does not celebrate the start state 0', () => {
    expect(pendingCelebrationMilestone(0, 0)).toBeNull()
  })

  it('never celebrates when seen is ahead (new member seeded to group value)', () => {
    expect(pendingCelebrationMilestone(10, 25)).toBeNull()
  })
})

describe('levelForMilestone', () => {
  it('maps milestones to their level', () => {
    expect(levelForMilestone(5)?.name).toBe('Gruppe')
    expect(levelForMilestone(25)?.name).toBe('Legendäre Gruppe')
  })

  it('returns null for the non-milestone start threshold and unknown values', () => {
    expect(levelForMilestone(0)).toBeNull()
    expect(levelForMilestone(7)).toBeNull()
  })
})

describe('MOMENTUM_LEVELS shape', () => {
  it('is ascending and has 4 levels', () => {
    expect(MOMENTUM_LEVELS).toHaveLength(4)
    const thresholds = MOMENTUM_LEVELS.map((l) => l.threshold)
    expect(thresholds).toEqual([...thresholds].sort((a, b) => a - b))
  })
})
