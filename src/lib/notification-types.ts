/**
 * PROJ-12 shared notification metadata (client side).
 *
 * These events mirror the `PushEvent` union (send-push/logic.ts). That type lives in
 * the Deno edge function and can't be imported here, so we redeclare it — keep both
 * lists in sync. These labels/descriptions drive the per-type preference matrix; the
 * in-app inbox itself shows the server-frozen title/body.
 */

export const NOTIFICATION_EVENTS = [
  'new_proposal',
  'now_planning',
  'date_set',
  'mention',
  'responsibility',
  'umfrage_erstellt',
] as const

export type NotificationEvent = (typeof NOTIFICATION_EVENTS)[number]

/** Human-facing German copy for each event in the preferences matrix. */
export const EVENT_META: Record<
  NotificationEvent,
  { label: string; description: string }
> = {
  new_proposal: {
    label: 'Neue Vorschläge',
    description: 'Wenn jemand eine neue Aktivität vorschlägt',
  },
  now_planning: {
    label: 'In Planung',
    description: 'Wenn ein Vorschlag in die Planung wandert',
  },
  date_set: {
    label: 'Termin steht',
    description: 'Wenn ein Termin festgelegt wurde',
  },
  mention: {
    label: 'Erwähnungen',
    description: 'Wenn dich jemand in einem Kommentar erwähnt',
  },
  responsibility: {
    label: 'Aufgaben',
    description: 'Wenn du für etwas verantwortlich wirst',
  },
  umfrage_erstellt: {
    label: 'Umfragen',
    description: 'Wenn jemand eine Umfrage in einer Aktivität startet',
  },
}

/** Preference default when a user has no row for an event yet (spec: opt-in email). */
export const DEFAULT_PREFERENCE = {
  push_enabled: true,
  email_enabled: false,
} as const

/**
 * Formats the unread count for the bell badge. Exact up to 99, then "99+" so the
 * header never breaks (Badge-Kürzungsgrenze decision, /frontend). Returns '' for
 * a zero/negative count so callers can hide the badge entirely.
 */
export function formatBadgeCount(count: number): string {
  if (count <= 0) return ''
  return count > 99 ? '99+' : String(count)
}
