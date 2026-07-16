'use client'

import { MedalIcon } from '@/components/icons/mellon-icons'
import { badgeInfo, tierInfo } from '@/lib/badges'
import type { MemberBadge } from '@/hooks/useGroupBadges'

/**
 * Kleine Badge-Icons neben dem Namen in der Mitgliederliste (PROJ-16):
 * ausschließlich verdiente Stufen — nie Zähler oder Fortschritt anderer.
 * Ohne verdiente Badges wird nichts gerendert (kein Platzhalter, Spec).
 */
export function MemberBadgeIcons({ badges }: { badges: MemberBadge[] }) {
  if (badges.length === 0) return null

  return (
    <span className="inline-flex items-center gap-1 flex-shrink-0">
      {badges.map((b) => {
        const info = badgeInfo(b.key)
        const tier = tierInfo(b.earnedTier)
        if (!tier) return null
        return (
          <span
            key={b.key}
            title={`${info.name} · ${tier.name}`}
            aria-label={`Badge: ${info.name}, Stufe ${tier.name}`}
            className="inline-flex items-center gap-0.5 rounded-pill bg-surface-2 px-1 py-0.5 text-[10px] leading-none"
          >
            {info.icon}
            <MedalIcon rank={tier.rank} className="h-3 w-3" />
          </span>
        )
      })}
    </span>
  )
}
