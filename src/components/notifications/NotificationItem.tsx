'use client'

import { AtSign, CalendarCheck, CheckSquare, KanbanSquare, Lightbulb } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { parsePushTarget, pushTargetToPath } from '@/lib/native/push'
import { formatRelativeGerman } from '@/lib/date-format'
import { cn } from '@/lib/utils'
import type { NotificationRow } from '@/hooks/useNotifications'
import type { NotificationEvent } from '@/lib/notification-types'

/** Same five events as PROJ-10, one glyph each. Fallback keeps unknown events safe. */
const EVENT_ICON: Record<NotificationEvent, LucideIcon> = {
  new_proposal: Lightbulb,
  now_planning: KanbanSquare,
  date_set: CalendarCheck,
  mention: AtSign,
  responsibility: CheckSquare,
}

interface NotificationItemProps {
  notification: NotificationRow
  /** Marks read + closes the center; navigation happens here via a full-page hop. */
  onNavigate: (id: string) => void
}

/**
 * A single inbox row. Tapping marks it read and deep-links into the right context
 * using the same {group_id, activity_id, tab} target as a PROJ-10 push tap, so both
 * paths share one navigation + "content gone" fallback (the group view handles a
 * missing group/activity). Unread rows get a stronger background + a dot.
 */
export function NotificationItem({ notification, onNavigate }: NotificationItemProps) {
  const Icon = EVENT_ICON[notification.event as NotificationEvent] ?? Lightbulb

  function handleClick() {
    onNavigate(notification.id)
    const target = parsePushTarget({
      group_id: notification.group_id,
      activity_id: notification.activity_id,
      tab: notification.tab,
    })
    if (target) window.location.href = pushTargetToPath(target)
  }

  return (
    <button
      onClick={handleClick}
      className={cn(
        'w-full flex items-start gap-3 px-4 py-3 text-left transition-colors',
        'hover:bg-surface-2 focus:outline-none focus-visible:bg-surface-2',
        !notification.read && 'bg-accent-soft/40',
      )}
    >
      <span
        className={cn(
          'flex-shrink-0 h-9 w-9 rounded-full flex items-center justify-center',
          notification.read ? 'bg-surface-2 text-ink-3' : 'bg-primary/10 text-primary',
        )}
      >
        <Icon className="h-[18px] w-[18px]" aria-hidden />
      </span>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p
            className={cn(
              'text-[13px] truncate',
              notification.read ? 'font-[600] text-ink-2' : 'font-[800] text-ink',
            )}
          >
            {notification.title}
          </p>
          {!notification.read && (
            <span className="flex-shrink-0 h-2 w-2 rounded-full bg-primary" aria-label="Ungelesen" />
          )}
        </div>
        <p className="text-[12px] text-ink-3 mt-0.5 line-clamp-2">{notification.body}</p>
        <p className="text-[11px] text-ink-3/80 mt-1">
          {formatRelativeGerman(notification.created_at)}
        </p>
      </div>
    </button>
  )
}
