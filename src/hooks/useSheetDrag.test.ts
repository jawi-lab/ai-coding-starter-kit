import { describe, expect, it } from 'vitest'
import { projectMomentum, rubberband, shouldDismiss } from './useSheetDrag'

describe('projectMomentum', () => {
  it('projects a flick forward along its direction', () => {
    expect(projectMomentum(1000)).toBeCloseTo(499)
    expect(projectMomentum(-1000)).toBeCloseTo(-499)
    expect(projectMomentum(0)).toBe(0)
  })
})

describe('rubberband', () => {
  it('follows less the further the sheet is pulled past the bound', () => {
    const near = rubberband(50, 600)
    const far = rubberband(500, 600)
    expect(near).toBeLessThan(50)
    expect(far / 500).toBeLessThan(near / 50)
  })

  it('never exceeds the sheet dimension', () => {
    expect(rubberband(100000, 600)).toBeLessThan(600)
  })
})

describe('shouldDismiss', () => {
  it('dismisses a short drag when it was flicked downward', () => {
    expect(shouldDismiss(100, 800, 600)).toBe(true)
  })

  it('keeps a short slow drag open', () => {
    expect(shouldDismiss(100, 50, 600)).toBe(false)
  })

  it('keeps a long drag open when it is flicked back up', () => {
    expect(shouldDismiss(400, -800, 600)).toBe(false)
  })

  it('dismisses a long slow drag past the middle', () => {
    expect(shouldDismiss(400, 0, 600)).toBe(true)
  })
})
