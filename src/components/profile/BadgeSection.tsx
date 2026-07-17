'use client'

import { useEffect, useRef, useState } from 'react'
import { BadgeRoleIcon, MedalIcon } from '@/components/icons/mellon-icons'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { useUserBadges, type UserBadgeState } from '@/hooks/useUserBadges'
import {
  BADGES,
  badgeInfo,
  hasUnseenTier,
  progressLabel,
  progressToNextTier,
  tierInfo,
  type BadgeKey,
} from '@/lib/badges'

/**
 * Badge-Sektion im eigenen Profil (PROJ-16): alle 4 Rollen-Badges mit Stufe,
 * Fortschritt zur nächsten Stufe und „Neu"-Hervorhebung. Kein Vergleich mit
 * anderen — bewusst nur die eigene Akte.
 */
export function BadgeSection() {
  const { badges, loading, error, retry, markSeen } = useUserBadges()

  // „Neu"-Hervorhebung: beim ersten erfolgreichen Laden festhalten, welche
  // Badges eine noch nicht angesehene Stufe haben — die bleiben für DIESE
  // Ansicht hervorgehoben, während der Angesehen-Stand in der DB sofort
  // nachgezogen wird (geräteübergreifend; beim nächsten Öffnen erloschen).
  const [highlighted, setHighlighted] = useState<ReadonlySet<BadgeKey>>(new Set())
  const markedRef = useRef(false)

  useEffect(() => {
    if (markedRef.current || !badges) return
    markedRef.current = true
    const unseen = badges.filter((b) => hasUnseenTier(b.earnedTier, b.seenTier))
    if (unseen.length > 0) {
      setHighlighted(new Set(unseen.map((b) => b.key)))
      markSeen()
    }
  }, [badges, markSeen])

  return (
    <div className="space-y-3">
      <h3 className="text-[12px] font-[800] text-ink-2 tracking-[0.06em]">Meine Badges</h3>

      {loading ? (
        <div className="space-y-2">
          {BADGES.map((b) => (
            <Skeleton key={b.key} className="h-[64px] w-full rounded-md bg-surface" />
          ))}
        </div>
      ) : error || !badges ? (
        <div className="rounded-md border border-line bg-surface px-4 py-3 flex items-center justify-between gap-3">
          <p className="text-[13px] text-ink-3">Badges konnten nicht geladen werden.</p>
          <Button
            variant="outline"
            size="sm"
            onClick={retry}
            className="border-line text-ink-2 text-[12px] font-[700] rounded-md flex-shrink-0"
          >
            Erneut versuchen
          </Button>
        </div>
      ) : (
        <div className="space-y-2">
          {badges.map((badge) => (
            <BadgeCard key={badge.key} badge={badge} isNew={highlighted.has(badge.key)} />
          ))}
        </div>
      )}
    </div>
  )
}

function BadgeCard({ badge, isNew }: { badge: UserBadgeState; isNew: boolean }) {
  const info = badgeInfo(badge.key)
  const tier = tierInfo(badge.earnedTier)
  const nextLabel = progressLabel(badge.count)
  const percent = progressToNextTier(badge.count)
  const earned = badge.earnedTier > 0

  return (
    <div
      className={`rounded-md border bg-surface px-3.5 py-3 flex items-center gap-3
        ${isNew ? 'border-secondary ring-1 ring-secondary/40' : 'border-line'}`}
    >
      <span
        aria-hidden="true"
        className={`h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0
          ${earned ? 'bg-primary-soft text-primary' : 'bg-surface-2 text-ink-3'}`}
      >
        <BadgeRoleIcon badge={badge.key} className="h-5 w-5" />
      </span>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className={`text-[14px] font-[700] truncate ${earned ? 'text-ink' : 'text-ink-3'}`}>
            {info.name}
          </span>
          {tier ? (
            <span className="inline-flex items-center gap-1 text-[10.5px] font-semibold tracking-[0.06em] px-2 py-0.5 rounded-pill bg-secondary-soft text-secondary flex-shrink-0">
              <MedalIcon rank={tier.rank} className="h-3.5 w-3.5" /> {tier.name}
            </span>
          ) : (
            <span className="text-[10.5px] font-semibold tracking-[0.06em] px-2 py-0.5 rounded-pill bg-surface-2 text-ink-3 flex-shrink-0">
              Noch nicht erreicht
            </span>
          )}
          {isNew && (
            <span className="text-[10px] font-[800] tracking-[0.06em] px-1.5 py-0.5 rounded-pill bg-secondary text-white flex-shrink-0">
              Neu
            </span>
          )}
        </div>
        <p className="text-[11.5px] text-ink-3 mt-0.5 truncate">{info.description}</p>

        {nextLabel !== null && percent !== null ? (
          <div className="mt-2 flex items-center gap-2">
            <Progress
              value={percent}
              aria-label={`${info.name}: ${nextLabel}`}
              className="h-1.5 flex-1 bg-surface-2"
            />
            <span className="text-[11px] text-ink-3 flex-shrink-0">{nextLabel}</span>
          </div>
        ) : (
          // Gold erreicht: Rohzahl statt Fortschrittsbalken (Spec).
          <p className="mt-1.5 text-[11px] text-ink-3">
            {badge.count} {badge.count === 1 ? 'Aktion' : 'Aktionen'}
          </p>
        )}
      </div>
    </div>
  )
}
