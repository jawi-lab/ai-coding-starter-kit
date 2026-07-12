'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import type {
  ActivityPoll,
  ActivityPollOption,
  CreatePollInput,
} from '@/lib/activity-types'

interface UseActivityPollsResult {
  polls: ActivityPoll[]
  loading: boolean
  error: string | null
  /** in-flight Options-IDs, damit schnelle Doppel-Taps ignoriert werden */
  pending: Set<string>
  createPoll: (input: CreatePollInput) => Promise<boolean>
  deletePoll: (pollId: string) => Promise<boolean>
  toggleVote: (option: ActivityPollOption, currentlyVoted: boolean) => Promise<void>
}

// Nested-Select: Umfrage → Optionen → Stimmen → Abstimmenden-Profil.
// Die FK-Namen müssen mit der /backend-Migration übereinstimmen.
const POLL_SELECT = `
  id, activity_id, created_by, question, created_at,
  creator:profiles!activity_polls_created_by_fkey(id, display_name, avatar_url),
  options:activity_poll_options(
    id, poll_id, activity_id, option_text, position,
    votes:activity_poll_votes(
      id, option_id, activity_id, user_id, created_at,
      voter:profiles!activity_poll_votes_user_id_fkey(id, display_name, avatar_url)
    )
  )
`

export function useActivityPolls(activityId: string | null): UseActivityPollsResult {
  const { user, profile } = useAuth()
  const [polls, setPolls] = useState<ActivityPoll[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState<Set<string>>(new Set())
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null)

  const fetchPolls = useCallback(async () => {
    if (!activityId) return
    setLoading(true)
    setError(null)
    const { data, error: err } = await supabase
      .from('activity_polls')
      .select(POLL_SELECT)
      .eq('activity_id', activityId)
      .order('created_at', { ascending: false })

    if (err) {
      setError('Umfragen konnten nicht geladen werden.')
    } else {
      // Optionen client-seitig nach Position sortieren (Reihenfolge wie eingegeben).
      const normalized = ((data ?? []) as unknown as ActivityPoll[]).map((poll) => ({
        ...poll,
        options: [...(poll.options ?? [])].sort((a, b) => a.position - b.position),
      }))
      setPolls(normalized)
    }
    setLoading(false)
  }, [activityId])

  useEffect(() => {
    if (!activityId) {
      setPolls([])
      return
    }

    fetchPolls()

    // Ein Kanal pro Aktivität, live auf allen drei Umfrage-Tabellen (nach
    // activity_id gefiltert) – konsistent mit useActivityComments (PROJ-6).
    const channel = supabase
      .channel(`polls:${activityId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'activity_polls', filter: `activity_id=eq.${activityId}` },
        () => fetchPolls()
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'activity_poll_options', filter: `activity_id=eq.${activityId}` },
        () => fetchPolls()
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'activity_poll_votes', filter: `activity_id=eq.${activityId}` },
        () => fetchPolls()
      )
      .subscribe()

    channelRef.current = channel

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current)
        channelRef.current = null
      }
    }
  }, [activityId, fetchPolls])

  const createPoll = useCallback(
    async (input: CreatePollInput): Promise<boolean> => {
      if (!user) return false

      const { data: pollRow, error: pollErr } = await supabase
        .from('activity_polls')
        .insert({
          activity_id: input.activity_id,
          created_by: user.id,
          question: input.question,
        })
        .select('id')
        .single()

      if (pollErr || !pollRow) return false

      const optionRows = input.options.map((text, index) => ({
        poll_id: pollRow.id,
        activity_id: input.activity_id,
        option_text: text,
        position: index,
      }))

      const { error: optErr } = await supabase
        .from('activity_poll_options')
        .insert(optionRows)

      if (optErr) {
        // Verwaiste (optionslose) Umfrage wieder entfernen.
        await supabase.from('activity_polls').delete().eq('id', pollRow.id)
        return false
      }

      await fetchPolls()
      return true
    },
    [user, fetchPolls]
  )

  const deletePoll = useCallback(
    async (pollId: string): Promise<boolean> => {
      const { error: err } = await supabase.from('activity_polls').delete().eq('id', pollId)
      if (err) return false
      await fetchPolls()
      return true
    },
    [fetchPolls]
  )

  const toggleVote = useCallback(
    async (option: ActivityPollOption, currentlyVoted: boolean): Promise<void> => {
      if (!user || pending.has(option.id)) return

      // Snapshot für Rollback bei Fehler.
      const snapshot = polls

      // Optimistisches Update: Stimme lokal hinzufügen/entfernen.
      setPolls((prev) =>
        prev.map((poll) => {
          if (poll.id !== option.poll_id) return poll
          return {
            ...poll,
            options: poll.options.map((opt) => {
              if (opt.id !== option.id) return opt
              if (currentlyVoted) {
                return { ...opt, votes: opt.votes.filter((v) => v.user_id !== user.id) }
              }
              return {
                ...opt,
                votes: [
                  ...opt.votes,
                  {
                    id: `optimistic-${opt.id}-${user.id}`,
                    option_id: opt.id,
                    activity_id: opt.activity_id,
                    user_id: user.id,
                    created_at: new Date().toISOString(),
                    voter: profile
                      ? {
                          id: profile.id,
                          display_name: profile.display_name,
                          avatar_url: profile.avatar_url,
                        }
                      : null,
                  },
                ],
              }
            }),
          }
        })
      )

      setPending((prev) => new Set(prev).add(option.id))

      let err: { message: string; code?: string } | null = null
      if (currentlyVoted) {
        const { error: delErr } = await supabase
          .from('activity_poll_votes')
          .delete()
          .eq('option_id', option.id)
          .eq('user_id', user.id)
        err = delErr
      } else {
        const { error: insErr } = await supabase.from('activity_poll_votes').insert({
          option_id: option.id,
          activity_id: option.activity_id,
          user_id: user.id,
        })
        err = insErr
      }

      setPending((prev) => {
        const next = new Set(prev)
        next.delete(option.id)
        return next
      })

      if (err) {
        // Rollback auf den Stand vor dem Tap.
        setPolls(snapshot)
        // Postgres-Code mitreichen, damit PollSection den 23503-Fall (Umfrage
        // gelöscht) von generischen Fehlern unterscheiden kann.
        const wrapped = new Error(err.message) as Error & { code?: string }
        wrapped.code = err.code
        throw wrapped
      }
    },
    [user, profile, pending, polls]
  )

  return { polls, loading, error, pending, createPoll, deletePoll, toggleVote }
}
