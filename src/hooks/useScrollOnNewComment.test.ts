import { describe, it, expect, vi } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useScrollOnNewComment } from './useScrollOnNewComment'

function setup(initial: { loaded: boolean; count: number }) {
  const scrollIntoView = vi.fn()
  const endRef = { current: { scrollIntoView } as unknown as HTMLElement }
  const { rerender } = renderHook(
    ({ loaded, count }) => useScrollOnNewComment(loaded, count, endRef),
    { initialProps: initial }
  )
  return { scrollIntoView, rerender }
}

describe('useScrollOnNewComment', () => {
  it('scrollt nicht beim ersten Laden', () => {
    const { scrollIntoView, rerender } = setup({ loaded: false, count: 0 })
    rerender({ loaded: true, count: 4 })
    expect(scrollIntoView).not.toHaveBeenCalled()
  })

  it('scrollt bei einem neu hinzugekommenen Kommentar', () => {
    const { scrollIntoView, rerender } = setup({ loaded: false, count: 0 })
    rerender({ loaded: true, count: 4 })
    rerender({ loaded: true, count: 5 })
    expect(scrollIntoView).toHaveBeenCalledTimes(1)
    expect(scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth' })
  })

  it('scrollt beim ersten Kommentar einer leeren Aktivität', () => {
    const { scrollIntoView, rerender } = setup({ loaded: true, count: 0 })
    rerender({ loaded: true, count: 1 })
    expect(scrollIntoView).toHaveBeenCalledTimes(1)
  })

  it('scrollt nicht beim Löschen eines Kommentars', () => {
    const { scrollIntoView, rerender } = setup({ loaded: true, count: 4 })
    rerender({ loaded: true, count: 3 })
    expect(scrollIntoView).not.toHaveBeenCalled()
  })

  it('scrollt nicht, wenn nach dem Schließen eine Aktivität mit mehr Kommentaren öffnet', () => {
    const { scrollIntoView, rerender } = setup({ loaded: true, count: 2 })
    rerender({ loaded: false, count: 2 })
    rerender({ loaded: true, count: 4 })
    expect(scrollIntoView).not.toHaveBeenCalled()
  })
})
