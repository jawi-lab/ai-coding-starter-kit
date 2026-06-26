'use client'

import { useEffect, useState } from 'react'

export interface KeyboardViewport {
  /** Pixels the on-screen keyboard overlaps the bottom of the layout viewport. */
  inset: number
  /** Current visible height (visualViewport.height) while the keyboard is open. */
  height: number
}

const EMPTY: KeyboardViewport = { inset: 0, height: 0 }

/**
 * Tracks the on-screen keyboard via the `visualViewport` API.
 *
 * iOS Safari does **not** resize the layout viewport when the software keyboard
 * opens; it only shrinks the visual viewport. A `position: fixed; bottom: 0`
 * bottom sheet therefore stays anchored behind the keyboard, hiding any footer
 * (e.g. a comment composer) and making the sheet appear to "jump".
 *
 * Returns the keyboard `inset` plus the measured visible `height`. Pin the sheet
 * with `bottom: inset` and `height` to keep it exactly within the visible area —
 * do **not** derive the height from `100dvh`, which on iOS is the *large*
 * viewport (browser chrome collapsed) and overshoots the keyboard.
 *
 * Both values are 0 when disabled, when there is no keyboard, or when the API is
 * unavailable (desktop, SSR).
 */
export function useKeyboardInset(enabled: boolean): KeyboardViewport {
  const [state, setState] = useState<KeyboardViewport>(EMPTY)

  useEffect(() => {
    if (!enabled || typeof window === 'undefined' || !window.visualViewport) {
      setState(EMPTY)
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
      if (overlap > KEYBOARD_THRESHOLD) {
        setState({ inset: Math.round(overlap), height: Math.round(vv.height) })
      } else {
        setState(EMPTY)
      }
    }

    update()
    vv.addEventListener('resize', update)
    vv.addEventListener('scroll', update)
    return () => {
      vv.removeEventListener('resize', update)
      vv.removeEventListener('scroll', update)
    }
  }, [enabled])

  return state
}
