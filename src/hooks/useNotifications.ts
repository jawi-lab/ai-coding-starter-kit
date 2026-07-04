'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import type { RealtimeChannel } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import type { Database } from '@/lib/database.types'

export type NotificationRow = Database['public']['Tables']['notifications']['Row']

/** Most recent N shown in the center — the server prunes to 30 days (/backend). */
const FETCH_LIMIT = 100

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
  const [notifications, setNotifications] = useState<NotificationRow[]>([])
  const [loading, setLoading] = useState(true)
  const channelRef = useRef<RealtimeChannel | null>(null)

  const userId = user?.id ?? null

  const fetchNotifications = useCallback(async () => {
    if (!userId) {
      setNotifications([])
      setLoading(false)
      return
    }
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(FETCH_LIMIT)

    if (error) {
      // Table may not exist yet (frontend built before backend) or transient
      // network error — keep the UI alive with whatever we already have.
      setLoading(false)
      return
    }
    setNotifications(data ?? [])
    setLoading(false)
  }, [userId])

  useEffect(() => {
    if (!userId) {
      setNotifications([])
      setLoading(false)
      return
    }

    setLoading(true)
    fetchNotifications()

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
