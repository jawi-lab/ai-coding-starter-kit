'use client'

import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import {
  DEFAULT_PREFERENCE,
  NOTIFICATION_EVENTS,
  type NotificationEvent,
} from '@/lib/notification-types'

export type NotificationChannel = 'push' | 'email'

/** In-memory shape: the two switches per event, always fully populated. */
export type PreferenceMap = Record<
  NotificationEvent,
  { push_enabled: boolean; email_enabled: boolean }
>

/** Every event at its default — the base we overlay stored rows onto. */
function defaultMap(): PreferenceMap {
  const map = {} as PreferenceMap
  for (const event of NOTIFICATION_EVENTS) {
    map[event] = { ...DEFAULT_PREFERENCE }
  }
  return map
}

/**
 * PROJ-12 per-type channel switches. Reads the user's rows (missing rows fall back
 * to push-on / email-off, matching the send-push fan-out), then toggles optimistically
 * with rollback + a German error toast if the write fails. Persisted via upsert on
 * (user_id, event) so the first change for an event creates its row.
 *
 * Degrades cleanly before /backend creates the table: the matrix simply shows the
 * defaults and toggling surfaces the failure toast without corrupting state.
 */
export function useNotificationPreferences() {
  const { user } = useAuth()
  const [preferences, setPreferences] = useState<PreferenceMap>(defaultMap)
  const [loading, setLoading] = useState(true)
  const [savingKey, setSavingKey] = useState<string | null>(null)

  const userId = user?.id ?? null

  useEffect(() => {
    let cancelled = false
    if (!userId) {
      setPreferences(defaultMap())
      setLoading(false)
      return
    }

    setLoading(true)
    supabase
      .from('notification_preferences')
      .select('event, push_enabled, email_enabled')
      .eq('user_id', userId)
      .then(({ data, error }) => {
        if (cancelled) return
        if (!error && data) {
          const next = defaultMap()
          for (const row of data) {
            if ((NOTIFICATION_EVENTS as readonly string[]).includes(row.event)) {
              next[row.event as NotificationEvent] = {
                push_enabled: row.push_enabled,
                email_enabled: row.email_enabled,
              }
            }
          }
          setPreferences(next)
        }
        setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [userId])

  const toggle = useCallback(
    async (event: NotificationEvent, channel: NotificationChannel) => {
      if (!userId) return

      const column = channel === 'push' ? 'push_enabled' : 'email_enabled'
      const previous = preferences[event]
      const nextValue = !previous[column]
      const optimistic = { ...previous, [column]: nextValue }

      setPreferences((prev) => ({ ...prev, [event]: optimistic }))
      setSavingKey(`${event}:${channel}`)

      // Upsert the full row so a first-ever change for this event writes both
      // columns at their current (default-or-changed) values, not just one.
      const { error } = await supabase.from('notification_preferences').upsert(
        {
          user_id: userId,
          event,
          push_enabled: optimistic.push_enabled,
          email_enabled: optimistic.email_enabled,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id,event' },
      )

      setSavingKey(null)

      if (error) {
        // Rollback to the pre-toggle state and tell the user.
        setPreferences((prev) => ({ ...prev, [event]: previous }))
        toast.error('Einstellung konnte nicht gespeichert werden')
      }
    },
    [userId, preferences],
  )

  /**
   * Master switch for a channel: sets the same value on ALL events at once via a
   * single batch upsert. Keeps the other channel per event untouched. Optimistic
   * with rollback + toast, mirroring `toggle()`.
   */
  const toggleAll = useCallback(
    async (channel: NotificationChannel, value: boolean) => {
      if (!userId) return

      const column = channel === 'push' ? 'push_enabled' : 'email_enabled'
      const previous = preferences
      const next = {} as PreferenceMap
      for (const event of NOTIFICATION_EVENTS) {
        next[event] = { ...previous[event], [column]: value }
      }

      setPreferences(next)
      setSavingKey(`all:${channel}`)

      const now = new Date().toISOString()
      const { error } = await supabase.from('notification_preferences').upsert(
        NOTIFICATION_EVENTS.map((event) => ({
          user_id: userId,
          event,
          push_enabled: next[event].push_enabled,
          email_enabled: next[event].email_enabled,
          updated_at: now,
        })),
        { onConflict: 'user_id,event' },
      )

      setSavingKey(null)

      if (error) {
        setPreferences(previous)
        toast.error('Einstellung konnte nicht gespeichert werden')
      }
    },
    [userId, preferences],
  )

  return { preferences, loading, savingKey, toggle, toggleAll }
}
