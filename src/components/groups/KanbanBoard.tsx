'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { KanbanColumn } from './KanbanColumn'
import { DateFinderSheet } from './DateFinderSheet'
import { ConfirmStatusDialog } from './ConfirmStatusDialog'
import { useKanbanActivities } from '@/hooks/useKanbanActivities'
import { useUpdateActivityStatus } from '@/hooks/useUpdateActivityStatus'
import type { ActivityWithInitiator } from '@/lib/activity-types'
import { KANBAN_STATUSES, KANBAN_COLUMN_LABELS } from '@/lib/activity-types'

interface KanbanBoardProps {
  groupId: string
  currentUserId: string
  isAdmin: boolean
  onOpenDetail?: (activity: ActivityWithInitiator) => void
}

type DialogState =
  | { type: 'find-date'; activity: ActivityWithInitiator }
  | { type: 'finish-planning'; activity: ActivityWithInitiator }
  | { type: 'complete'; activity: ActivityWithInitiator }
  | null

export function KanbanBoard({ groupId, currentUserId, isAdmin, onOpenDetail }: KanbanBoardProps) {
  const { activities, loading, error } = useKanbanActivities(groupId)
  const { updateStatus, loading: updating } = useUpdateActivityStatus()
  const [dialog, setDialog] = useState<DialogState>(null)

  const byStatus = KANBAN_STATUSES.reduce(
    (acc, s) => {
      acc[s] = activities.filter((a) => a.status === s)
      return acc
    },
    {} as Record<(typeof KANBAN_STATUSES)[number], ActivityWithInitiator[]>
  )

  async function handleFinishPlanning() {
    if (dialog?.type !== 'finish-planning') return
    const { error: err } = await updateStatus({
      activityId: dialog.activity.id,
      status: 'planung_abgeschlossen',
    })
    if (err) {
      toast.error(err)
    } else {
      toast.success('Planung abgeschlossen')
      setDialog(null)
    }
  }

  async function handleComplete() {
    if (dialog?.type !== 'complete') return
    const { error: err } = await updateStatus({
      activityId: dialog.activity.id,
      status: 'abgeschlossen',
    })
    if (err) {
      toast.error(err)
    } else {
      toast.success('Aktivität als abgeschlossen markiert')
      setDialog(null)
    }
  }

  const columnProps = {
    currentUserId,
    isAdmin,
    onMoveToPlanning: (a: ActivityWithInitiator) =>
      setDialog({ type: 'find-date', activity: a }),
    onConfirmFinishPlanning: (a: ActivityWithInitiator) =>
      setDialog({ type: 'finish-planning', activity: a }),
    onConfirmComplete: (a: ActivityWithInitiator) =>
      setDialog({ type: 'complete', activity: a }),
    onOpenDetail,
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full pt-16">
        <p className="text-[13px] text-error text-center">{error}</p>
      </div>
    )
  }

  const schedulingActivity =
    dialog?.type === 'find-date' ? dialog.activity : null

  return (
    <>
      {/* Mobile: shadcn Tabs (< 768px) */}
      <div className="md:hidden h-full flex flex-col">
        {loading ? (
          <LoadingSkeleton />
        ) : (
          <Tabs defaultValue="zu_planen" className="h-full flex flex-col">
            <TabsList className="flex-shrink-0 w-full h-auto bg-surface-2 rounded-[12px] p-1 gap-0.5 mb-4 grid grid-cols-4">
              {KANBAN_STATUSES.map((s) => (
                <TabsTrigger
                  key={s}
                  value={s}
                  className="text-[10px] font-[700] rounded-[9px] px-1 py-1.5 leading-tight
                             data-[state=active]:bg-surface data-[state=active]:text-ink data-[state=active]:shadow-sm
                             text-ink-3 whitespace-normal text-center"
                >
                  {KANBAN_COLUMN_LABELS[s]}
                </TabsTrigger>
              ))}
            </TabsList>

            {KANBAN_STATUSES.map((s) => (
              <TabsContent key={s} value={s} className="flex-1 overflow-y-auto mt-0 pb-6">
                <KanbanColumn
                  status={s}
                  activities={byStatus[s]}
                  {...columnProps}
                />
              </TabsContent>
            ))}
          </Tabs>
        )}
      </div>

      {/* Desktop: 4-column grid (≥ 768px) */}
      <div className="hidden md:grid md:grid-cols-4 md:gap-4 h-full overflow-hidden">
        {loading ? (
          <>
            {KANBAN_STATUSES.map((s) => (
              <div key={s} className="space-y-3">
                <Skeleton className="h-5 w-24 bg-surface rounded" />
                <Skeleton className="h-[140px] w-full bg-surface rounded-[18px]" />
                <Skeleton className="h-[140px] w-full bg-surface rounded-[18px]" />
              </div>
            ))}
          </>
        ) : (
          KANBAN_STATUSES.map((s) => (
            <KanbanColumn
              key={s}
              status={s}
              activities={byStatus[s]}
              {...columnProps}
            />
          ))
        )}
      </div>

      {/* Terminfindungs-Sheet */}
      {schedulingActivity && (
        <DateFinderSheet
          open={dialog?.type === 'find-date'}
          activityId={schedulingActivity.id}
          activityName={schedulingActivity.name}
          groupId={groupId}
          mode="schedule"
          onClose={() => setDialog(null)}
          onSuccess={() => setDialog(null)}
        />
      )}

      <ConfirmStatusDialog
        open={dialog?.type === 'finish-planning'}
        title="Planung abschließen"
        description={
          dialog?.type === 'finish-planning'
            ? `Alle Details für „${dialog.activity.name}" stehen fest?`
            : ''
        }
        confirmLabel="Planung abschließen"
        loading={updating}
        onCancel={() => setDialog(null)}
        onConfirm={handleFinishPlanning}
      />

      <ConfirmStatusDialog
        open={dialog?.type === 'complete'}
        title="Als abgeschlossen markieren"
        description={
          dialog?.type === 'complete'
            ? `„${dialog.activity.name}" hat stattgefunden?`
            : ''
        }
        confirmLabel="Abschließen"
        loading={updating}
        onCancel={() => setDialog(null)}
        onConfirm={handleComplete}
      />
    </>
  )
}

function LoadingSkeleton() {
  return (
    <div className="space-y-3 pt-2">
      {[1, 2, 3].map((i) => (
        <Skeleton key={i} className="h-[160px] w-full rounded-[18px] bg-surface" />
      ))}
    </div>
  )
}
