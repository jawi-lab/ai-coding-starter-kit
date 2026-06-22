'use client'

import { KanbanCard } from './KanbanCard'
import type { ActivityWithInitiator } from '@/lib/activity-types'
import type { KanbanStatus } from '@/lib/activity-types'
import { KANBAN_COLUMN_LABELS } from '@/lib/activity-types'

interface KanbanColumnProps {
  status: KanbanStatus
  activities: ActivityWithInitiator[]
  currentUserId: string
  isAdmin: boolean
  onMoveToPlanning: (activity: ActivityWithInitiator) => void
  onConfirmFinishPlanning: (activity: ActivityWithInitiator) => void
  onConfirmComplete: (activity: ActivityWithInitiator) => void
}

export function KanbanColumn({
  status,
  activities,
  currentUserId,
  isAdmin,
  onMoveToPlanning,
  onConfirmFinishPlanning,
  onConfirmComplete,
}: KanbanColumnProps) {
  return (
    <div className="flex flex-col min-h-0">
      {/* Column header */}
      <div className="flex items-center gap-2 mb-3 flex-shrink-0">
        <h3 className="text-[13px] font-[800] text-ink uppercase tracking-[0.06em]">
          {KANBAN_COLUMN_LABELS[status]}
        </h3>
        <span className="text-[12px] font-[700] text-ink-3 tabular-nums">
          {activities.length}
        </span>
      </div>

      {/* Cards or empty state */}
      {activities.length === 0 ? (
        <div className="flex-1 rounded-[14px] border border-dashed border-line bg-surface-2 flex items-center justify-center py-8 px-4">
          <p className="text-[13px] text-ink-3 text-center leading-snug">
            Noch keine Aktivitäten hier
          </p>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto space-y-3 pr-0.5">
          {activities.map((activity) => (
            <KanbanCard
              key={activity.id}
              activity={activity}
              currentUserId={currentUserId}
              isAdmin={isAdmin}
              onMoveToPlanning={onMoveToPlanning}
              onConfirmFinishPlanning={onConfirmFinishPlanning}
              onConfirmComplete={onConfirmComplete}
            />
          ))}
        </div>
      )}
    </div>
  )
}
