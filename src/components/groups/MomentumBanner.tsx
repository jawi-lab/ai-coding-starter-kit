'use client'

import { ChevronRight, Sparkles } from 'lucide-react'
import { Progress } from '@/components/ui/progress'
import { levelForCount, progressToNextLevel, progressLabel } from '@/lib/momentum'
import type { GroupMomentum } from '@/hooks/useGroupMomentum'

interface MomentumBannerProps {
  momentum: GroupMomentum
  /** Antippen öffnet die Level-Leiter (MomentumLevelSheet). */
  onOpenLadder: () => void
}

/**
 * Momentum-Banner (PROJ-15) — sitzt ganz oben im Vorschläge-Tab, über den
 * Filter-Chips. Zeigt das gemeinsame Level, die Anzahl abgeschlossener
 * Aktivitäten und den Fortschritt zum nächsten Meilenstein; im höchsten
 * Level („Legendäre Gruppe") nur noch die Rohzahl ohne Balken.
 */
export function MomentumBanner({ momentum, onOpenLadder }: MomentumBannerProps) {
  const { count } = momentum
  const level = levelForCount(count)
  const percent = progressToNextLevel(count)
  const label = progressLabel(count)
  const isMaxLevel = percent === null

  return (
    <button
      type="button"
      onClick={onOpenLadder}
      aria-label={`Gruppen-Momentum: ${level.name}, ${count} abgeschlossene Aktivitäten. Level-Leiter öffnen`}
      className="w-full text-left bg-surface border border-line rounded-lg shadow-sm p-4
                 transition active:scale-[0.99] hover:border-primary/30"
    >
      <div className="flex items-center gap-3">
        {/* Icon-Medaillon */}
        <div className="flex-shrink-0 h-10 w-10 rounded-pill bg-primary-soft flex items-center justify-center">
          <Sparkles className="h-5 w-5 text-primary" strokeWidth={2} />
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-[12px] font-[600] tracking-[0.06em] text-ink-3">
            Gruppen-Momentum
          </p>
          <p className="text-[16px] font-[800] text-ink leading-snug truncate">
            {level.name}
            <span className="font-[500] text-ink-2">
              {' '}· {count} {count === 1 ? 'Aktivität' : 'Aktivitäten'}
            </span>
          </p>
        </div>

        <ChevronRight className="flex-shrink-0 h-4 w-4 text-ink-3" strokeWidth={2} />
      </div>

      {/* Fortschritt zum nächsten Meilenstein — entfällt im höchsten Level. */}
      {!isMaxLevel && (
        <div className="mt-3 flex items-center gap-3">
          <Progress
            value={percent}
            className="h-2 flex-1"
            aria-label={label ?? undefined}
          />
          <span className="flex-shrink-0 text-[12.5px] font-[600] text-ink-2">{label}</span>
        </div>
      )}
    </button>
  )
}
