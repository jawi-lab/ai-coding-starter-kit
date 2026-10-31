'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { toast } from 'sonner'
import { Skeleton } from '@/components/ui/skeleton'
import { useActivityPolls } from '@/hooks/useActivityPolls'
import { PollCard } from './PollCard'
import { CreatePollSheet } from './CreatePollSheet'
import { DeletePollDialog } from './DeletePollDialog'
import type { ActivityPoll, ActivityPollOption, ActivityStatus } from '@/lib/activity-types'

interface PollSectionProps {
  activityId: string
  currentUserId: string
  isAdmin: boolean
  memberCount: number
  /** IDs der aktuellen Gruppenmitglieder – für das „Ehemaliges Mitglied"-Label. */
  memberIds: Set<string>
  status: ActivityStatus
  readOnly?: boolean
}

export function PollSection({
  activityId,
  currentUserId,
  isAdmin,
  memberCount,
  memberIds,
  status,
  readOnly = false,
}: PollSectionProps) {
  const { polls, loading, pending, createPoll, deletePoll, toggleVote } =
    useActivityPolls(activityId)

  const [createOpen, setCreateOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<ActivityPoll | null>(null)

  // Umfragen gibt es erst ab "zu_planen"; bei "vorschlag" läuft das Vorschlags-Voting (PROJ-4).
  if (status === 'vorschlag') return null

  // Bei abgeschlossenen Aktivitäten (oder im Archiv) sind Umfragen nur lesbar.
  const canInteract = !readOnly && status !== 'abgeschlossen'

  async function handleToggleVote(option: ActivityPollOption, currentlyVoted: boolean) {
    try {
      await toggleVote(option, currentlyVoted)
    } catch (e) {
      // FK-Verletzung (23503) beim Insert ⇒ die Option/Umfrage wurde zwischenzeitlich
      // gelöscht. Realtime entfernt die Karte gleich; hier der passende Hinweis.
      const code = (e as { code?: string } | null)?.code
      if (code === '23503') {
        toast.error('Diese Umfrage wurde gelöscht.')
      } else {
        toast.error('Deine Stimme konnte nicht gespeichert werden.')
      }
    }
  }

  async function handleCreate(question: string, options: string[]): Promise<boolean> {
    return createPoll({ activity_id: activityId, question, options })
  }

  async function handleDelete() {
    if (!deleteTarget) return
    const ok = await deletePoll(deleteTarget.id)
    setDeleteTarget(null)
    if (!ok) toast.error('Umfrage konnte nicht gelöscht werden.')
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-[15px] font-[700] text-ink">
          Umfragen
        </h3>
        {canInteract && polls.length > 0 && (
          <button
            onClick={() => setCreateOpen(true)}
            className="flex items-center gap-1.5 text-[13px] font-[700] text-primary hover:text-primary/80 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Umfrage starten
          </button>
        )}
      </div>

      {loading ? (
        <div className="space-y-2">
          {[1, 2].map((i) => (
            <Skeleton key={i} className="h-[120px] w-full rounded-[16px] bg-surface" />
          ))}
        </div>
      ) : polls.length === 0 ? (
        <div className="space-y-1">
          <p className="text-[13px] text-ink-3">
            {canInteract ? 'Noch keine Umfragen – starte die erste!' : 'Keine Umfragen'}
          </p>
          {canInteract && (
            <button
              onClick={() => setCreateOpen(true)}
              className="flex items-center gap-2 min-h-10 text-[13px] font-[700] text-primary hover:text-primary/80 transition-[color,transform] active:scale-[0.97]"
            >
              <Plus className="h-4 w-4" />
              Umfrage starten
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {polls.map((poll) => (
            <PollCard
              key={poll.id}
              poll={poll}
              currentUserId={currentUserId}
              isAdmin={isAdmin}
              memberCount={memberCount}
              memberIds={memberIds}
              readOnly={!canInteract}
              pending={pending}
              onToggleVote={handleToggleVote}
              onRequestDelete={setDeleteTarget}
            />
          ))}
        </div>
      )}

      <CreatePollSheet
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onSubmit={handleCreate}
      />

      <DeletePollDialog
        open={!!deleteTarget}
        question={deleteTarget?.question ?? ''}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />
    </div>
  )
}
