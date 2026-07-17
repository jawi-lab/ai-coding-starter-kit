'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'

/**
 * Punkt-Indikator am Album-Tab (PROJ-17): gibt es mindestens eine Karte,
 * die jünger ist als „Album zuletzt geöffnet"? Eine Head-Count-Abfrage beim
 * Öffnen des Profil-Sheets — kein Realtime (Spec-Vorgabe).
 *
 * `markSeen` setzt den Zeitstempel auf jetzt (beim Öffnen des Album-Tabs);
 * der Aufrufer hält sich für die „Neu"-Badges im Grid vorher einen Snapshot
 * des alten Werts.
 */
export function useAlbumBadge(active: boolean) {
  const { user, profile, refreshProfile } = useAuth()
  const [hasNew, setHasNew] = useState(false)
  const lastSeenAt = profile?.album_last_seen_at ?? null

  // Sobald markSeen lief, darf eine noch laufende Abfrage (gestartet beim
  // Sheet-Öffnen, mit dem ALTEN Zeitstempel) den Punkt nicht wieder anzeigen.
  // Pro Sheet-Besuch zurückgesetzt.
  const seenRef = useRef(false)

  useEffect(() => {
    if (active) seenRef.current = false
  }, [active])

  useEffect(() => {
    // Nur prüfen, solange das Profil-Sheet offen ist — es bleibt auf
    // Shell-Ebene dauerhaft gemountet, der Mount-Zeitpunkt ist also der
    // Seiten-Load, nicht das Öffnen.
    if (!active || !user || !lastSeenAt) return
    let cancelled = false

    ;(async () => {
      // Mitgliedschaften wie im Album: aktive ∪ ehemalige (PROJ-17, Baustein 3)
      const [current, former] = await Promise.all([
        supabase.from('group_members').select('group_id').eq('user_id', user.id),
        supabase.from('group_members_history').select('group_id').eq('user_id', user.id),
      ])
      const groupIds = [...new Set(
        [...(current.data ?? []), ...(former.data ?? [])].map((m) => m.group_id)
      )]
      if (cancelled || groupIds.length === 0) return

      const { count } = await supabase
        .from('activities')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'abgeschlossen')
        .in('group_id', groupIds)
        .gt('completed_at', lastSeenAt)

      if (!cancelled && !seenRef.current) setHasNew((count ?? 0) > 0)
    })()

    return () => {
      cancelled = true
    }
  }, [active, user, lastSeenAt])

  const markSeen = useCallback(async () => {
    if (!user) return
    seenRef.current = true
    setHasNew(false)
    await supabase
      .from('profiles')
      .update({ album_last_seen_at: new Date().toISOString() })
      .eq('id', user.id)
    // Profil nachziehen, damit der nächste Sheet-Besuch den frischen Wert sieht
    await refreshProfile()
  }, [user, refreshProfile])

  return { hasNew, lastSeenAt, markSeen }
}
