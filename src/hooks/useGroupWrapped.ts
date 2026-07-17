'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import {
  buildWrappedSlides,
  type WrappedSlide,
  type WrappedActivity,
  type WrappedVote,
} from '@/lib/wrapped'

export interface UseGroupWrappedResult {
  /** Fertige, anzeigbare Slides (Skip-Regeln bereits angewendet) oder null beim Laden. */
  slides: WrappedSlide[] | null
  loading: boolean
  error: boolean
}

/**
 * Datensammler-Hook für den Mellon Rückblick (PROJ-18).
 *
 * Lädt beim Öffnen des Story-Viewers die Jahresdaten der Gruppe aus den
 * bestehenden, RLS-geschützten Tabellen und lässt `buildWrappedSlides` daraus
 * die fertige Slide-Liste bauen — Zähl- und Skip-Regeln stecken in der reinen
 * `wrapped.ts`, der Viewer bekommt nur anzeigbare Slides. Live-Berechnung: bei
 * jedem Öffnen frisch, kein Snapshot (konsistent mit PROJ-15).
 *
 * `year === null` lädt nichts (Viewer geschlossen).
 */
export function useGroupWrapped(groupId: string, year: number | null): UseGroupWrappedResult {
  const [slides, setSlides] = useState<WrappedSlide[] | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)

  useEffect(() => {
    if (!groupId || year === null) {
      setSlides(null)
      setLoading(false)
      setError(false)
      return
    }

    let cancelled = false
    setLoading(true)
    setError(false)

    async function load() {
      try {
        // Gruppenname, Aktivitäten, Mitglieder und Momentum-Stand parallel.
        const [groupRes, activitiesRes, membersRes, momentumRes] = await Promise.all([
          supabase.from('groups').select('name').eq('id', groupId).maybeSingle(),
          supabase
            .from('activities')
            .select('id, name, current_votes, initiator_id, status, start_date, completed_at, created_at')
            .eq('group_id', groupId),
          supabase.from('group_members').select('user_id').eq('group_id', groupId),
          supabase.from('group_momentum').select('completed_count').eq('group_id', groupId).maybeSingle(),
        ])

        if (activitiesRes.error) throw activitiesRes.error

        const activities = (activitiesRes.data ?? []) as WrappedActivity[]
        const memberIds = new Set((membersRes.data ?? []).map((m) => m.user_id))

        // Namen der aktuellen Mitglieder für die Shout-outs (ein gebündelter Abruf).
        const nameById = new Map<string, string>()
        if (memberIds.size > 0) {
          const { data: profiles } = await supabase
            .from('profiles')
            .select('id, display_name')
            .in('id', [...memberIds])
          for (const p of profiles ?? []) nameById.set(p.id, p.display_name)
        }

        // Abstimmungen der Gruppe über die Aktivitäts-IDs (activity_votes trägt
        // keine group_id) — RLS lässt nur Mitglieder die Zeilen sehen.
        let votes: WrappedVote[] = []
        const activityIds = activities.map((a) => a.id)
        if (activityIds.length > 0) {
          const { data: voteRows } = await supabase
            .from('activity_votes')
            .select('user_id, created_at')
            .in('activity_id', activityIds)
          votes = (voteRows ?? []) as WrappedVote[]
        }

        if (cancelled) return

        const built = buildWrappedSlides({
          year: year!,
          groupName: groupRes.data?.name ?? '',
          activities,
          votes,
          memberIds,
          nameById,
          momentumCount: momentumRes.data?.completed_count ?? null,
        })
        setSlides(built)
        setLoading(false)
      } catch {
        if (cancelled) return
        setError(true)
        setLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [groupId, year])

  return { slides, loading, error }
}
