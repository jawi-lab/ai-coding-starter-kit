'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import {
  availableWrappedYears,
  isCurrentYearWrappedLive,
  type DatedActivity,
} from '@/lib/wrapped'

export interface WrappedAvailability {
  /** Alle Jahrgänge mit verfügbarem Rückblick (neueste zuerst) — fürs Archiv. */
  availableYears: number[]
  /** Zeigt die Gruppe im laufenden Jahr JETZT den Teaser-Banner (Dezember, ≥ 3)? */
  currentYearLive: boolean
  /** Laufendes Kalenderjahr (lokal) — Banner öffnet den Rückblick dieses Jahres. */
  currentYear: number
  loading: boolean
}

/**
 * Verfügbarkeit des Mellon Rückblicks (PROJ-18) — die leichte Vorab-Prüfung.
 *
 * Lädt nur die abgeschlossenen Aktivitäten der Gruppe (Datumsfelder), leitet
 * daraus die Jahres-Verfügbarkeit rein clientseitig ab und hält die Zählung per
 * Realtime aktuell (Live-Berechnung bis Jahresende, konsistent mit PROJ-15).
 * RLS deckt die Sicherheit ab — nur Mitglieder erhalten überhaupt Zeilen.
 *
 * Bewusst getrennt vom schweren `useGroupWrapped`: Banner und Archiv-Eintrag
 * brauchen nur diese Zusammenfassung; die vollen Slide-Daten lädt erst der
 * Story-Viewer beim Öffnen.
 */
export function useWrappedAvailability(groupId: string): WrappedAvailability {
  const [completed, setCompleted] = useState<DatedActivity[]>([])
  // Ladezustand wird abgeleitet, nicht im Effect gesetzt: `setLoading(true)` direkt im
  // Effect-Body löst eine zusätzliche Render-Runde aus (react-hooks/set-state-in-effect).
  // Gemerkt wird stattdessen, für welche Gruppe die Daten zuletzt eintrafen — wechselt
  // groupId, ist `loading` schon im selben Render wieder true.
  const [loadedFor, setLoadedFor] = useState<string | null>(null)

  useEffect(() => {
    if (!groupId) return
    let cancelled = false

    // Ladefunktion bewusst im Effect statt als useCallback: so sieht React, dass
    // vor dem ersten `await` nichts synchron in den State schreibt.
    const fetchCompleted = async () => {
      const { data, error } = await supabase
        .from('activities')
        .select('start_date, completed_at, created_at')
        .eq('group_id', groupId)
        .eq('status', 'abgeschlossen')

      if (cancelled) return
      setCompleted(error || !data ? [] : (data as DatedActivity[]))
      setLoadedFor(groupId)
    }

    fetchCompleted()

    // Schließt/löscht irgendwer eine Aktivität, kann der Banner erscheinen oder
    // verschwinden (Live-Berechnung). Gefiltert auf die Gruppe wie beim Board.
    const channel = supabase
      .channel(`wrapped-availability:${groupId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'activities', filter: `group_id=eq.${groupId}` },
        () => fetchCompleted(),
      )
      .subscribe()

    return () => {
      cancelled = true
      supabase.removeChannel(channel)
    }
  }, [groupId])

  const now = new Date()
  return {
    loading: loadedFor !== groupId,
    availableYears: availableWrappedYears(completed, now),
    currentYearLive: isCurrentYearWrappedLive(completed, now),
    currentYear: now.getFullYear(),
  }
}
