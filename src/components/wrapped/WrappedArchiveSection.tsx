'use client'

import { Sparkles, ChevronRight } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { useWrappedAvailability } from '@/hooks/useWrappedAvailability'

interface WrappedArchiveSectionProps {
  groupId: string
  /** Jahr antippen → Settings schließen und Story-Viewer öffnen. */
  onOpenYear: (year: number) => void
}

/**
 * Rückblick-Archiv (PROJ-18) — der feste, ganzjährige Einstieg im
 * Gruppen-Detail-Sheet. Listet alle verfügbaren Jahrgänge (vergangene dauerhaft,
 * das laufende Jahr nur im Dezember) mit ≥ 3 Abschlüssen; jeder öffnet den
 * Story-Viewer erneut. Ohne Jahrgänge ein motivierender Leerzustand.
 */
export function WrappedArchiveSection({ groupId, onOpenYear }: WrappedArchiveSectionProps) {
  const { availableYears, loading } = useWrappedAvailability(groupId)

  return (
    <section className="space-y-3">
      <p className="text-[12px] font-[600] tracking-[0.06em] text-ink-3">Rückblicke</p>

      {loading ? (
        <div className="space-y-2">
          <Skeleton className="h-14 w-full rounded-md bg-surface-2" />
          <Skeleton className="h-14 w-full rounded-md bg-surface-2" />
        </div>
      ) : availableYears.length === 0 ? (
        <p className="text-[13px] leading-relaxed text-ink-3">
          Noch keine Rückblicke. Schließt in einem Jahr mindestens 3 Aktivitäten ab und euer
          Mellon Rückblick erscheint hier.
        </p>
      ) : (
        <div className="space-y-2">
          {availableYears.map((year) => (
            <button
              key={year}
              type="button"
              onClick={() => onOpenYear(year)}
              aria-label={`Mellon Rückblick ${year} ansehen`}
              className="flex w-full items-center gap-3 rounded-md border border-line bg-surface p-3
                         text-left transition active:scale-[0.99] hover:border-primary/30"
            >
              <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-pill bg-primary-soft">
                <Sparkles className="h-[18px] w-[18px] text-primary" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[15px] font-[800] text-ink leading-tight">Rückblick {year}</p>
                <p className="text-[12.5px] text-ink-3">Euer Jahr als Story</p>
              </div>
              <ChevronRight className="h-4 w-4 flex-shrink-0 text-ink-3" strokeWidth={2} />
            </button>
          ))}
        </div>
      )}
    </section>
  )
}
