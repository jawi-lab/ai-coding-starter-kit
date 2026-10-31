'use client'

import { useEffect, useRef, type RefObject } from 'react'

/**
 * Scrollt zum Listenende, wenn ein Kommentar neu dazukommt. Das erste Laden legt
 * nur den Ausgangswert fest, damit das Detail beim Öffnen oben bleibt.
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
    if (seenCount !== null && count > seenCount) {
      endRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [loaded, count, endRef])
}
