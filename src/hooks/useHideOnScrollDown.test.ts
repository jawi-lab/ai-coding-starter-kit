import { describe, it, expect } from 'vitest'
import { act, renderHook } from '@testing-library/react'
import { useHideOnScrollDown } from './useHideOnScrollDown'

function setup() {
  const el = document.createElement('div')
  Object.defineProperty(el, 'scrollHeight', { value: 2000 })
  Object.defineProperty(el, 'clientHeight', { value: 800 })
  const { result } = renderHook(() => useHideOnScrollDown({ current: el }))
  const scrollTo = (top: number) =>
    act(() => {
      el.scrollTop = top
      el.dispatchEvent(new Event('scroll'))
    })
  return { result, scrollTo }
}

describe('useHideOnScrollDown', () => {
  it('ist am Anfang sichtbar', () => {
    expect(setup().result.current).toBe(false)
  })

  it('blendet beim Runterscrollen aus und beim Hochscrollen wieder ein', () => {
    const { result, scrollTo } = setup()
    scrollTo(200)
    expect(result.current).toBe(true)
    scrollTo(100)
    expect(result.current).toBe(false)
  })

  it('ignoriert kleine Bewegungen', () => {
    const { result, scrollTo } = setup()
    scrollTo(200)
    scrollTo(195)
    expect(result.current).toBe(true)
  })

  it('zeigt am Listenanfang immer an', () => {
    const { result, scrollTo } = setup()
    scrollTo(200)
    scrollTo(10)
    expect(result.current).toBe(false)
  })

  it('wertet das Zurückfedern am Listenende nicht als Hochscrollen', () => {
    const { result, scrollTo } = setup()
    scrollTo(1200)
    scrollTo(1260)
    scrollTo(1200)
    expect(result.current).toBe(true)
  })
})
