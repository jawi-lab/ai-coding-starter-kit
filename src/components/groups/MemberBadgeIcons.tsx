'use client'

import { BadgeRoleIcon } from '@/components/icons/mellon-icons'
import { badgeInfo, tierInfo } from '@/lib/badges'
import type { MemberBadge } from '@/hooks/useGroupBadges'

/** Metallton je Stufe — bewusst nur Farbe statt Medaillen-Icon, damit die
 *  Zeile neben dem Namen ruhig bleibt (Stufe steckt im Ton + Tooltip). */
const TIER_COLOR: Record<'bronze' | 'silber' | 'gold', string> = {
  bronze: '#A96F3E',
  silber: '#78838E',
  gold: '#C08A2E',
}

/**
 * Kleine Badge-Icons neben dem Namen in der Mitgliederliste (PROJ-16):
 * ausschließlich verdiente Stufen — nie Zähler oder Fortschritt anderer.
 * Ohne verdiente Badges wird nichts gerendert (kein Platzhalter, Spec).
 */
export function MemberBadgeIcons({ badges }: { badges: MemberBadge[] }) {
  if (badges.length === 0) return null

  return (
    <span className="inline-flex items-center gap-1.5 flex-shrink-0">
      {badges.map((b) => {
        const info = badgeInfo(b.key)
        const tier = tierInfo(b.earnedTier)
        if (!tier) return null
        return (
          <span
            key={b.key}
            title={`${info.name} · ${tier.name}`}
            aria-label={`Badge: ${info.name}, Stufe ${tier.name}`}
            className="inline-flex"
            style={{ color: TIER_COLOR[tier.rank] }}
          >
            <BadgeRoleIcon badge={b.key} className="h-3.5 w-3.5" strokeWidth={2.4} />
          </span>
        )
      })}
    </span>
  )
}
