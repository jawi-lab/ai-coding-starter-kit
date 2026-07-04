'use client'

import { BellOff, CheckCheck } from 'lucide-react'
import {
  ResponsiveModal,
  ResponsiveModalContent,
  ResponsiveModalHeader,
  ResponsiveModalTitle,
  ResponsiveModalDescription,
} from '@/components/ui/responsive-modal'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import { NotificationItem } from './NotificationItem'
import type { NotificationRow } from '@/hooks/useNotifications'

interface NotificationCenterProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  notifications: NotificationRow[]
  loading: boolean
  unreadCount: number
  onMarkRead: (id: string) => void
  onMarkAllRead: () => void
}

/**
 * The in-app inbox (PROJ-12): a cross-group, newest-first list rendered in the
 * app's standard ResponsiveModal (bottom sheet on mobile, centered on desktop —
 * consistent with ProfileSheet). Shows a friendly empty state, a loading skeleton,
 * and a "mark all read" action that only appears when there is something to clear.
 * Tapping an entry marks it read and navigates, then closes the center.
 */
export function NotificationCenter({
  open,
  onOpenChange,
  notifications,
  loading,
  unreadCount,
  onMarkRead,
  onMarkAllRead,
}: NotificationCenterProps) {
  function handleNavigate(id: string) {
    onMarkRead(id)
    onOpenChange(false)
  }

  return (
    <ResponsiveModal open={open} onOpenChange={onOpenChange}>
      <ResponsiveModalContent
        size="md"
        className="h-[85dvh] md:h-[70vh] bg-bg border-line p-0 rounded-t-[24px]"
        hideClose
      >
        <ResponsiveModalHeader className="px-5 pt-5 pb-3 border-b border-line flex-shrink-0 flex-row items-center justify-between space-y-0">
          <ResponsiveModalTitle className="text-[18px] font-[800] text-ink">
            Benachrichtigungen
          </ResponsiveModalTitle>
          <ResponsiveModalDescription className="sr-only">
            Deine Benachrichtigungen aus allen Gruppen, neueste zuerst.
          </ResponsiveModalDescription>
          {unreadCount > 0 && (
            <button
              onClick={onMarkAllRead}
              className="flex items-center gap-1.5 text-[12px] font-[700] text-primary hover:text-primary-600 transition-colors"
            >
              <CheckCheck className="h-3.5 w-3.5" />
              Alle als gelesen
            </button>
          )}
        </ResponsiveModalHeader>

        {loading ? (
          <div className="px-4 py-3 space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-start gap-3">
                <Skeleton className="h-9 w-9 rounded-full bg-surface flex-shrink-0" />
                <div className="flex-1 space-y-2 py-0.5">
                  <Skeleton className="h-3 w-1/2 rounded bg-surface" />
                  <Skeleton className="h-3 w-3/4 rounded bg-surface" />
                </div>
              </div>
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 px-6 text-center">
            <span className="h-14 w-14 rounded-full bg-surface-2 flex items-center justify-center">
              <BellOff className="h-6 w-6 text-ink-3" />
            </span>
            <p className="text-[15px] font-[800] text-ink">Alles ruhig hier</p>
            <p className="text-[13px] text-ink-3 max-w-[260px]">
              Sobald in deinen Gruppen etwas passiert, erscheinen die
              Benachrichtigungen an dieser Stelle.
            </p>
          </div>
        ) : (
          <ScrollArea className="flex-1 min-h-0">
            <div className="divide-y divide-line">
              {notifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onNavigate={handleNavigate}
                />
              ))}
            </div>
          </ScrollArea>
        )}
      </ResponsiveModalContent>
    </ResponsiveModal>
  )
}
