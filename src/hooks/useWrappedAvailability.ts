'use client'

import { useCallback, useEffect, useState } from 'react'
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
  const [loading, setLoading] = useState(true)

  const fetchCompleted = useCallback(async () => {
    if (!groupId) return
    const { data, error } = await supabase
      .from('activities')
      .select('start_date, completed_at, created_at')
      .eq('group_id', groupId)
      .eq('status', 'abgeschlossen')

    if (error || !data) {
      setCompleted([])
      setLoading(false)
      return
    }
    setCompleted(data as DatedActivity[])
    setLoading(false)
  }, [groupId])

  useEffect(() => {
    if (!groupId) return
    setLoading(true)
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
      supabase.removeChannel(channel)
    }
  }, [groupId, fetchCompleted])

  const now = new Date()
  return {
    availableYears: availableWrappedYears(completed, now),
    currentYearLive: isCurrentYearWrappedLive(completed, now),
    currentYear: now.getFullYear(),
    loading,
  }
}
