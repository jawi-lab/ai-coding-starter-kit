'use client'

import { useEffect, useRef, type RefObject } from 'react'

// Bilder im neuen Kommentar laden nach und wachsen dann noch.
const IMAGE_WAIT_MS = 8000

/**
 * Scrollt zum Listenende, wenn ein Kommentar neu dazukommt. Das erste Laden legt
 * nur den Ausgangswert fest, damit das Detail beim Öffnen oben bleibt. Lädt danach
 * ein Bild, folgt die Ansicht nach, bis die Person scrollt oder tippt: Sonst
 * verschiebt sich das Ziel zwischen Drücken und Loslassen, und der Klick geht verloren.
 */
export function useScrollOnNewComment(
  loaded: boolean,
  count: number,
  endRef: RefObject<HTMLElement | null>
) {
  const seenCountRef = useRef<number | null>(null)

  useEffect(() => {
    if (!loaded) {
      seenCountRef.current = null
      return
    }
    const seenCount = seenCountRef.current
    seenCountRef.current = count
    const end = endRef.current
    if (seenCount === null || count <= seenCount || !end) return

    end.scrollIntoView({ behavior: 'smooth' })
    const list = end.parentElement
    if (!list) return

    const follow = () => end.scrollIntoView({ behavior: 'smooth' })
    const stop = () => {
      window.clearTimeout(timer)
      list.removeEventListener('load', follow, true)
      window.removeEventListener('wheel', stop, true)
      window.removeEventListener('touchmove', stop, true)
      window.removeEventListener('pointerdown', stop, true)
    }
    const timer = window.setTimeout(stop, IMAGE_WAIT_MS)
    // `load` steigt nicht auf, lässt sich aber in der Capture-Phase abfangen.
    list.addEventListener('load', follow, true)
    window.addEventListener('wheel', stop, true)
    window.addEventListener('touchmove', stop, true)
    window.addEventListener('pointerdown', stop, true)
    return stop
  }, [loaded, count, endRef])
}
