/**
 * German date formatting helpers used across activity cards, the kanban board,
 * the archive and the date-block UI.
 *
 * The call sites historically differed in two subtle ways, both preserved here
 * via options so output stays identical:
 *  - `dateOnly`: for plain 'YYYY-MM-DD' values we append a midnight time so the
 *    string is parsed in the local timezone (avoids an off-by-one day shift).
 *    For full ISO timestamps leave it off.
 *  - `year`: some places show a 2-digit year, others the full year.
 */

type YearFormat = '2-digit' | 'numeric'

interface FormatDateOptions {
  year?: YearFormat
  dateOnly?: boolean
}

export function formatGermanDate(
  value: string,
  { year = '2-digit', dateOnly = false }: FormatDateOptions = {},
): string {
  const input = dateOnly ? `${value}T00:00:00` : value
  return new Date(input).toLocaleDateString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year,
  })
}

interface FormatRangeOptions extends FormatDateOptions {
  /** Prefix used when only a start date is given, e.g. 'Ab '. Default: none. */
  openEndedPrefix?: string
  /** When true, a range where start === end renders as a single date. */
  collapseEqual?: boolean
}

export function formatGermanDateRange(
  start: string | null,
  end: string | null,
  { openEndedPrefix = '', collapseEqual = false, ...dateOptions }: FormatRangeOptions = {},
): string | null {
  if (!start && !end) return null
  const fmt = (d: string) => formatGermanDate(d, dateOptions)
  if (start && end) {
    if (collapseEqual && start === end) return fmt(start)
    return `${fmt(start)} – ${fmt(end)}`
  }
  if (start) return `${openEndedPrefix}${fmt(start)}`
  return null
}
