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

describe('useScrollOnNewComment: nachladende Bilder', () => {
  function setup() {
    const list = document.createElement('div')
    const end = document.createElement('div')
    list.appendChild(end)
    document.body.appendChild(list)
    const scroll = vi.fn()
    end.scrollIntoView = scroll
    const ref = { current: end }
    const view = renderHook(({ count }) => useScrollOnNewComment(true, count, ref), { initialProps: { count: 1 } })
    view.rerender({ count: 2 })
    expect(scroll).toHaveBeenCalledTimes(1)
    const image = document.createElement('img')
    list.appendChild(image)
    return { view, scroll, image }
  }

  it('scrollt erneut, wenn ein Bild fertig geladen ist', () => {
    const { scroll, image } = setup()
    image.dispatchEvent(new Event('load'))
    expect(scroll).toHaveBeenCalledTimes(2)
  })

  it('folgt nicht mehr, sobald die Person selbst scrollt', () => {
    const { scroll, image } = setup()
    window.dispatchEvent(new Event('touchmove'))
    image.dispatchEvent(new Event('load'))
    expect(scroll).toHaveBeenCalledTimes(1)
  })

  it('folgt nicht mehr, sobald die Person etwas antippt', () => {
    const { scroll, image } = setup()
    window.dispatchEvent(new Event('pointerdown'))
    image.dispatchEvent(new Event('load'))
    expect(scroll).toHaveBeenCalledTimes(1)
  })

  it('folgt nach dem Abbau nicht mehr', () => {
    const { view, scroll, image } = setup()
    view.unmount()
    image.dispatchEvent(new Event('load'))
    expect(scroll).toHaveBeenCalledTimes(1)
  })
})
