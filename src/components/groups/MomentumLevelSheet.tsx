'use client'

import { Check } from 'lucide-react'
import {
  ResponsiveModal,
  ResponsiveModalContent,
  ResponsiveModalHeader,
  ResponsiveModalTitle,
  ResponsiveModalDescription,
} from '@/components/ui/responsive-modal'
import { MOMENTUM_LEVELS, levelForCount } from '@/lib/momentum'
import type { GroupMomentum } from '@/hooks/useGroupMomentum'

interface MomentumLevelSheetProps {
  open: boolean
  onClose: () => void
  momentum: GroupMomentum
}

/**
 * Level-Leiter (PROJ-15) — öffnet sich beim Antippen des Momentum-Banners.
 * Zeigt alle 4 Level mit ihren Schwellen und markiert erreichte, das aktuelle
 * und noch offene Level. „Erreicht" folgt bewusst der Live-Anzahl (nicht dem
 * dauerhaften Meilenstein), damit die Leiter immer zum Banner passt.
 */
export function MomentumLevelSheet({ open, onClose, momentum }: MomentumLevelSheetProps) {
  const { count } = momentum
  const currentLevel = levelForCount(count)

  return (
    <ResponsiveModal open={open} onOpenChange={(o) => !o && onClose()}>
      <ResponsiveModalContent size="md">
        {/* ResponsiveModalHeader bringt kein eigenes Padding mit (siehe
            GroupDetailSheet) — ohne px klebt der Titel am Sheet-Rand. */}
        <ResponsiveModalHeader className="px-5 pt-5 pb-4 md:px-6">
          <ResponsiveModalTitle>Eure Gruppen-Reise</ResponsiveModalTitle>
          <ResponsiveModalDescription>
            {count} {count === 1 ? 'gemeinsame Aktivität' : 'gemeinsame Aktivitäten'} abgeschlossen
          </ResponsiveModalDescription>
        </ResponsiveModalHeader>

        <div className="px-5 pb-[calc(1.5rem+env(safe-area-inset-bottom))] md:px-6 md:pb-6">
          <ol className="space-y-2">
            {MOMENTUM_LEVELS.map((level) => {
              const reached = count >= level.threshold
              const isCurrent = level.level === currentLevel.level

              return (
                <li
                  key={level.level}
                  className={`flex items-center gap-3 rounded-md border p-3 transition
                    ${isCurrent
                      ? 'border-primary/40 bg-primary-soft/40'
                      : 'border-line bg-surface'
                    }`}
                >
                  {/* Status-Medaillon: Haken = erreicht, Schwelle = offen */}
                  <div
                    className={`flex-shrink-0 h-9 w-9 rounded-pill flex items-center justify-center
                      ${reached ? 'bg-primary text-white' : 'bg-surface-2 text-ink-3'}`}
                    aria-hidden="true"
                  >
                    {reached ? (
                      <Check className="h-[18px] w-[18px]" strokeWidth={2.5} />
                    ) : (
                      <span className="text-[13px] font-[700]">{level.threshold}</span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className={`text-[15px] font-[700] leading-snug ${reached ? 'text-ink' : 'text-ink-2'}`}>
                      {level.name}
                    </p>
                    <p className="text-[13px] text-ink-3">
                      {level.threshold === 0
                        ? 'Startpunkt eurer Reise'
                        : `Ab ${level.threshold} abgeschlossenen Aktivitäten`}
                    </p>
                  </div>

                  {isCurrent && (
                    <span className="flex-shrink-0 text-[12px] font-[700] text-primary bg-surface rounded-pill border border-primary/30 px-2.5 py-1">
                      Aktuell
                    </span>
                  )}
                </li>
              )
            })}
          </ol>
        </div>
      </ResponsiveModalContent>
    </ResponsiveModal>
  )
}
