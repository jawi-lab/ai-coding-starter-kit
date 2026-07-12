'use client'

import { Trash2 } from 'lucide-react'
import { PollOptionRow } from './PollOptionRow'
import type { ActivityPoll, ActivityPollOption } from '@/lib/activity-types'

interface PollCardProps {
  poll: ActivityPoll
  currentUserId: string
  isAdmin: boolean
  memberCount: number
  /** IDs der aktuellen Gruppenmitglieder – für das „Ehemaliges Mitglied"-Label. */
  memberIds: Set<string>
  readOnly: boolean
  pending: Set<string>
  onToggleVote: (option: ActivityPollOption, currentlyVoted: boolean) => void
  onRequestDelete: (poll: ActivityPoll) => void
}

export function PollCard({
  poll,
  currentUserId,
  isAdmin,
  memberCount,
  memberIds,
  readOnly,
  pending,
  onToggleVote,
  onRequestDelete,
}: PollCardProps) {
  const totalVotes = poll.options.reduce((sum, opt) => sum + opt.votes.length, 0)

  // Beteiligung = Anzahl unterschiedlicher Mitglieder, die mind. eine Stimme abgegeben haben.
  const voterIds = new Set<string>()
  for (const opt of poll.options) {
    for (const vote of opt.votes) voterIds.add(vote.user_id)
  }
  const participation = voterIds.size

  const canDelete = !readOnly && (isAdmin || poll.created_by === currentUserId)

  // Ersteller-Name: „Ehemaliges Mitglied", wenn Profil gelöscht oder Gruppe verlassen.
  const creatorName =
    memberIds.has(poll.created_by) && poll.creator
      ? poll.creator.display_name
      : 'Ehemaliges Mitglied'

  return (
    <div className="rounded-[16px] border border-line bg-bg p-4 space-y-3">
      {/* Kopf: Frage · Ersteller · Beteiligung · Löschen */}
      <div className="flex items-start gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-[15px] font-[800] text-ink leading-snug break-words">
            {poll.question}
          </p>
          <p className="mt-1 text-[12px] text-ink-3">
            von {creatorName} ·{' '}
            {participation} von {memberCount}{' '}
            {participation === 1 ? 'Mitglied hat' : 'Mitgliedern haben'} abgestimmt
          </p>
        </div>
        {canDelete && (
          <button
            onClick={() => onRequestDelete(poll)}
            className="flex-shrink-0 h-7 w-7 flex items-center justify-center rounded-[8px] text-ink-3 hover:text-error hover:bg-error-soft transition-colors"
            aria-label="Umfrage löschen"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* Optionen */}
      <div className="space-y-2">
        {poll.options.map((option) => {
          const currentlyVoted = option.votes.some((v) => v.user_id === currentUserId)
          return (
            <PollOptionRow
              key={option.id}
              option={option}
              totalVotes={totalVotes}
              currentUserId={currentUserId}
              memberIds={memberIds}
              readOnly={readOnly}
              pending={pending.has(option.id)}
              onToggle={() => onToggleVote(option, currentlyVoted)}
            />
          )
        })}
      </div>
    </div>
  )
}
