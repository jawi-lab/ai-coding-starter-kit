'use client'

import { useEffect, useState } from 'react'
import { Capacitor } from '@capacitor/core'

export interface KeyboardViewport {
  /** Pixels the on-screen keyboard overlaps the bottom of the layout viewport. */
  inset: number
  /** Current visible height (visualViewport.height) while the keyboard is open. */
  height: number
}

const EMPTY: KeyboardViewport = { inset: 0, height: 0 }

/** Abstand nach oben, damit das Sheet nicht unter Statusleiste und Notch läuft. */
function topClearance(): number {
  const probe = document.createElement('div')
  probe.style.cssText = 'position:fixed;visibility:hidden;height:env(safe-area-inset-top)'
  document.body.appendChild(probe)
  const safeArea = probe.offsetHeight
  probe.remove()
  return safeArea + 8
}

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
    // Zurückgesetzt wird im Cleanup (siehe unten) — ein setState direkt im
    // Effect-Body löst eine zusätzliche Render-Runde aus.
    if (!enabled || typeof window === 'undefined') return

    // In der iOS-App entzieht das Keyboard-Plugin der WebView die Tastatur-
    // Ereignisse, visualViewport schrumpft dort nie. Die Höhe kommt vom Plugin.
    if (Capacitor.getPlatform() === 'ios') {
      let cancelled = false
      const removers: Array<() => void> = []

      void (async () => {
        const { Keyboard } = await import('@capacitor/keyboard')
        const show = ({ keyboardHeight }: { keyboardHeight: number }) => {
          setState({
            inset: Math.round(keyboardHeight),
            height: Math.round(window.innerHeight - keyboardHeight - topClearance()),
          })
        }
        const handles = await Promise.all([
          Keyboard.addListener('keyboardWillShow', show),
          // Fängt Autofokus ab, falls die Tastatur vor dem ersten Listener startet.
          Keyboard.addListener('keyboardDidShow', show),
          Keyboard.addListener('keyboardWillHide', () => setState(EMPTY)),
        ])
        for (const handle of handles) {
          if (cancelled) void handle.remove()
          else removers.push(() => void handle.remove())
        }
      })()

      return () => {
        cancelled = true
        for (const remove of removers) remove()
        setState(EMPTY)
      }
    }

    if (!window.visualViewport) return

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
      // Deaktiviert (Sheet zu, Desktop) heißt: kein Keyboard-Inset mehr.
      setState(EMPTY)
    }
  }, [enabled])

  return state
}
