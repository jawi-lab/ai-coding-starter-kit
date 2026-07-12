import { isNativePlatform } from '@/lib/native/platform'
import { shareIcsNative } from '@/lib/native/share-ics'

interface IcalExportOptions {
  uid: string
  summary: string
  startDate: string // YYYY-MM-DD
  endDate: string   // YYYY-MM-DD
  description?: string | null
  location?: string | null
}

/** Builds an RFC-5545 .ics document for an all-day event. Pure — no I/O. */
export function buildIcalContent(opts: IcalExportOptions): string {
  const dtstart = opts.startDate.replace(/-/g, '')

  // For all-day events DTEND is exclusive (day after last day).
  // Use UTC arithmetic to avoid off-by-one in UTC+ timezones (e.g. Germany UTC+1/+2).
  const [ey, em, ed] = opts.endDate.split('-').map(Number)
  const dtend = new Date(Date.UTC(ey, em - 1, ed + 1)).toISOString().slice(0, 10).replace(/-/g, '')

  const now = new Date().toISOString().replace(/[-:.]/g, '').slice(0, 15) + 'Z'

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Mellon//Mellon//DE',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${opts.uid}@zusammen.app`,
    `DTSTAMP:${now}`,
    `DTSTART;VALUE=DATE:${dtstart}`,
    `DTEND;VALUE=DATE:${dtend}`,
    `SUMMARY:${escapeText(opts.summary)}`,
    ...(opts.description ? [`DESCRIPTION:${escapeText(opts.description)}`] : []),
    ...(opts.location ? [`LOCATION:${escapeText(opts.location)}`] : []),
    'END:VEVENT',
    'END:VCALENDAR',
  ]

  return lines.join('\r\n')
}

/** Sanitised, safe .ics filename derived from the event title. */
export function icalFileName(summary: string): string {
  return `${summary.replace(/[^a-z0-9äöüÄÖÜß]/gi, '-').slice(0, 60)}.ics`
}

/**
 * Exports an activity as a calendar event.
 *
 * - **Web:** triggers a hidden `<a download>` to save the `.ics` file (unchanged).
 * - **Native (Capacitor):** the anchor download is silently dropped by the WebView,
 *   so the file is written to disk and offered through the native share sheet, from
 *   which the user adds it to their calendar app. See PROJ-9 Decision Log.
 */
export function exportToIcal(opts: IcalExportOptions): void {
  const content = buildIcalContent(opts)
  const filename = icalFileName(opts.summary)

  if (isNativePlatform()) {
    // Fire-and-forget: share-sheet dismissal and other failures are handled inside
    // the bridge; the web signature stays synchronous/void so callers are unchanged.
    void shareIcsNative({ content, filename, title: opts.summary })
    return
  }

  const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

function escapeText(text: string): string {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n')
}
