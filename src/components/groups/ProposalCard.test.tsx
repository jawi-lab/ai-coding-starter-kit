import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ProposalCard } from './ProposalCard'
import type { ActivityWithInitiator } from '@/lib/activity-types'

function makeProposal(votes: number): ActivityWithInitiator {
  return {
    id: 'act-1',
    group_id: 'group-1',
    name: 'Kanutour',
    description: null,
    location: null,
    url: null,
    og_image_url: null,
    duration_category: 'tagesausflug',
    status: 'vorschlag',
    required_votes: 3,
    current_votes: votes,
    initiator_id: 'user-1',
    start_date: null,
    end_date: null,
    created_at: '2026-01-01T00:00:00Z',
    completed_at: null,
    initiator: { id: 'user-1', display_name: 'Alex', avatar_url: null },
  } as unknown as ActivityWithInitiator
}

function renderCard(
  overrides: Partial<React.ComponentProps<typeof ProposalCard>> = {},
) {
  const props = {
    proposal: makeProposal(1),
    hasVoted: false,
    isPending: false,
    currentUserId: 'user-2',
    isAdmin: false,
    onVote: vi.fn(),
    onEdit: vi.fn(),
    onDelete: vi.fn(),
    onReset: vi.fn(),
    ...overrides,
  }
  return { ...render(<ProposalCard {...props} />), props }
}

describe('ProposalCard', () => {
  it('zeigt den Server-Stand an', () => {
    renderCard()
    expect(screen.getByText('1 / 3')).toBeInTheDocument()
    expect(screen.getByLabelText('Upvoten')).toBeInTheDocument()
  })

  it('zeigt die Stimme sofort optimistisch, bevor der Server bestätigt', () => {
    const onVote = vi.fn((_id, _voted, apply) => apply('act-1', true))
    renderCard({ onVote })

    fireEvent.click(screen.getByLabelText('Upvoten'))

    expect(screen.getByText('2 / 3')).toBeInTheDocument()
    expect(screen.getByLabelText('Vote entfernen')).toBeInTheDocument()
  })

  it('übernimmt den Server-Stand, sobald er per Realtime nachkommt', () => {
    const onVote = vi.fn((_id, _voted, apply) => apply('act-1', true))
    const { rerender, props } = renderCard({ onVote })

    fireEvent.click(screen.getByLabelText('Upvoten'))
    expect(screen.getByText('2 / 3')).toBeInTheDocument()

    // Server bestätigt — gleicher Wert, jetzt aus den Props.
    rerender(<ProposalCard {...props} proposal={makeProposal(2)} hasVoted />)
    expect(screen.getByText('2 / 3')).toBeInTheDocument()
    expect(screen.getByLabelText('Vote entfernen')).toBeInTheDocument()
  })

  it('gewinnt den Server-Stand, wenn er von der optimistischen Anzeige abweicht', () => {
    const onVote = vi.fn((_id, _voted, apply) => apply('act-1', true))
    const { rerender, props } = renderCard({ onVote })

    fireEvent.click(screen.getByLabelText('Upvoten'))
    expect(screen.getByText('2 / 3')).toBeInTheDocument()

    // Jemand anderes hat gleichzeitig abgestimmt: der Server zählt 5, nicht 2.
    rerender(<ProposalCard {...props} proposal={makeProposal(5)} hasVoted />)
    expect(screen.getByText('5 / 3')).toBeInTheDocument()
  })

  it('nimmt eine Stimme optimistisch wieder zurück', () => {
    const onVote = vi.fn((_id, _voted, apply) => apply('act-1', false))
    renderCard({ proposal: makeProposal(2), hasVoted: true, onVote })

    fireEvent.click(screen.getByLabelText('Vote entfernen'))

    expect(screen.getByText('1 / 3')).toBeInTheDocument()
    expect(screen.getByLabelText('Upvoten')).toBeInTheDocument()
  })

  it('ignoriert Taps, solange eine Stimme unterwegs ist', () => {
    const onVote = vi.fn()
    renderCard({ isPending: true, onVote })

    fireEvent.click(screen.getByLabelText('Upvoten'))

    expect(onVote).not.toHaveBeenCalled()
  })
})
