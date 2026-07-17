'use client'

import { CalendarSearch, CheckCircle, CheckCheck } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { ActivityWithInitiator } from '@/lib/activity-types'
import { PLACEHOLDER_IMAGE } from '@/lib/activity-types'
import { formatGermanDateRange } from '@/lib/date-format'

interface KanbanCardProps {
  activity: ActivityWithInitiator
  currentUserId: string
  isAdmin: boolean
  onMoveToPlanning: (activity: ActivityWithInitiator) => void
  onConfirmFinishPlanning: (activity: ActivityWithInitiator) => void
  onConfirmComplete: (activity: ActivityWithInitiator) => void
  onOpenDetail?: (activity: ActivityWithInitiator) => void
  /** Drag-and-drop (desktop only). When provided and the card is manageable,
   *  the card becomes draggable to advance it to the next column. */
  onDragStartActivity?: (activity: ActivityWithInitiator) => void
  onDragEndActivity?: () => void
  isDragging?: boolean
}

/** Pro Spalte gibt es genau EINE Weiter-Aktion — direkt als Button auf der
 *  Karte statt versteckt hinter einem Drei-Punkte-Menü. */
const STATUS_ACTION: Record<string, { label: string; icon: LucideIcon }> = {
  zu_planen: { label: 'Termin finden', icon: CalendarSearch },
  in_planung: { label: 'Planung abschließen', icon: CheckCircle },
  planung_abgeschlossen: { label: 'Abschließen', icon: CheckCheck },
}

export function KanbanCard({
  activity,
  currentUserId,
  isAdmin,
  onMoveToPlanning,
  onConfirmFinishPlanning,
  onConfirmComplete,
  onOpenDetail,
  onDragStartActivity,
  onDragEndActivity,
  isDragging = false,
}: KanbanCardProps) {
  const canManage = activity.status !== 'abgeschlossen' && (isAdmin || activity.initiator_id === currentUserId)
  const coverSrc = activity.og_image_url || PLACEHOLDER_IMAGE
  const dateRange = formatGermanDateRange(activity.start_date, activity.end_date, {
    dateOnly: true,
    openEndedPrefix: 'Ab ',
  })
  const draggable = canManage && !!onDragStartActivity
  const action = canManage ? STATUS_ACTION[activity.status] : undefined

  function handleAction() {
    if (activity.status === 'zu_planen') onMoveToPlanning(activity)
    else if (activity.status === 'in_planung') onConfirmFinishPlanning(activity)
    else if (activity.status === 'planung_abgeschlossen') onConfirmComplete(activity)
  }

  return (
    <div
      draggable={draggable}
      onDragStart={(e) => {
        e.dataTransfer.effectAllowed = 'move'
        e.dataTransfer.setData('text/plain', activity.id)
        onDragStartActivity?.(activity)
      }}
      onDragEnd={() => onDragEndActivity?.()}
      className={`bg-surface border border-line rounded-lg overflow-hidden shadow-sm cursor-pointer active:scale-[0.99] transition-transform
        ${draggable ? 'md:cursor-grab md:active:cursor-grabbing' : ''}
        ${isDragging ? 'opacity-40' : ''}`}
      onClick={() => onOpenDetail?.(activity)}
    >
      {/* Cover image */}
      <div className="relative w-full h-[100px]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={coverSrc}
          alt=""
          aria-hidden
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
      </div>

      {/* Body */}
      <div className="px-3.5 py-3 flex flex-col gap-1.5">
        <p className="font-serif font-medium text-[16px] tracking-[-0.015em] text-ink leading-snug line-clamp-2">
          {activity.name}
        </p>
        <p className="text-[12px] font-semibold text-ink-2 truncate">
          {activity.initiator.display_name}
        </p>
        {dateRange && (
          <span className="inline-flex w-fit items-center gap-1.5 rounded-pill bg-primary-soft px-2.5 py-1 text-[11.5px] font-bold text-primary truncate">
            {dateRange}
          </span>
        )}

        {/* Direkte Weiter-Aktion */}
        {action && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              handleAction()
            }}
            className="mt-1.5 w-full inline-flex items-center justify-center gap-1.5 rounded-pill
                       border-[1.5px] border-primary/25 bg-primary-soft px-3 py-2
                       text-[12.5px] font-[700] text-primary transition-colors
                       hover:bg-primary hover:border-primary hover:text-white active:scale-[0.98]"
          >
            <action.icon className="h-3.5 w-3.5" />
            {action.label}
          </button>
        )}
      </div>
    </div>
  )
}
