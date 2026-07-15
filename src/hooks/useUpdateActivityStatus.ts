'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { checkBadgeToast } from '@/lib/badge-toasts'
import type { KanbanStatus } from '@/lib/activity-types'

interface UpdateStatusInput {
  activityId: string
  status: KanbanStatus
  startDate?: string | null
  endDate?: string | null
}

interface UseUpdateActivityStatusResult {
  updateStatus: (input: UpdateStatusInput) => Promise<{ error: string | null }>
  loading: boolean
}

export function useUpdateActivityStatus(): UseUpdateActivityStatusResult {
  const [loading, setLoading] = useState(false)

  async function updateStatus({
    activityId,
    status,
    startDate,
    endDate,
  }: UpdateStatusInput): Promise<{ error: string | null }> {
    setLoading(true)
    const update: Record<string, unknown> = { status }
    if (startDate !== undefined) update.start_date = startDate
    if (endDate !== undefined) update.end_date = endDate

    const { error } = await supabase
      .from('activities')
      .update(update)
      .eq('id', activityId)

    setLoading(false)
    if (error) return { error: 'Statuswechsel fehlgeschlagen. Bitte erneut versuchen.' }

    // Abschluss kann ✅ Immer dabei der abschließenden Person erhöhen (PROJ-16);
    // andere Mitwirkende sehen ihre neue Stufe später im Profil („Neu"), Toast
    // gibt es nur auf dem auslösenden Gerät (Spec).
    if (status === 'abgeschlossen') {
      checkBadgeToast('immer_dabei')
    }
    return { error: null }
  }

  return { updateStatus, loading }
}
