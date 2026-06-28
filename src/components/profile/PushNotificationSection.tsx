'use client'

import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Bell, BellOff, CheckCircle2, Settings } from 'lucide-react'
import { usePushPermission } from '@/hooks/usePushPermission'

/**
 * Profile push toggle (PROJ-10). The onboarding soft-ask runs only once, so this
 * is the way to enable push later. Behaviour by OS permission state:
 *  - prompt / prompt-with-rationale → "Aktivieren" triggers the OS dialog.
 *  - granted                        → confirmation, nothing to do.
 *  - denied (permanent)             → the OS dialog can't reappear; guide the user
 *                                     to the system settings instead of a dead end.
 * Renders nothing on the web, where push does not exist.
 */
export function PushNotificationSection() {
  const { state, enabling, enable } = usePushPermission()

  if (state === 'unsupported') return null

  const canPrompt = state === 'prompt' || state === 'prompt-with-rationale'

  return (
    <div className="space-y-3">
      <h3 className="text-[12px] font-[800] text-ink-2 uppercase tracking-[0.06em]">
        Benachrichtigungen
      </h3>

      {state === 'loading' ? (
        <Skeleton className="h-10 w-full rounded-[10px] bg-surface" />
      ) : state === 'granted' ? (
        <div className="flex items-center gap-3 bg-surface border border-line rounded-[12px] px-3.5 py-3">
          <CheckCircle2 className="h-4 w-4 text-success flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-[600] text-ink">Push aktiviert</p>
            <p className="text-[12px] text-ink-3">
              Du wirst über wichtige Gruppen-Ereignisse benachrichtigt.
            </p>
          </div>
        </div>
      ) : canPrompt ? (
        <div className="space-y-2">
          <p className="text-[13px] text-ink-3">
            Lass dich benachrichtigen, wenn etwas Wichtiges in deinen Gruppen
            passiert — neue Vorschläge, bestätigte Termine oder Erwähnungen.
          </p>
          <Button
            size="sm"
            onClick={enable}
            disabled={enabling}
            className="flex items-center gap-2 bg-primary hover:bg-primary-600 text-white text-[13px] rounded-[10px]"
          >
            <Bell className="h-4 w-4" />
            {enabling ? 'Aktivieren…' : 'Benachrichtigungen aktivieren'}
          </Button>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="flex items-start gap-3 bg-accent-soft border border-accent/30 rounded-[12px] px-3.5 py-3">
            <BellOff className="h-4 w-4 text-accent flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-[700] text-ink">Benachrichtigungen sind aus</p>
              <p className="text-[12px] text-ink-2 mt-0.5">
                Du hast Push für ZUSAMMEN deaktiviert. Aktiviere es in den
                System-Einstellungen deines Geräts wieder:
                <br />
                <span className="font-[600] text-ink">
                  Einstellungen › Mitteilungen › ZUSAMMEN
                </span>
              </p>
            </div>
          </div>
          <p className="flex items-center gap-1.5 text-[12px] text-ink-3">
            <Settings className="h-3.5 w-3.5" />
            Danach erscheinen Benachrichtigungen wieder automatisch.
          </p>
        </div>
      )}
    </div>
  )
}
