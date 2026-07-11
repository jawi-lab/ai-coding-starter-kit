'use client'

import { Switch } from '@/components/ui/switch'
import { Skeleton } from '@/components/ui/skeleton'
import { isNativePlatform } from '@/lib/native/platform'
import { EVENT_META, NOTIFICATION_EVENTS } from '@/lib/notification-types'
import { useNotificationPreferences } from '@/hooks/useNotificationPreferences'
import { PushNotificationSection } from './PushNotificationSection'

/**
 * PROJ-12 notification settings — the single "Benachrichtigungen" region in the
 * profile. On native it embeds the existing OS push activation (PROJ-10) on top,
 * then shows the per-type matrix. In-app is intentionally not switchable (always-on
 * history), so the matrix only governs the "loud" channels: Push (native only) and
 * E-Mail (everywhere). Missing prefs read as push-on / email-off; toggles save
 * optimistically with rollback + a toast on failure (handled in the hook).
 */
export function NotificationPreferencesSection() {
  const { preferences, loading, savingKey, toggle, toggleAll } = useNotificationPreferences()
  const showPush = isNativePlatform()

  // "Alle an"-Zustand pro Kanal für den Master-Schalter.
  const allPush = NOTIFICATION_EVENTS.every((e) => preferences[e].push_enabled)
  const allEmail = NOTIFICATION_EVENTS.every((e) => preferences[e].email_enabled)

  return (
    <div className="space-y-4">
      <h3 className="text-[12px] font-[800] text-ink-2 uppercase tracking-[0.06em]">
        Benachrichtigungen
      </h3>

      {/* OS push activation (native only, PROJ-10) — headingless under this section. */}
      {showPush && <PushNotificationSection hideHeading />}

      <div>
        <p className="text-[12px] text-ink-3 mb-2">
          Wähle pro Ereignis, worüber du zusätzlich benachrichtigt wirst. Dein
          Posteingang (die Glocke) erhält immer alles.
        </p>

        {/* Column headers align with the fixed-width switch columns below. */}
        <div className="flex items-center gap-3 pb-1.5">
          <div className="flex-1" />
          {showPush && (
            <span className="w-11 text-center text-[10px] font-[800] text-ink-3 uppercase tracking-[0.06em]">
              Push
            </span>
          )}
          <span className="w-11 text-center text-[10px] font-[800] text-ink-3 uppercase tracking-[0.06em]">
            E-Mail
          </span>
        </div>

        {/* Master-Schalter: aktiviert/deaktiviert alle Ereignisse eines Kanals. */}
        {!loading && (
          <div className="flex items-center gap-3 py-2.5 border-y border-line">
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-[800] text-ink">Alle Benachrichtigungen</p>
              <p className="text-[11px] text-ink-3 leading-snug">
                Schaltet jede Zeile darunter gemeinsam an oder aus
              </p>
            </div>

            {showPush && (
              <div className="w-11 flex justify-center">
                <Switch
                  checked={allPush}
                  onCheckedChange={(v) => toggleAll('push', v)}
                  disabled={savingKey === 'all:push'}
                  aria-label="Alle Push-Benachrichtigungen"
                />
              </div>
            )}

            <div className="w-11 flex justify-center">
              <Switch
                checked={allEmail}
                onCheckedChange={(v) => toggleAll('email', v)}
                disabled={savingKey === 'all:email'}
                aria-label="Alle E-Mail-Benachrichtigungen"
              />
            </div>
          </div>
        )}

        {loading ? (
          <div className="space-y-2">
            {NOTIFICATION_EVENTS.map((event) => (
              <Skeleton key={event} className="h-10 w-full rounded-[10px] bg-surface" />
            ))}
          </div>
        ) : (
          <div className="divide-y divide-line">
            {NOTIFICATION_EVENTS.map((event) => {
              const pref = preferences[event]
              const meta = EVENT_META[event]
              return (
                <div key={event} className="flex items-center gap-3 py-2.5">
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-[700] text-ink">{meta.label}</p>
                    <p className="text-[11px] text-ink-3 leading-snug">{meta.description}</p>
                  </div>

                  {showPush && (
                    <div className="w-11 flex justify-center">
                      <Switch
                        checked={pref.push_enabled}
                        onCheckedChange={() => toggle(event, 'push')}
                        disabled={savingKey === `${event}:push`}
                        aria-label={`Push für ${meta.label}`}
                      />
                    </div>
                  )}

                  <div className="w-11 flex justify-center">
                    <Switch
                      checked={pref.email_enabled}
                      onCheckedChange={() => toggle(event, 'email')}
                      disabled={savingKey === `${event}:email`}
                      aria-label={`E-Mail für ${meta.label}`}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
