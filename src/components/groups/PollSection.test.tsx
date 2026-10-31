import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { PollSection } from './PollSection'
import type { ActivityStatus } from '@/lib/activity-types'

vi.mock('@/hooks/useActivityPolls', () => ({
  useActivityPolls: () => ({
    polls: [],
    loading: false,
    pending: false,
    createPoll: vi.fn(),
    deletePoll: vi.fn(),
    toggleVote: vi.fn(),
  }),
}))

vi.mock('./CreatePollSheet', () => ({ CreatePollSheet: () => null }))
vi.mock('./DeletePollDialog', () => ({ DeletePollDialog: () => null }))

function renderSection(status: ActivityStatus, readOnly = false) {
  render(
    <PollSection
      activityId="a1"
      currentUserId="u1"
      isAdmin={false}
      memberCount={1}
      memberIds={new Set(['u1'])}
      status={status}
      readOnly={readOnly}
    />
  )
}

describe('PollSection Leerzustand', () => {
  it('fordert in aktiven Aktivitäten zum Starten auf', () => {
    renderSection('in_planung')
    expect(screen.getByText('Noch keine Umfragen – starte die erste!')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Umfrage starten' })).toBeInTheDocument()
  })

  it.each<[string, ActivityStatus, boolean]>([
    ['abgeschlossen', 'abgeschlossen', false],
    ['nur lesbar', 'in_planung', true],
  ])('bleibt neutral, wenn nichts möglich ist (%s)', (_, status, readOnly) => {
    renderSection(status, readOnly)
    expect(screen.getByText('Keine Umfragen')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Umfrage starten' })).not.toBeInTheDocument()
  })
})
