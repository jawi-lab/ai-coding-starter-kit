'use client'

import { useCallback, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { BADGES, type BadgeKey } from '@/lib/badges'

export interface UserBadgeState {
  key: BadgeKey
  /** Aktueller Zähler (kann durch Löschungen sinken). */
  count: number
  /** Höchste jemals verdiente Stufe als Schwellenwert (0/5/15/30), monoton. */
  earnedTier: number
  /** Höchste im Profil angesehene Stufe — steuert die „Neu"-Hervorhebung. */
  seenTier: number
}

interface UseUserBadgesResult {
  /** Die eigene Badge-Akte in Anzeige-Reihenfolge — null solange sie lädt oder fehlschlug. */
  badges: UserBadgeState[] | null
  loading: boolean
  error: boolean
  retry: () => void
  /** Setzt angesehen = verdient (geräteübergreifend, dauerhaft) — Fire-and-forget. */
  markSeen: () => void
}

/**
 * Eigene Badge-Akte fürs Profil (PROJ-16): liest die 4 `user_badges`-Zeilen
 * (RLS: nur die eigene Akte) und meldet Fehler als dezenten Retry-Zustand —
 * der Rest des Profils bleibt nutzbar (Spec-Edge-Case Netzwerkfehler).
 */
export function useUserBadges(): UseUserBadgesResult {
  const { user } = useAuth()
  const userId = user?.id ?? ''

  const [badges, setBadges] = useState<UserBadgeState[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  const fetchBadges = useCallback(async () => {
    if (!userId) return
    setLoading(true)
    setError(false)

    const { data, error: err } = await supabase
      .from('user_badges')
      .select('badge, action_count, highest_earned_tier, highest_seen_tier')
      .eq('user_id', userId)

    if (err) {
      setBadges(null)
      setError(true)
      setLoading(false)
      return
    }

    // In fester Anzeige-Reihenfolge mappen; fehlende Zeilen (sollte es dank
    // Seed-Trigger nicht geben) erscheinen als 0er-Akte statt Lücke.
    const byKey = new Map((data ?? []).map((row) => [row.badge, row]))
    setBadges(
      BADGES.map((b) => {
        const row = byKey.get(b.key)
        return {
          key: b.key,
          count: row?.action_count ?? 0,
          earnedTier: row?.highest_earned_tier ?? 0,
          seenTier: row?.highest_seen_tier ?? 0,
        }
      })
    )
    setLoading(false)
  }, [userId])

  useEffect(() => {
    fetchBadges()
  }, [fetchBadges])

  const markSeen = useCallback(() => {
    // Bewusst still bei Fehlern: schlimmstenfalls bleibt die „Neu"-Markierung
    // bis zum nächsten Öffnen bestehen (gleiche Haltung wie Momentum-Seen).
    supabase.rpc('mark_own_badges_seen').then(({ error: err }) => {
      if (err) console.warn('Badges: Angesehen-Stand konnte nicht gespeichert werden', err)
    })
  }, [])

  return { badges, loading, error, retry: fetchBadges, markSeen }
}
