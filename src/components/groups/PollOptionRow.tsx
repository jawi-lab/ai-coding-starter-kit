'use client'

import { Check } from 'lucide-react'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import { POLL_AVATAR_LIMIT } from '@/lib/activity-types'
import type { ActivityPollOption } from '@/lib/activity-types'

interface PollOptionRowProps {
  option: ActivityPollOption
  /** Summe aller Stimmen der Umfrage – Basis für den Anteil-Balken. */
  totalVotes: number
  currentUserId: string
  /** IDs der aktuellen Gruppenmitglieder – Abstimmende außerhalb gelten als „Ehemaliges Mitglied". */
  memberIds: Set<string>
  /** true → nur lesen (abgeschlossene Aktivität / Archiv). */
  readOnly: boolean
  pending: boolean
  onToggle: () => void
}

function avatarFallback(name: string): string {
  return name.slice(0, 1).toUpperCase()
}

export function PollOptionRow({
  option,
  totalVotes,
  currentUserId,
  memberIds,
  readOnly,
  pending,
  onToggle,
}: PollOptionRowProps) {
  const count = option.votes.length
  const selected = option.votes.some((v) => v.user_id === currentUserId)
  const share = totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0

  const visibleVoters = option.votes.slice(0, POLL_AVATAR_LIMIT)
  const overflow = count - visibleVoters.length

  const Wrapper = readOnly ? 'div' : 'button'

  return (
    <Wrapper
      {...(!readOnly && {
        type: 'button' as const,
        onClick: onToggle,
        disabled: pending,
        'aria-pressed': selected,
      })}
      className={`w-full text-left rounded-[12px] border p-3 transition-colors
        ${selected ? 'border-primary bg-primary-soft' : 'border-line bg-surface'}
        ${readOnly ? '' : 'hover:border-primary/60 disabled:opacity-60'}`}
    >
      {/* Kopf: Auswahl-Indikator · Text · Stimmenzahl */}
      <div className="flex items-start gap-2.5">
        {!readOnly && (
          <span
            className={`mt-0.5 flex-shrink-0 h-[18px] w-[18px] rounded-[6px] border flex items-center justify-center transition-colors
              ${selected ? 'bg-primary border-primary text-white' : 'border-line bg-bg'}`}
            aria-hidden
          >
            {selected && <Check className="h-3 w-3" />}
          </span>
        )}
        <p className={`flex-1 min-w-0 text-[14px] leading-snug break-words ${selected ? 'font-[700] text-ink' : 'font-[600] text-ink'}`}>
          {option.option_text}
        </p>
        <span className="flex-shrink-0 text-[12.5px] font-[700] text-ink-2 tabular-nums">
          {count}
        </span>
      </div>

      {/* Anteil-Balken */}
      <Progress
        value={share}
        className="mt-2.5 h-1.5 bg-surface-2"
        aria-label={`${share}% – ${count} ${count === 1 ? 'Stimme' : 'Stimmen'}`}
      />

      {/* Avatare der Abstimmenden */}
      {count > 0 && (
        <div className="mt-2.5 flex items-center gap-1.5">
          <div className="flex -space-x-2">
            {visibleVoters.map((vote) => {
              // „Ehemaliges Mitglied": Profil gelöscht (voter === null) ODER die Person
              // ist kein aktuelles Gruppenmitglied mehr (hat die Gruppe verlassen).
              const activeVoter = memberIds.has(vote.user_id) ? vote.voter : null
              return (
                <Avatar
                  key={vote.id}
                  className="h-6 w-6 ring-2 ring-surface"
                  title={activeVoter?.display_name ?? 'Ehemaliges Mitglied'}
                >
                  <AvatarImage src={activeVoter?.avatar_url ?? undefined} />
                  <AvatarFallback className="text-[10px] font-[700] bg-secondary-soft text-secondary">
                    {activeVoter ? avatarFallback(activeVoter.display_name) : '?'}
                  </AvatarFallback>
                </Avatar>
              )
            })}
          </div>
          {overflow > 0 && (
            <span className="text-[11.5px] font-[700] text-ink-3">+{overflow}</span>
          )}
        </div>
      )}
    </Wrapper>
  )
}
