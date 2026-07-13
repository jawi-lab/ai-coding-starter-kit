'use client'

import { CalendarDays, MapPin } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { useGroupShell } from '@/components/groups/GroupShellContext'
import { useGroupSchedule } from '@/hooks/useGroupSchedule'
import { formatGermanDateRange } from '@/lib/date-format'
import { KANBAN_COLUMN_LABELS } from '@/lib/activity-types'
import type { ActivityWithInitiator, KanbanStatus } from '@/lib/activity-types'

function weekday(dateOnly: string): string {
  return new Date(`${dateOnly}T00:00:00`).toLocaleDateString('de-DE', { weekday: 'short' })
}

function statusLabel(status: string): string | null {
  return (KANBAN_COLUMN_LABELS as Record<string, string>)[status] ?? null
}

function TermineCard({
  activity,
  onOpen,
}: {
  activity: ActivityWithInitiator
  onOpen: () => void
}) {
  const dateRange = formatGermanDateRange(activity.start_date, activity.end_date, {
    dateOnly: true,
    collapseEqual: true,
    year: 'numeric',
  })
  const label = statusLabel(activity.status)

  return (
    <button
      onClick={onOpen}
      className="w-full text-left bg-surface border border-line rounded-lg p-3.5 flex items-center gap-3.5
                 hover:bg-surface-2 active:scale-[0.99] transition-all"
    >
      {/* Datums-Block */}
      <div className="flex-shrink-0 w-14 h-14 rounded-md bg-primary-soft flex flex-col items-center justify-center">
        <span className="text-[10px] font-[800] tracking-[0.06em] text-primary leading-none">
          {activity.start_date ? weekday(activity.start_date) : '—'}
        </span>
        <CalendarDays className="h-5 w-5 text-primary mt-1" strokeWidth={2.2} />
      </div>

      {/* Inhalt */}
      <div className="min-w-0 flex-1">
        {dateRange && (
          <p className="text-[12.5px] font-[800] text-primary leading-tight">{dateRange}</p>
        )}
        <p className="text-[15px] font-[800] text-ink truncate leading-tight mt-0.5">
          {activity.name}
        </p>
        <div className="flex items-center gap-2 mt-1">
          {activity.location && (
            <span className="inline-flex items-center gap-1 text-[12px] text-ink-3 truncate">
              <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
              <span className="truncate">{activity.location}</span>
            </span>
          )}
          {label && (
            <span className="text-[10.5px] font-[700] tracking-[0.06em] text-ink-3 px-2 py-0.5 rounded-pill bg-surface-2 flex-shrink-0">
              {label}
            </span>
          )}
        </div>
      </div>
    </button>
  )
}

export function TermineTab() {
  const { groupId, openActivityDetail } = useGroupShell()
  const { activities, loading, error } = useGroupSchedule(groupId)

  return (
    <div className="flex-1 min-h-0 overflow-y-auto">
      <div className="max-w-5xl mx-auto w-full px-4 pb-[calc(6rem+env(safe-area-inset-bottom))] md:pb-28 pt-3">
        {error && <p className="mt-6 text-center text-[13px] text-error">{error}</p>}

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-[84px] w-full rounded-lg bg-surface" />
            ))}
          </div>
        ) : activities.length === 0 ? (
          <div className="flex flex-col items-center justify-center pt-16 gap-3 text-center px-6">
            <p className="text-[36px]">📅</p>
            <p className="text-[16px] font-[800] text-ink">Noch keine Termine</p>
            <p className="text-[13px] text-ink-3 max-w-[250px] leading-relaxed">
              Sobald für eine Aktivität ein Datum feststeht, erscheint sie hier — chronologisch
              sortiert.
            </p>
          </div>
        ) : (
          <div className="space-y-3 md:space-y-0 md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-4">
            {activities.map((a) => (
              <TermineCard key={a.id} activity={a} onOpen={() => openActivityDetail(a.id)} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
