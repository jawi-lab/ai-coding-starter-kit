'use client'

import { useEffect, useState } from 'react'

/**
 * Tracks how many pixels the on-screen keyboard overlaps the bottom of the
 * layout viewport — using the `visualViewport` API.
 *
 * iOS Safari does **not** resize the layout viewport when the software keyboard
 * opens; it only shrinks the visual viewport. A `position: fixed; bottom: 0`
 * bottom sheet therefore stays anchored behind the keyboard, hiding any footer
 * (e.g. a comment composer) and causing the sheet to appear to "jump". Consumers
 * can use the returned inset to lift the sheet above the keyboard.
 *
 * Returns 0 when disabled, when there is no keyboard, or when the API is
 * unavailable (e.g. desktop, SSR).
 */
export function useKeyboardInset(enabled: boolean): number {
  const [inset, setInset] = useState(0)

  useEffect(() => {
    if (!enabled || typeof window === 'undefined' || !window.visualViewport) {
      setInset(0)
      return
    }

    const vv = window.visualViewport

    // Below this, the gap is browser chrome / rounding rather than a keyboard.
    const KEYBOARD_THRESHOLD = 120

    const update = () => {
      // Keyboard height ≈ the part of the layout viewport hidden below the
      // visual viewport. (offsetTop is deliberately ignored: it only reflects
      // transient panning and would make a bottom-pinned sheet drift.)
      const overlap = window.innerHeight - vv.height
      setInset(overlap > KEYBOARD_THRESHOLD ? Math.round(overlap) : 0)
    }

    update()
    vv.addEventListener('resize', update)
    vv.addEventListener('scroll', update)
    return () => {
      vv.removeEventListener('resize', update)
      vv.removeEventListener('scroll', update)
    }
  }, [enabled])

  return inset
}
