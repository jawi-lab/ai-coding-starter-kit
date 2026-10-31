'use client'

import { useEffect, useState, type RefObject } from 'react'

const SCROLL_DELTA = 8
const NEAR_TOP = 24

/**
 * Meldet, ob schwebendes Chrome gerade ausweichen soll: ausgeblendet beim
 * Runterscrollen, wieder sichtbar beim Hochscrollen und am Listenanfang.
 */
export function useHideOnScrollDown(scrollRef: RefObject<HTMLElement | null>): boolean {
  const [hidden, setHidden] = useState(false)

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    let lastTop = el.scrollTop

    function onScroll() {
      if (!el) return
      // iOS federt über die Ränder hinaus; das zählt nicht als Richtungswechsel.
      const maxTop = el.scrollHeight - el.clientHeight
      const top = Math.min(Math.max(el.scrollTop, 0), maxTop)
      if (top <= NEAR_TOP) {
        setHidden(false)
        lastTop = top
        return
      }
      if (Math.abs(top - lastTop) < SCROLL_DELTA) return
      setHidden(top > lastTop)
      lastTop = top
    }

    el.addEventListener('scroll', onScroll, { passive: true })
    return () => el.removeEventListener('scroll', onScroll)
  }, [scrollRef])

  return hidden
}
