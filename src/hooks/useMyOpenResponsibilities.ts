'use client'

import { useCallback, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { MyOpenResponsibility } from '@/lib/activity-types'

interface UseMyOpenResponsibilitiesResult {
  responsibilities: MyOpenResponsibility[]
  loading: boolean
  error: string | null
  refetch: () => void
  markDone: (responsibilityId: string) => Promise<boolean>
}

/**
 * Gruppenübergreifend alle offenen (done = false) Verantwortlichkeiten, die dem
 * eingeloggten User zugewiesen sind — für den "Meine Aufgaben"-Abschnitt auf Home.
 * RLS begrenzt automatisch auf Gruppen, in denen der User Mitglied ist. Aktivitäten
 * im Status "abgeschlossen" werden ausgeklammert (Aufgaben dort sind erledigt/obsolet).
 */
export function useMyOpenResponsibilities(userId: string | null): UseMyOpenResponsibilitiesResult {
  const [responsibilities, setResponsibilities] = useState<MyOpenResponsibility[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    if (!userId) {
      setResponsibilities([])
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)
    const { data, error: err } = await supabase
      .from('activity_responsibilities')
      .select('id, activity_id, label, done, activity:activities!inner(id, name, group_id, status)')
      .eq('assigned_user_id', userId)
      .eq('done', false)
      .neq('activity.status', 'abgeschlossen')
      .order('created_at', { ascending: true })

    if (err) {
      setError('Aufgaben konnten nicht geladen werden.')
    } else {
      setResponsibilities((data ?? []) as unknown as MyOpenResponsibility[])
    }
    setLoading(false)
  }, [userId])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  async function markDone(responsibilityId: string): Promise<boolean> {
    // Optimistisch aus der Liste entfernen (erledigt = nicht mehr offen).
    const previous = responsibilities
    setResponsibilities((prev) => prev.filter((r) => r.id !== responsibilityId))
    const { error: err } = await supabase
      .from('activity_responsibilities')
      .update({ done: true, completed_at: new Date().toISOString() })
      .eq('id', responsibilityId)

    if (err) {
      setResponsibilities(previous) // Rollback
      return false
    }
    return true
  }

  return { responsibilities, loading, error, refetch: fetchData, markDone }
}
