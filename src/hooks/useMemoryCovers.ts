'use client'

import { useEffect, useRef, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { getPublicUrl } from '@/lib/storage'

const BUCKET = 'activity-photos'

/**
 * Cover-Fotos fürs Album (PROJ-17): EIN gebündelter Query pro Album-Seite holt
 * die Erinnerungsfotos aller sichtbaren Karten; pro Aktivität zählt das
 * älteste Foto (Cover-Kette laut Spec). Aktivitäten ohne Foto fehlen in der
 * Map — der Aufrufer fällt dann auf `og_image_url` bzw. den Platzhalter
 * zurück. Bereits geholte IDs werden nicht erneut angefragt („Mehr laden"
 * lädt nur die neue Seite nach).
 */
export function useMemoryCovers(activityIds: string[]): Record<string, string> {
  const [covers, setCovers] = useState<Record<string, string>>({})
  const requestedRef = useRef<Set<string>>(new Set())
  const idsKey = activityIds.join(',')

  useEffect(() => {
    const newIds = activityIds.filter((id) => !requestedRef.current.has(id))
    if (newIds.length === 0) return
    newIds.forEach((id) => requestedRef.current.add(id))

    let cancelled = false
    ;(async () => {
      const { data } = await supabase
        .from('activity_photos')
        .select('activity_id, storage_path, created_at')
        .in('activity_id', newIds)
        .order('created_at', { ascending: true })

      if (cancelled || !data || data.length === 0) return

      const next: Record<string, string> = {}
      for (const row of data as { activity_id: string; storage_path: string }[]) {
        // sortiert aufsteigend → der erste Treffer je Aktivität ist das älteste Foto
        if (!next[row.activity_id]) {
          next[row.activity_id] = getPublicUrl(BUCKET, row.storage_path)
        }
      }
      setCovers((prev) => ({ ...prev, ...next }))
    })()

    return () => {
      cancelled = true
    }
    // idsKey repräsentiert activityIds stabil (Array-Identität wechselt pro Render)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idsKey])

  return covers
}
