'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import type { ActivityWithInitiator } from '@/lib/activity-types'

/**
 * Lädt die terminierten Aktivitäten einer Gruppe für den „Termine"-Bereich
 * (PROJ-9 / Bottom-Nav): alle Aktivitäten mit gesetztem `start_date`, die noch
 * nicht abgeschlossen sind — chronologisch (nächster Termin zuerst). Bündelt
 * damit die sonst pro Aktivität verstreute Terminfindung an einem Ort.
 */
export function useGroupSchedule(groupId: string) {
  const { user } = useAuth()
  const [activities, setActivities] = useState<ActivityWithInitiator[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchSchedule = useCallback(async () => {
    if (!user || !groupId) {
      setLoading(false)
      return
    }
    setError(null)

    const { data, error: err } = await supabase
      .from('activities')
      .select('*, initiator:profiles!initiator_id(id, display_name, avatar_url)')
      .eq('group_id', groupId)
      .not('start_date', 'is', null)
      .neq('status', 'abgeschlossen')
      .order('start_date', { ascending: true })
      .limit(100)

    if (err) {
      setError(err.message)
      setLoading(false)
      return
    }

    setActivities((data ?? []) as ActivityWithInitiator[])
    setLoading(false)
  }, [user, groupId])

  useEffect(() => {
    fetchSchedule()
  }, [fetchSchedule])

  // Realtime: Datums-/Statusänderungen sofort spiegeln.
  useEffect(() => {
    if (!groupId) return
    const channel = supabase
      .channel(`schedule:group_id=eq.${groupId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'activities', filter: `group_id=eq.${groupId}` },
        () => fetchSchedule(),
      )
      .subscribe()
    return () => {
      supabase.removeChannel(channel)
    }
  }, [groupId, fetchSchedule])

  return { activities, loading, error, refetch: fetchSchedule }
}
