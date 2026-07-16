'use client'

import { MemoryCard } from './MemoryCard'
import { memoryCardDate } from '@/lib/memory-card'

export interface RevealActivity {
  name: string
  duration_category: string
  og_image_url: string | null
  start_date: string | null
  end_date: string | null
}

interface MemoryCardRevealProps {
  /** Die soeben abgeschlossene Aktivität — `null` blendet das Overlay aus. */
  activity: RevealActivity | null
  groupName: string
  /** Tippen irgendwo schließt den Reveal. */
  onDismiss: () => void
}

/**
 * Karten-Reveal (PROJ-17) — Vollbild-Flip direkt nach dem eigenen Abschluss
 * einer Aktivität. Rein client-seitig mit den Daten, die der Abschließende
 * ohnehin in der Hand hat: Cover = og_image_url bzw. Platzhalter (Fotos
 * existieren beim Abschluss noch nicht), Datum = Termin, sonst „jetzt".
 * Läuft gleichzeitig die PROJ-15-Meilenstein-Feier, rendert die Shell den
 * Reveal erst nach deren Dismiss (Warteschlange, nie gestapelt) — zusätzlich
 * liegt er mit z-[55] UNTER der Feier (z-[60]).
 */
export function MemoryCardReveal({ activity, groupName, onDismiss }: MemoryCardRevealProps) {
  if (!activity) return null

  const dateLabel = memoryCardDate({
    start_date: activity.start_date,
    end_date: activity.end_date,
    completed_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
  })

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Neue Erinnerungs-Karte: ${activity.name}`}
      onClick={onDismiss}
      // Solides Overlay statt /95-Opacity — das surface-ink-Token trägt keinen
      // <alpha-value>, Opacity-Modifier kompilieren nicht (PROJ-15 QA BUG-2).
      className="fixed inset-0 z-[55] flex flex-col items-center justify-center gap-7
                 bg-surface-ink cursor-pointer animate-mellon-fade-in"
    >
      <p className="text-[13px] font-[700] tracking-[0.06em] text-[#D9A24B]">
        Neue Erinnerung!
      </p>

      {/* Karten-Flip: 3D-Container, Rückseite zuerst sichtbar, dreht zur Karte */}
      <div className="[perspective:1100px]">
        <div className="relative w-[232px] [transform-style:preserve-3d] animate-mellon-card-flip">
          {/* Vorderseite: exakt dieselbe Karte wie im Album */}
          <div className="[backface-visibility:hidden]">
            <MemoryCard
              title={activity.name}
              dateLabel={dateLabel}
              groupName={groupName}
              durationCategory={activity.duration_category}
              coverUrl={activity.og_image_url}
            />
          </div>
          {/* Kartenrücken (während der Drehung sichtbar) */}
          <div
            aria-hidden
            className="absolute inset-0 rounded-lg bg-cover-green border border-white/15
                       [transform:rotateY(180deg)] [backface-visibility:hidden]
                       flex items-center justify-center"
          >
            <span className="font-serif font-medium text-[26px] text-[#FBF8F3]/40 select-none">
              Mellon
            </span>
          </div>
        </div>
      </div>

      <p className="absolute bottom-[calc(2.5rem+env(safe-area-inset-bottom))] text-[13px] font-[500] text-[#FBF8F3]/50">
        Tippen zum Schließen
      </p>
    </div>
  )
}
