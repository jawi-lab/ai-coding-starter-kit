'use client'

import { useEffect, useState } from 'react'
import { Plus } from 'lucide-react'
import { toast } from 'sonner'
import { EmptyIdeaIcon, EmptySearchIcon } from '@/components/icons/mellon-icons'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { MomentumBanner } from '@/components/groups/MomentumBanner'
import { MomentumLevelSheet } from '@/components/groups/MomentumLevelSheet'
import { WrappedBanner } from '@/components/wrapped/WrappedBanner'
import { useWrappedAvailability } from '@/hooks/useWrappedAvailability'
import { ProposalCard } from '@/components/groups/ProposalCard'
import { ProposalFormSheet } from '@/components/groups/ProposalFormSheet'
import { DeleteProposalDialog } from '@/components/groups/DeleteProposalDialog'
import { ResetVotesDialog } from '@/components/groups/ResetVotesDialog'
import { useActivityProposals } from '@/hooks/useActivityProposals'
import { useVote } from '@/hooks/useVote'
import { useDeleteProposal } from '@/hooks/useDeleteProposal'
import { useResetVotes } from '@/hooks/useResetVotes'
import { useAuth } from '@/contexts/AuthContext'
import { useGroupShell } from '@/components/groups/GroupShellContext'
import type { ActivityWithInitiator, DurationCategory } from '@/lib/activity-types'
import { DURATION_CATEGORY_LABELS } from '@/lib/activity-types'

type FilterValue = DurationCategory | null

const FILTER_CHIPS: { label: string; value: FilterValue }[] = [
  { label: 'Alle', value: null },
  { label: DURATION_CATEGORY_LABELS.spontan, value: 'spontan' },
  { label: DURATION_CATEGORY_LABELS.wochenende, value: 'wochenende' },
  { label: DURATION_CATEGORY_LABELS.laengerer_zeitraum, value: 'laengerer_zeitraum' },
]

export function VorschlaegeTab() {
  const { user } = useAuth()
  const { groupId, isAdmin, canCreate, memberCount, momentum, openActivityDetail, openCreateProposal, registerProposalsRefetch, openWrapped } =
    useGroupShell()

  // Mellon Rückblick (PROJ-18): saisonaler Teaser nur, wenn das laufende Jahr
  // JETZT verfügbar ist (Dezember + ≥ 3 Abschlüsse). Live-Berechnung im Hook.
  const { currentYearLive, currentYear } = useWrappedAvailability(groupId)

  const [activeFilter, setActiveFilter] = useState<FilterValue>(null)
  const [editProposal, setEditProposal] = useState<ActivityWithInitiator | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<ActivityWithInitiator | null>(null)
  const [resetTarget, setResetTarget] = useState<ActivityWithInitiator | null>(null)
  const [ladderOpen, setLadderOpen] = useState(false)

  const { proposals, myVotedIds, loading, error, filterByCategory, refetch } =
    useActivityProposals(groupId)

  // Refetch beim zentral gerenderten Create-Sheet registrieren (siehe Group-View).
  useEffect(() => {
    registerProposalsRefetch(refetch)
    return () => registerProposalsRefetch(null)
  }, [refetch, registerProposalsRefetch])
  const { toggleVote, pending: votePending } = useVote({ onError: (msg) => toast.error(msg) })
  const { deleteProposal } = useDeleteProposal()
  const { resetVotes } = useResetVotes()

  const displayed = filterByCategory(activeFilter)

  async function handleDelete() {
    if (!deleteTarget) return
    const { error: err } = await deleteProposal(deleteTarget.id)
    if (err) toast.error('Löschen fehlgeschlagen')
    else { toast.success('Vorschlag gelöscht'); refetch() }
    setDeleteTarget(null)
  }

  async function handleReset() {
    if (!resetTarget) return
    const { error: err } = await resetVotes(resetTarget.id)
    if (err) toast.error('Zurücksetzen fehlgeschlagen')
    else { toast.success('Votes zurückgesetzt'); refetch() }
    setResetTarget(null)
  }

  return (
    <div className="relative flex-1 min-h-0 flex flex-col">
      {/* Rückblick-Teaser (PROJ-18) — saisonal ganz oben, über dem Momentum-Banner.
          Erscheint nur im Dezember bei ≥ 3 Abschlüssen des laufenden Jahres. */}
      {currentYearLive && (
        <div className="flex-shrink-0">
          <div className="max-w-5xl mx-auto w-full px-4 pt-3">
            <WrappedBanner year={currentYear} onOpen={() => openWrapped(currentYear)} />
          </div>
        </div>
      )}

      {/* Momentum-Banner (PROJ-15) — über den Filter-Chips.
          Blendet sich still aus, solange die Fortschritts-Akte fehlt. */}
      {momentum && (
        <div className="flex-shrink-0">
          <div className="max-w-5xl mx-auto w-full px-4 pt-3">
            <MomentumBanner momentum={momentum} onOpenLadder={() => setLadderOpen(true)} />
          </div>
        </div>
      )}

      {/* Filter chips */}
      <div className="flex-shrink-0 border-b border-line">
        <div className="max-w-5xl mx-auto w-full px-4 py-3 flex gap-2 overflow-x-auto no-scrollbar">
          {FILTER_CHIPS.map((chip) => {
            const active = activeFilter === chip.value
            return (
              <button
                key={chip.value ?? 'all'}
                onClick={() => setActiveFilter(chip.value)}
                className={`flex-shrink-0 text-[12.5px] font-[700] px-3.5 py-1.5 rounded-pill border-[1.5px] transition-all
                  ${active
                    ? 'bg-primary text-white border-primary'
                    : 'bg-surface text-ink-2 border-line hover:border-primary/40'
                  }`}
              >
                {chip.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Proposal list — scrollt mobil unter der fixierten Glas-Bottom-Nav durch
          (Liquid-Glass wie auf Home); genug Bodenabstand für Nav + FAB. */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-5xl mx-auto w-full px-4 pb-[calc(10rem+env(safe-area-inset-bottom))] md:pb-28 pt-3">
          {error && <p className="mt-6 text-center text-[13px] text-error">{error}</p>}

          {loading ? (
            <div className="space-y-3 md:space-y-0 md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-[88px] w-full rounded-lg bg-surface" />
              ))}
            </div>
          ) : displayed.length === 0 ? (
            <EmptyProposalState hasFilter={activeFilter !== null} />
          ) : (
            <div className="space-y-3 md:space-y-0 md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-4">
              {displayed.map((p) => (
                <ProposalCard
                  key={p.id}
                  proposal={p}
                  hasVoted={myVotedIds.has(p.id)}
                  isPending={votePending.has(p.id)}
                  currentUserId={user?.id ?? ''}
                  isAdmin={isAdmin}
                  onVote={toggleVote}
                  onEdit={setEditProposal}
                  onDelete={setDeleteTarget}
                  onReset={setResetTarget}
                  onOpenDetail={(p) => openActivityDetail(p.id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Desktop-FAB (neuer Vorschlag) — unten rechts. */}
      {canCreate && (
        <div className="hidden md:block absolute bottom-[calc(1.5rem+env(safe-area-inset-bottom))] right-5 z-10">
          <Button
            onClick={openCreateProposal}
            aria-label="Vorschlag hinzufügen"
            className="h-14 w-14 p-0 bg-primary hover:bg-primary/90 text-white
                       rounded-full shadow-float
                       flex items-center justify-center active:scale-95 transition-transform"
          >
            <Plus className="h-6 w-6" strokeWidth={2.5} />
          </Button>
        </div>
      )}

      {/* Mobile-FAB (neuer Vorschlag) — schwebt unten rechts über der Liste,
          direkt über der fixierten Bottom-Nav. */}
      {canCreate && (
        <div className="md:hidden fixed bottom-[calc(5.5rem+env(safe-area-inset-bottom))] right-4 z-10">
          <Button
            onClick={openCreateProposal}
            aria-label="Vorschlag hinzufügen"
            className="h-14 w-14 p-0 bg-primary hover:bg-primary/90 text-white
                       rounded-full shadow-float
                       flex items-center justify-center active:scale-95 transition-transform"
          >
            <Plus className="h-6 w-6" strokeWidth={2.5} />
          </Button>
        </div>
      )}

      <ProposalFormSheet
        open={!!editProposal}
        onClose={() => setEditProposal(null)}
        mode="edit"
        groupId={groupId}
        memberCount={memberCount}
        proposal={editProposal ?? undefined}
        onSuccess={() => { toast.success('Vorschlag aktualisiert'); refetch(); setEditProposal(null) }}
      />

      <DeleteProposalDialog
        open={!!deleteTarget}
        proposalName={deleteTarget?.name ?? ''}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />

      <ResetVotesDialog
        open={!!resetTarget}
        proposalName={resetTarget?.name ?? ''}
        onCancel={() => setResetTarget(null)}
        onConfirm={handleReset}
      />

      {/* Level-Leiter (PROJ-15) — öffnet sich beim Antippen des Banners */}
      {momentum && (
        <MomentumLevelSheet
          open={ladderOpen}
          onClose={() => setLadderOpen(false)}
          momentum={momentum}
        />
      )}
    </div>
  )
}

function EmptyProposalState({ hasFilter }: { hasFilter: boolean }) {
  if (hasFilter) {
    return (
      <div className="flex flex-col items-center justify-center pt-16 gap-2 text-center px-6">
        <div className="h-14 w-14 rounded-full bg-surface-2 flex items-center justify-center mb-1">
          <EmptySearchIcon className="h-7 w-7 text-ink-3" />
        </div>
        <p className="text-[15px] font-[700] text-ink">Keine Vorschläge in dieser Kategorie</p>
        <p className="text-[13px] text-ink-3">Probiere einen anderen Filter.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center pt-16 gap-3 text-center px-6">
      <div className="h-14 w-14 rounded-full bg-surface-2 flex items-center justify-center">
        <EmptyIdeaIcon className="h-7 w-7 text-ink-3" />
      </div>
      <p className="text-[16px] font-[800] text-ink">Noch keine Vorschläge</p>
      <p className="text-[13px] text-ink-3 max-w-[240px] leading-relaxed">
        Schlag der Gruppe eine Aktivität vor und stimmt gemeinsam ab.
      </p>
    </div>
  )
}
