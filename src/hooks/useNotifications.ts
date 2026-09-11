'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import type { RealtimeChannel } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import type { Database } from '@/lib/database.types'

export type NotificationRow = Database['public']['Tables']['notifications']['Row']

/** Most recent N shown in the center — the server prunes to 30 days (/backend). */
const FETCH_LIMIT = 100

const NO_NOTIFICATIONS: NotificationRow[] = []

/**
 * PROJ-12 in-app inbox. Loads the user's cross-group notification history, keeps a
 * Supabase Realtime subscription open (filtered to their own rows) so new entries
 * appear live and the badge counts up without a reload, and exposes read-state
 * mutations. On reconnect / re-open the initial fetch re-runs, so a dropped socket
 * never leaves a notification permanently invisible.
 *
 * Degrades cleanly before /backend creates the table: a failed query just yields an
 * empty inbox (badge 0), never a crash.
 */
export function useNotifications() {
  const { user } = useAuth()
  const [loadedNotifications, setNotifications] = useState<NotificationRow[]>([])
  // Der Posteingang gehört zu genau einem Konto: statt ihn beim Abmelden im
  // Effect zurückzusetzen (zusätzliche Render-Runde), gilt er nur für das
  // Konto, für das er geladen wurde.
  const [loadedFor, setLoadedFor] = useState<string | null>(null)
  const channelRef = useRef<RealtimeChannel | null>(null)

  const userId = user?.id ?? null

  const isCurrent = !!userId && loadedFor === userId
  const notifications = isCurrent ? loadedNotifications : NO_NOTIFICATIONS
  const loading = !!userId && !isCurrent

  const fetchNotifications = useCallback(async () => {
    // Ohne Konto gibt es nichts zu laden; der Posteingang ist dann ohnehin leer
    // (siehe `notifications` oben).
    if (!userId) return
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(FETCH_LIMIT)

    // Fertig geladen — auch im Fehlerfall (die Tabelle kann fehlen, wenn das
    // Frontend vor dem Backend deployt wurde, oder das Netz war kurz weg).
    setLoadedFor(userId)
    if (error) return
    setNotifications(data ?? [])
  }, [userId])

  useEffect(() => {
    if (!userId) return

    // Start hinter der await-Grenze: kein synchrones setState im Effect-Body.
    void (async () => {
      await fetchNotifications()
    })()

    const channel = supabase
      .channel(`notifications:${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        () => {
          fetchNotifications()
        },
      )
      .subscribe()

    channelRef.current = channel

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current)
        channelRef.current = null
      }
    }
  }, [userId, fetchNotifications])

  const unreadCount = notifications.reduce((n, item) => (item.read ? n : n + 1), 0)

  /** Marks one entry read. Optimistic; a failed write is re-synced by the next fetch. */
  const markRead = useCallback(
    async (id: string) => {
      setNotifications((prev) =>
        prev.map((item) => (item.id === id ? { ...item, read: true } : item)),
      )
      await supabase.from('notifications').update({ read: true }).eq('id', id)
    },
    [],
  )

  /** Marks every unread entry read (clears the badge). Optimistic. */
  const markAllRead = useCallback(async () => {
    if (!userId) return
    const hadUnread = notifications.some((item) => !item.read)
    if (!hadUnread) return
    setNotifications((prev) => prev.map((item) => ({ ...item, read: true })))
    await supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', userId)
      .eq('read', false)
  }, [userId, notifications])

  return { notifications, loading, unreadCount, markRead, markAllRead, refetch: fetchNotifications }
}
