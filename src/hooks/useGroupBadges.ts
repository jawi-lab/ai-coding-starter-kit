'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { BADGES, type BadgeKey } from '@/lib/badges'

export interface MemberBadge {
  key: BadgeKey
  /** Verdiente Stufe als Schwellenwert (5/15/30) — nie Zähler/Fortschritt anderer. */
  earnedTier: number
}

/**
 * Fremd-Sicht für die Mitgliederliste (PROJ-16): EIN gebündelter Abruf pro
 * Gruppe über `get_group_badges` — die RPC liefert ausschließlich verdiente
 * Stufen (RLS-gesichert, nie Zähler anderer). Fehler bleiben still: dann
 * erscheinen schlicht keine Badge-Icons, die Liste selbst bleibt nutzbar.
 */
export function useGroupBadges(groupId: string | null): Map<string, MemberBadge[]> {
  const [badgesByUser, setBadgesByUser] = useState<Map<string, MemberBadge[]>>(new Map())

  useEffect(() => {
    if (!groupId) {
      setBadgesByUser(new Map())
      return
    }

    let cancelled = false
    supabase.rpc('get_group_badges', { p_group_id: groupId }).then(({ data, error }) => {
      if (cancelled || error || !data) return

      const map = new Map<string, MemberBadge[]>()
      for (const row of data) {
        const list = map.get(row.user_id) ?? []
        list.push({ key: row.badge as BadgeKey, earnedTier: row.earned_tier })
        map.set(row.user_id, list)
      }
      // Feste Anzeige-Reihenfolge (wie im Profil), nicht DB-Reihenfolge.
      const order = BADGES.map((b) => b.key)
      for (const list of map.values()) {
        list.sort((a, b) => order.indexOf(a.key) - order.indexOf(b.key))
      }
      setBadgesByUser(map)
    })

    return () => {
      cancelled = true
    }
  }, [groupId])

  return badgesByUser
}
