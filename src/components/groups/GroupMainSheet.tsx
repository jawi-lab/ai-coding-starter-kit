'use client'

import { useState } from 'react'
import { Sheet, SheetContent } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Settings, Plus, X, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import { GroupDetailSheet } from './GroupDetailSheet'
import { ProposalCard } from './ProposalCard'
import { ProposalFormSheet } from './ProposalFormSheet'
import { DeleteProposalDialog } from './DeleteProposalDialog'
import { ResetVotesDialog } from './ResetVotesDialog'
import { useActivityProposals } from '@/hooks/useActivityProposals'
import { useVote } from '@/hooks/useVote'
import { useDeleteProposal } from '@/hooks/useDeleteProposal'
import { useResetVotes } from '@/hooks/useResetVotes'
import { useAuth } from '@/contexts/AuthContext'
import type { GroupWithMeta } from '@/lib/group-types'
import type { ActivityWithInitiator, DurationCategory } from '@/lib/activity-types'
import { DURATION_CATEGORY_LABELS } from '@/lib/activity-types'

type FilterValue = DurationCategory | null

const FILTER_CHIPS: { label: string; value: FilterValue }[] = [
  { label: 'Alle', value: null },
  { label: DURATION_CATEGORY_LABELS.spontan, value: 'spontan' },
  { label: DURATION_CATEGORY_LABELS.wochenende, value: 'wochenende' },
  { label: DURATION_CATEGORY_LABELS.laengerer_zeitraum, value: 'laengerer_zeitraum' },
]

interface GroupMainSheetProps {
  group: GroupWithMeta | null
  onClose: () => void
  onGroupLeft: () => void
  onGroupDeleted: () => void
}

export function GroupMainSheet({
  group,
  onClose,
  onGroupLeft,
  onGroupDeleted,
}: GroupMainSheetProps) {
  const { user } = useAuth()
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [activeFilter, setActiveFilter] = useState<FilterValue>(null)

  // Proposal dialogs / sheets state
  const [createOpen, setCreateOpen] = useState(false)
  const [editProposal, setEditProposal] = useState<ActivityWithInitiator | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<ActivityWithInitiator | null>(null)
  const [resetTarget, setResetTarget] = useState<ActivityWithInitiator | null>(null)

  const groupId = group?.id ?? ''
  const { proposals, myVotedIds, loading, error, filterByCategory, refetch } =
    useActivityProposals(groupId)

  const { toggleVote, pending: votePending } = useVote({
    onError: (msg) => toast.error(msg),
  })
  const { deleteProposal, loading: deleting } = useDeleteProposal()
  const { resetVotes, loading: resetting } = useResetVotes()

  const isAdmin = group?.my_role === 'admin'
  const canCreate = group?.my_role === 'admin' || group?.my_role === 'editor'
  const memberCount = group?.member_count ?? 1
  const atProposalLimit = proposals.length >= memberCount

  const displayed = filterByCategory(activeFilter)

  async function handleDelete() {
    if (!deleteTarget) return
    const { error: err } = await deleteProposal(deleteTarget.id)
    if (err) {
      toast.error('Löschen fehlgeschlagen')
    } else {
      toast.success('Vorschlag gelöscht')
      refetch()
    }
    setDeleteTarget(null)
  }

  async function handleReset() {
    if (!resetTarget) return
    const { error: err } = await resetVotes(resetTarget.id)
    if (err) {
      toast.error('Zurücksetzen fehlgeschlagen')
    } else {
      toast.success('Votes zurückgesetzt')
      refetch()
    }
    setResetTarget(null)
  }

  return (
    <>
      <Sheet open={!!group} onOpenChange={(open) => !open && onClose()}>
        <SheetContent
          side="right"
          className="w-full sm:max-w-md bg-bg border-l border-line p-0 flex flex-col"
        >
          {/* Header */}
          <div className="flex-shrink-0 px-5 pt-5 pb-4 border-b border-line flex items-center gap-3">
            {/* Close */}
            <button
              onClick={onClose}
              className="h-8 w-8 rounded-[8px] flex items-center justify-center text-ink-3 hover:text-ink hover:bg-surface-2 transition-colors"
              aria-label="Schließen"
            >
              <X className="h-4 w-4" />
            </button>

            <h1 className="flex-1 text-[20px] font-[800] text-ink truncate leading-tight">
              {group?.name ?? ''}
            </h1>

            {/* Settings */}
            <button
              onClick={() => setSettingsOpen(true)}
              className="h-8 w-8 rounded-[8px] flex items-center justify-center text-ink-3 hover:text-ink hover:bg-surface-2 transition-colors"
              aria-label="Einstellungen"
            >
              <Settings className="h-4 w-4" />
            </button>
          </div>

          {/* Tab bar — Vorschläge active, others future */}
          <div className="flex-shrink-0 px-5 pt-3 pb-0 flex gap-1 border-b border-line">
            <button className="pb-2.5 px-1 text-[14px] font-[700] text-primary border-b-2 border-primary mr-2">
              Vorschläge
            </button>
            <button
              disabled
              className="pb-2.5 px-1 text-[14px] font-[600] text-ink-3 border-b-2 border-transparent cursor-not-allowed mr-2"
              title="Kommt bald"
            >
              Planung
            </button>
            <button
              disabled
              className="pb-2.5 px-1 text-[14px] font-[600] text-ink-3 border-b-2 border-transparent cursor-not-allowed"
              title="Kommt bald"
            >
              Archiv
            </button>
          </div>

          {/* Filter chips */}
          <div className="flex-shrink-0 px-5 py-3 flex gap-2 overflow-x-auto no-scrollbar">
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

          {/* Max-proposals warning */}
          {atProposalLimit && canCreate && (
            <div className="mx-5 mb-1 flex items-start gap-2 bg-accent-soft border border-accent/20 rounded-[12px] px-3 py-2.5">
              <AlertCircle className="h-4 w-4 text-accent flex-shrink-0 mt-0.5" />
              <p className="text-[12.5px] text-ink-2 leading-snug">
                Maximale Vorschlagsanzahl erreicht ({proposals.length}/{memberCount}).
                Erst wenn ein Vorschlag abgestimmt oder gelöscht wird, kannst du einen neuen erstellen.
              </p>
            </div>
          )}

          {/* Proposal list */}
          <div className="flex-1 overflow-y-auto px-5 pb-24">
            {error && (
              <p className="mt-6 text-center text-[13px] text-error">{error}</p>
            )}

            {loading ? (
              <div className="space-y-3 pt-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-[88px] w-full rounded-[18px] bg-surface" />
                ))}
              </div>
            ) : displayed.length === 0 ? (
              <EmptyProposalState
                hasFilter={activeFilter !== null}
                canCreate={canCreate}
                atLimit={atProposalLimit}
                onCreateClick={() => setCreateOpen(true)}
              />
            ) : (
              <div className="space-y-3 pt-3">
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
                  />
                ))}
              </div>
            )}
          </div>

          {/* FAB — Create Proposal */}
          {canCreate && !atProposalLimit && (
            <div className="absolute bottom-6 right-5">
              <Button
                onClick={() => setCreateOpen(true)}
                className="h-12 px-5 bg-primary hover:bg-primary-600 text-white font-[700] text-[14px]
                           rounded-pill border border-primary-600 shadow-lg gap-2"
              >
                <Plus className="h-4 w-4" />
                Vorschlag
              </Button>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Settings Sheet (existing GroupDetailSheet) */}
      <GroupDetailSheet
        groupId={settingsOpen ? groupId : null}
        onClose={() => setSettingsOpen(false)}
        onGroupLeft={() => { setSettingsOpen(false); onClose(); onGroupLeft() }}
        onGroupDeleted={() => { setSettingsOpen(false); onClose(); onGroupDeleted() }}
      />

      {/* Create Proposal Sheet */}
      <ProposalFormSheet
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        mode="create"
        groupId={groupId}
        memberCount={memberCount}
        onSuccess={() => {
          toast.success('Vorschlag erstellt')
          refetch()
        }}
      />

      {/* Edit Proposal Sheet */}
      <ProposalFormSheet
        open={!!editProposal}
        onClose={() => setEditProposal(null)}
        mode="edit"
        groupId={groupId}
        memberCount={memberCount}
        proposal={editProposal ?? undefined}
        onSuccess={() => {
          toast.success('Vorschlag aktualisiert')
          refetch()
          setEditProposal(null)
        }}
      />

      {/* Delete Dialog */}
      <DeleteProposalDialog
        open={!!deleteTarget}
        proposalName={deleteTarget?.name ?? ''}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />

      {/* Reset Dialog */}
      <ResetVotesDialog
        open={!!resetTarget}
        proposalName={resetTarget?.name ?? ''}
        onCancel={() => setResetTarget(null)}
        onConfirm={handleReset}
      />
    </>
  )
}

interface EmptyProposalStateProps {
  hasFilter: boolean
  canCreate: boolean
  atLimit: boolean
  onCreateClick: () => void
}

function EmptyProposalState({ hasFilter, canCreate, atLimit, onCreateClick }: EmptyProposalStateProps) {
  if (hasFilter) {
    return (
      <div className="flex flex-col items-center justify-center pt-16 gap-2 text-center px-6">
        <p className="text-[28px]">🔍</p>
        <p className="text-[15px] font-[700] text-ink">Keine Vorschläge in dieser Kategorie</p>
        <p className="text-[13px] text-ink-3">Probiere einen anderen Filter.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center pt-16 gap-3 text-center px-6">
      <p className="text-[36px]">💡</p>
      <p className="text-[16px] font-[800] text-ink">Noch keine Vorschläge</p>
      <p className="text-[13px] text-ink-3 max-w-[240px] leading-relaxed">
        Schlag der Gruppe eine Aktivität vor und stimmt gemeinsam ab.
      </p>
      {canCreate && !atLimit && (
        <Button
          onClick={onCreateClick}
          className="mt-2 h-11 px-6 bg-primary hover:bg-primary-600 text-white font-[700] text-[14px]
                     rounded-[12px] border border-primary-600 gap-2"
        >
          <Plus className="h-4 w-4" />
          Ersten Vorschlag erstellen
        </Button>
      )}
    </div>
  )
}
