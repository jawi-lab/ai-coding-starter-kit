'use client'

import { useState } from 'react'
import { Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useNotifications } from '@/hooks/useNotifications'
import { formatBadgeCount } from '@/lib/notification-types'
import { NotificationCenter } from './NotificationCenter'

/**
 * Header bell + unread badge (PROJ-12). Owns the single useNotifications
 * subscription for the screen and hands its data to the NotificationCenter it
 * opens, so there is exactly one realtime channel + fetch. The badge shows the
 * cross-group unread total, capped at "99+"; it is hidden entirely at zero.
 */
export function NotificationBell() {
  const [open, setOpen] = useState(false)
  const { notifications, loading, unreadCount, markRead, markAllRead } = useNotifications()

  const badge = formatBadgeCount(unreadCount)

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setOpen(true)}
        className="relative rounded-full h-9 w-9 text-ink-2 hover:text-ink hover:bg-surface-2"
        aria-label={
          unreadCount > 0
            ? `Benachrichtigungen, ${unreadCount} ungelesen`
            : 'Benachrichtigungen'
        }
      >
        <Bell className="h-5 w-5" />
        {badge && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-primary text-white text-[10px] font-[800] flex items-center justify-center leading-none">
            {badge}
          </span>
        )}
      </Button>

      <NotificationCenter
        open={open}
        onOpenChange={setOpen}
        notifications={notifications}
        loading={loading}
        unreadCount={unreadCount}
        onMarkRead={markRead}
        onMarkAllRead={markAllRead}
      />
    </>
  )
}
