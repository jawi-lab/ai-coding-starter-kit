import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { WrappedSlide, slideChromeColor } from './WrappedSlide'
import type { WrappedSlide as Slide } from '@/lib/wrapped'

const people = [{ id: 'p1', name: 'Lina' }]

const SLIDES: Slide[] = [
  { type: 'intro', year: 2025, groupName: 'Gruppe' },
  { type: 'count', count: 3 },
  { type: 'top-month', monthIndex: 6, count: 2 },
  { type: 'top-activity', name: 'Wandern', votes: 4 },
  { type: 'votes', count: 11 },
  { type: 'momentum', levelName: 'Stufe', milestones: [] },
  { type: 'shoutout-ideas', people, count: 2 },
  { type: 'shoutout-votes', people, count: 5 },
  { type: 'outro', year: 2025, count: 3, voteCount: 11, groupName: 'Gruppe' },
]

describe('WrappedSlide Branding-Fuß', () => {
  describe.each(['view', 'share'] as const)('Variante %s', (variant) => {
    it.each(SLIDES.map((slide) => [slide.type, slide] as const))('%s zeigt das Jahr', (_type, slide) => {
      render(<WrappedSlide slide={slide} year={2025} variant={variant} />)
      expect(screen.getByText('MELLON RÜCKBLICK · 2025')).toBeInTheDocument()
    })
  })
})

describe('slideChromeColor', () => {
  it('nutzt auf hellen und goldenen Slides eine dunkle Balkenfarbe', () => {
    expect(slideChromeColor('count')).toBe('#221E19')
    expect(slideChromeColor('top-month')).toBe('#221E19')
    expect(slideChromeColor('top-activity')).toBe('#3A2118')
  })

  it('nutzt auf grünen Slides eine helle Balkenfarbe', () => {
    expect(slideChromeColor('intro')).toBe('#FBF8F3')
  })
})
