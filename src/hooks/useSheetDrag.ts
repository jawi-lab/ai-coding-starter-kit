'use client'

import { useRef } from 'react'
import type { PointerEvent, MouseEvent, RefObject } from 'react'

/** Ab dieser Strecke (px) gilt die Geste als Ziehen statt als Tippen. */
const TAP_SLOP = 8
/** Nur die letzten Bewegungen zählen für die Loslass-Geschwindigkeit. */
const VELOCITY_WINDOW_MS = 100
const SNAP_BACK = '400ms var(--ease-sheet)'

/** Wie weit eine Geste mit dieser Geschwindigkeit (px/s) noch tragen würde. */
export function projectMomentum(velocity: number, decelerationRate = 0.998) {
  return ((velocity / 1000) * decelerationRate) / (1 - decelerationRate)
}

/** Zunehmender Widerstand jenseits der Grenze statt eines harten Stopps. */
export function rubberband(overshoot: number, dimension: number, constant = 0.55) {
  return (overshoot * dimension * constant) / (dimension + constant * Math.abs(overshoot))
}

/** Schließt, wenn der projizierte Endpunkt jenseits der halben Sheet-Höhe liegt. */
export function shouldDismiss(offset: number, velocity: number, height: number) {
  return offset + projectMomentum(velocity) > height / 2
}

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

interface UseSheetDragOptions {
  contentRef: RefObject<HTMLElement | null>
  overlayRef: RefObject<HTMLElement | null>
  /** Muss das Sheet schließen; der Griff ist selbst der Schließen-Button. */
  closeRef: RefObject<HTMLElement | null>
}

/**
 * Zieht ein Bottom-Sheet 1:1 mit dem Finger am Griff. Beim Loslassen entscheidet
 * der projizierte Endpunkt: Schließen oder zurückfedern. Auch ein noch laufendes
 * Öffnen oder Zurückfedern lässt sich greifen, die Bewegung startet immer an der
 * aktuell sichtbaren Position.
 */
export function useSheetDrag({ contentRef, overlayRef, closeRef }: UseSheetDragOptions) {
  const grabOffset = useRef<number | null>(null)
  const downY = useRef(0)
  const offset = useRef(0)
  const moved = useRef(false)
  const suppressClick = useRef(false)
  const samples = useRef<{ y: number; t: number }[]>([])

  function applyOffset(next: number) {
    const content = contentRef.current
    if (!content) return
    offset.current = next
    content.style.transform = `translate3d(0, ${next}px, 0)`
    if (overlayRef.current) {
      const progress = Math.min(Math.max(next, 0) / content.offsetHeight, 1)
      overlayRef.current.style.opacity = String(1 - progress)
    }
  }

  function snapBack() {
    const content = contentRef.current
    const overlay = overlayRef.current
    if (!content) return
    // Reduzierte Bewegung: direkt zurück, ohne Gleiten.
    const reduced = prefersReducedMotion()
    content.style.transition = reduced ? 'none' : `transform ${SNAP_BACK}`
    content.style.transform = ''
    if (overlay) {
      overlay.style.transition = reduced ? 'none' : `opacity ${SNAP_BACK}`
      overlay.style.opacity = ''
    }
    offset.current = 0
  }

  function onPointerDown(e: PointerEvent<HTMLElement>) {
    const content = contentRef.current
    if (!content) return
    e.currentTarget.setPointerCapture(e.pointerId)

    // Sichtbaren Wert lesen, bevor die laufende Bewegung abgebrochen wird.
    const current = new DOMMatrixReadOnly(getComputedStyle(content).transform).m42
    content.getAnimations().forEach((animation) => animation.cancel())
    overlayRef.current?.getAnimations().forEach((animation) => animation.cancel())
    content.style.transition = 'none'
    if (overlayRef.current) overlayRef.current.style.transition = 'none'

    grabOffset.current = e.clientY - current
    downY.current = e.clientY
    moved.current = false
    suppressClick.current = false
    samples.current = [{ y: e.clientY, t: e.timeStamp }]
    applyOffset(current)
  }

  function onPointerMove(e: PointerEvent<HTMLElement>) {
    const content = contentRef.current
    if (grabOffset.current === null || !content) return
    if (Math.abs(e.clientY - downY.current) > TAP_SLOP) moved.current = true

    const raw = e.clientY - grabOffset.current
    applyOffset(raw >= 0 ? raw : -rubberband(-raw, content.offsetHeight))

    samples.current.push({ y: e.clientY, t: e.timeStamp })
    samples.current = samples.current.filter((s) => e.timeStamp - s.t <= VELOCITY_WINDOW_MS)
  }

  function onPointerUp(e: PointerEvent<HTMLElement>) {
    const content = contentRef.current
    if (grabOffset.current === null || !content) return
    grabOffset.current = null

    if (!moved.current) {
      // Tippen: Der Griff schließt über sein Klick-Ereignis.
      snapBack()
      return
    }

    const first = samples.current[0]
    const elapsed = e.timeStamp - first.t
    const velocity = elapsed > 0 ? ((e.clientY - first.y) / elapsed) * 1000 : 0

    if (!shouldDismiss(offset.current, velocity, content.offsetHeight)) {
      suppressClick.current = true
      snapBack()
      return
    }

    if (prefersReducedMotion()) {
      // Reduzierte Bewegung: an Ort und Stelle ausblenden, nicht zurückspringen.
      content.style.setProperty('--tw-exit-translate-y', `${offset.current}px`, 'important')
    }
    closeRef.current?.click()
    suppressClick.current = true
    // Lehnt der Aufrufer das Schließen ab, darf das Sheet nicht versetzt stehen bleiben.
    requestAnimationFrame(() => {
      if (content.dataset.state === 'open') snapBack()
    })
  }

  function onPointerCancel() {
    if (grabOffset.current === null) return
    grabOffset.current = null
    snapBack()
  }

  /** Der Klick nach einem Ziehen darf das Sheet nicht zusätzlich schließen. */
  function onClick(e: MouseEvent<HTMLElement>) {
    if (suppressClick.current) e.preventDefault()
  }

  return { onPointerDown, onPointerMove, onPointerUp, onPointerCancel, onClick }
}
