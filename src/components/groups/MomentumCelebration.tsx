'use client'

import { useEffect, useRef } from 'react'
import confetti from 'canvas-confetti'
import { levelForMilestone } from '@/lib/momentum'

interface MomentumCelebrationProps {
  /** Der zu feiernde Meilenstein (5/10/25) — `null` blendet das Overlay aus. */
  milestone: number | null
  /** Aktuelle Anzahl abgeschlossener Aktivitäten (für die Unterzeile). */
  count: number
  /** Tippen irgendwo schließt die Feier und markiert sie als gesehen. */
  onDismiss: () => void
}

/**
 * Vollbild-Feier (PROJ-15) — erscheint einmalig, wenn die Gruppe erstmals
 * einen Meilenstein (5/10/25) überschreitet. Invertierter Feier-Block
 * (`--surface-ink`, siehe Styleguide) mit Konfetti via canvas-confetti;
 * Tippen irgendwo schließt. Wird auf Shell-Ebene gerendert, damit die Feier
 * auch beim Abschluss am Board sofort erscheint.
 */
export function MomentumCelebration({ milestone, count, onDismiss }: MomentumCelebrationProps) {
  const firedRef = useRef<number | null>(null)

  // Konfetti pro angezeigtem Meilenstein genau einmal zünden. Eigene Canvas-
  // Instanz, damit das Konfetti sicher ÜBER dem Overlay liegt und beim
  // Schließen restlos verschwindet.
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    if (milestone === null || firedRef.current === milestone || !canvasRef.current) return
    firedRef.current = milestone

    const instance = confetti.create(canvasRef.current, { resize: true, useWorker: true })

    // Mellon-Palette: Waldgrün, Honiggold, Blush, Creme — kein Neon.
    const colors = ['#1E4634', '#D9A24B', '#DC9C88', '#F6F0E6']

    // Ein großer Burst aus der Mitte, zwei seitliche Nachzügler — festlich,
    // aber kurz (kein Endlos-Loop, siehe Styleguide-Motion-Regeln).
    instance({ particleCount: 90, spread: 75, origin: { x: 0.5, y: 0.45 }, colors, ticks: 240 })
    const t1 = setTimeout(() => {
      instance({ particleCount: 45, angle: 60, spread: 60, origin: { x: 0.1, y: 0.6 }, colors, ticks: 200 })
      instance({ particleCount: 45, angle: 120, spread: 60, origin: { x: 0.9, y: 0.6 }, colors, ticks: 200 })
    }, 350)

    return () => {
      clearTimeout(t1)
      instance.reset()
    }
  }, [milestone])

  if (milestone === null) return null

  const level = levelForMilestone(milestone)
  if (!level) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Level up: ${level.name}`}
      onClick={onDismiss}
      // Voller, deckender Feier-Block: `bg-surface-ink/95` kompiliert NICHT,
      // weil das Token als rohes var() ohne <alpha-value> definiert ist —
      // Tailwind kann keinen Opacity-Modifier anwenden und lässt die Klasse
      // weg (QA BUG-2: unsichtbarer Hintergrund). Daher solid + ohne Blur.
      className="fixed inset-0 z-[60] flex flex-col items-center justify-center
                 bg-surface-ink cursor-pointer
                 animate-in fade-in-0 duration-300"
    >
      {/* Konfetti-Ebene (nicht interaktiv, Tipp geht ans Overlay durch) */}
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full pointer-events-none" />

      <div className="relative flex flex-col items-center gap-3 px-8 text-center animate-in fade-in-0 zoom-in-95 duration-500">
        <p className="text-[13px] font-[700] tracking-[0.06em] text-[#D9A24B]">
          Level up!
        </p>
        <h2 className="font-serif font-medium text-[38px] leading-[1.15] tracking-[-0.015em] text-[#FBF8F3]">
          {level.name}
        </h2>
        <p className="text-[15.5px] text-[#FBF8F3]/75 max-w-[280px] leading-relaxed">
          {Math.max(count, milestone)} gemeinsame Aktivitäten abgeschlossen — weiter so!
        </p>
      </div>

      <p className="absolute bottom-[calc(2.5rem+env(safe-area-inset-bottom))] text-[13px] font-[500] text-[#FBF8F3]/50">
        Tippen zum Schließen
      </p>
    </div>
  )
}
