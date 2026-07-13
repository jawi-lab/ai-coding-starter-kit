'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { pendingCelebrationMilestone } from '@/lib/momentum'

export interface GroupMomentum {
  /** Live-Anzahl abgeschlossener Aktivitäten (vom DB-Trigger gepflegt). */
  count: number
  /** Höchster jemals erreichter Meilenstein (0/5/10/25) — steigt nur, sinkt nie. */
  highestMilestone: number
}

export interface UseGroupMomentumResult {
  /**
   * Die Fortschritts-Akte der Gruppe — `null` solange sie lädt oder (noch)
   * nicht existiert. Das Banner blendet sich dann still aus; es gibt bewusst
   * keinen Fehlerzustand, Momentum ist rein additiv.
   */
  momentum: GroupMomentum | null
  /** Meilenstein (5/10/25), dessen Vollbild-Feier für mich gerade ansteht. */
  pendingMilestone: number | null
  /** Feier geschlossen → eigenen Gesehen-Wert auf den Gruppen-Stand nachziehen. */
  markCelebrationSeen: () => void
}

/**
 * Daten-Hook für Gruppen-Momentum (PROJ-15).
 *
 * Lädt die Fortschritts-Akte (`group_momentum`) plus den eigenen Gesehen-Wert
 * (`group_momentum_seen`) und hält die Akte per Realtime aktuell (dasselbe
 * Muster wie das Kanban-Board: Channel gefiltert nach `group_id`). Eine Feier
 * steht an, sobald der erreichte Gruppen-Meilenstein über dem eigenen
 * Gesehen-Wert liegt — bei mehreren verpassten immer nur der höchste.
 *
 * Einmal auf Shell-Ebene (Group-View) mounten, damit die Sofort-Feier auch
 * beim Abschluss am Board erscheint — nicht nur im Vorschläge-Tab.
 */
export function useGroupMomentum(groupId: string): UseGroupMomentumResult {
  const { user } = useAuth()
  const userId = user?.id ?? ''

  const [momentum, setMomentum] = useState<GroupMomentum | null>(null)
  // null = Gesehen-Wert noch nicht geladen → bis dahin keine Feier auslösen.
  const [seen, setSeen] = useState<number | null>(null)
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null)

  const fetchMomentum = useCallback(async () => {
    if (!groupId) return
    const { data, error } = await supabase
      .from('group_momentum')
      .select('completed_count, highest_milestone')
      .eq('group_id', groupId)
      .maybeSingle()

    // Fehlende Akte (Feature noch nicht migriert / Zeile noch nicht angelegt)
    // ist kein Fehler: Banner bleibt einfach unsichtbar.
    if (error || !data) {
      setMomentum(null)
      return
    }
    setMomentum({ count: data.completed_count, highestMilestone: data.highest_milestone })
  }, [groupId])

  const fetchSeen = useCallback(async () => {
    if (!groupId || !userId) return
    const { data, error } = await supabase
      .from('group_momentum_seen')
      .select('highest_seen_milestone')
      .eq('group_id', groupId)
      .eq('user_id', userId)
      .maybeSingle()

    if (error) return
    // Kein Vermerk = noch nichts gesehen (Bestandsmitglieder werden vom
    // Backfill, Neu-Beitritte vom Trigger geseedet — 0 ist der sichere Rest).
    setSeen(data?.highest_seen_milestone ?? 0)
  }, [groupId, userId])

  useEffect(() => {
    if (!groupId) return

    fetchMomentum()
    fetchSeen()

    // Realtime auf die eine Akte-Zeile der Gruppe: schließt irgendwer eine
    // Aktivität ab, springt das Banner überall ohne Reload weiter — und die
    // Sofort-Feier feuert bei der abschließenden Person selbst.
    const channel = supabase
      .channel(`momentum:${groupId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'group_momentum',
          filter: `group_id=eq.${groupId}`,
        },
        () => {
          fetchMomentum()
        }
      )
      .subscribe()

    channelRef.current = channel

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current)
        channelRef.current = null
      }
    }
  }, [groupId, fetchMomentum, fetchSeen])

  const pendingMilestone =
    momentum !== null && seen !== null
      ? pendingCelebrationMilestone(momentum.highestMilestone, seen)
      : null

  const markCelebrationSeen = useCallback(() => {
    if (!groupId || !userId || momentum === null) return
    const milestone = momentum.highestMilestone
    // Optimistisch nachziehen — die Feier soll sofort verschwinden und auch
    // bei einem Schreib-Fehler nicht in einer Session doppelt erscheinen.
    setSeen(milestone)
    supabase
      .from('group_momentum_seen')
      .upsert(
        { group_id: groupId, user_id: userId, highest_seen_milestone: milestone },
        { onConflict: 'group_id,user_id' }
      )
      .then(({ error }) => {
        if (error) {
          // Bewusst still: schlimmstenfalls erscheint die Feier beim nächsten
          // Öffnen noch einmal — besser als den Feier-Moment mit einem Toast
          // zu stören.
          console.warn('Momentum: Gesehen-Wert konnte nicht gespeichert werden', error)
        }
      })
  }, [groupId, userId, momentum])

  return { momentum, pendingMilestone, markCelebrationSeen }
}
