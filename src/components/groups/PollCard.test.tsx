import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { PollCard } from './PollCard'
import type { ActivityPoll, ActivityPollVote, PollProfile } from '@/lib/activity-types'

// PROJ-14 — PollCard / PollOptionRow rendering: results display + delete-icon
// visibility. Pure presentation from injected data, no Supabase / realtime.

function profile(id: string, name: string): PollProfile {
  return { id, display_name: name, avatar_url: null }
}

function vote(userId: string, optionId: string): ActivityPollVote {
  return {
    id: `v-${userId}-${optionId}`,
    option_id: optionId,
    activity_id: 'act-1',
    user_id: userId,
    created_at: '2026-07-12T00:00:00Z',
    voter: profile(userId, `User ${userId}`),
  }
}

function makePoll(overrides: Partial<ActivityPoll> = {}): ActivityPoll {
  return {
    id: 'poll-1',
    activity_id: 'act-1',
    created_by: 'u1',
    question: 'Welches Restaurant?',
    created_at: '2026-07-12T00:00:00Z',
    creator: profile('u1', 'Alice'),
    options: [
      {
        id: 'o1',
        poll_id: 'poll-1',
        activity_id: 'act-1',
        option_text: 'Pizza',
        position: 0,
        votes: [vote('u1', 'o1'), vote('u2', 'o1')],
      },
      {
        id: 'o2',
        poll_id: 'poll-1',
        activity_id: 'act-1',
        option_text: 'Sushi',
        position: 1,
        votes: [vote('u3', 'o2')],
      },
    ],
    ...overrides,
  }
}

const noop = vi.fn()

// Everyone who appears in the fixtures is a current member unless a test overrides it.
const ALL_MEMBERS = new Set(['u1', 'u2', 'u3', 'other', 'm0', 'm1', 'm2', 'm3', 'm4', 'm5', 'm6'])

function renderCard(props: Partial<React.ComponentProps<typeof PollCard>> = {}) {
  return render(
    <PollCard
      poll={makePoll()}
      currentUserId="u1"
      isAdmin={false}
      memberCount={5}
      memberIds={ALL_MEMBERS}
      readOnly={false}
      pending={new Set()}
      onToggleVote={noop}
      onRequestDelete={noop}
      {...props}
    />
  )
}

describe('PollCard — results display (PROJ-14)', () => {
  it('shows the question, creator and participation ("X von Y … abgestimmt")', () => {
    renderCard()
    expect(screen.getByText('Welches Restaurant?')).toBeInTheDocument()
    // 3 distinct voters (u1, u2, u3) out of 5 members.
    expect(screen.getByText(/von Alice/)).toHaveTextContent('3 von 5 Mitgliedern haben abgestimmt')
  })

  it('uses the singular form when exactly one member voted', () => {
    const poll = makePoll({
      options: [
        {
          id: 'o1',
          poll_id: 'poll-1',
          activity_id: 'act-1',
          option_text: 'Pizza',
          position: 0,
          votes: [vote('u1', 'o1')],
        },
        { id: 'o2', poll_id: 'poll-1', activity_id: 'act-1', option_text: 'Sushi', position: 1, votes: [] },
      ],
    })
    renderCard({ poll })
    expect(screen.getByText(/1 von 5 Mitglied hat abgestimmt/)).toBeInTheDocument()
  })

  it('marks the option the current user voted for as selected (aria-pressed)', () => {
    renderCard() // u1 voted for o1 (Pizza)
    const pizza = screen.getByRole('button', { name: /Pizza/ })
    expect(pizza).toHaveAttribute('aria-pressed', 'true')
    const sushi = screen.getByRole('button', { name: /Sushi/ })
    expect(sushi).toHaveAttribute('aria-pressed', 'false')
  })

  it('labels a voter who left the group as "Ehemaliges Mitglied"', () => {
    // u2 voted for Pizza but is no longer a current member.
    renderCard({ memberIds: new Set(['u1', 'u3']) })
    expect(screen.getByTitle('Ehemaliges Mitglied')).toBeInTheDocument()
  })

  it('labels the creator as "Ehemaliges Mitglied" once they leave the group', () => {
    // Alice (u1) created the poll but is no longer a member.
    renderCard({ currentUserId: 'u3', memberIds: new Set(['u2', 'u3']) })
    expect(screen.getByText(/von Ehemaliges Mitglied/)).toBeInTheDocument()
  })

  it('collapses more than five voters into a "+N" summary', () => {
    const many = Array.from({ length: 7 }, (_, i) => vote(`m${i}`, 'o1'))
    const poll = makePoll({
      options: [
        { id: 'o1', poll_id: 'poll-1', activity_id: 'act-1', option_text: 'Pizza', position: 0, votes: many },
        { id: 'o2', poll_id: 'poll-1', activity_id: 'act-1', option_text: 'Sushi', position: 1, votes: [] },
      ],
    })
    renderCard({ poll })
    // 5 avatars shown, 2 folded into "+2".
    expect(screen.getByText('+2')).toBeInTheDocument()
  })
})

describe('PollCard — delete affordance (PROJ-14)', () => {
  it('shows the delete icon to the poll creator', () => {
    renderCard({ currentUserId: 'u1' }) // creator === u1
    expect(screen.getByRole('button', { name: 'Umfrage löschen' })).toBeInTheDocument()
  })

  it('shows the delete icon to a group admin who is not the creator', () => {
    renderCard({ currentUserId: 'other', isAdmin: true })
    expect(screen.getByRole('button', { name: 'Umfrage löschen' })).toBeInTheDocument()
  })

  it('hides the delete icon from a non-creator, non-admin member', () => {
    renderCard({ currentUserId: 'other', isAdmin: false })
    expect(screen.queryByRole('button', { name: 'Umfrage löschen' })).toBeNull()
  })

  it('read-only mode hides delete and renders options as non-interactive', () => {
    renderCard({ readOnly: true, currentUserId: 'u1' })
    expect(screen.queryByRole('button', { name: 'Umfrage löschen' })).toBeNull()
    // Options are plain divs in read-only mode → no option buttons.
    expect(screen.queryByRole('button', { name: /Pizza/ })).toBeNull()
    expect(screen.getByText('Pizza')).toBeInTheDocument()
  })
})
