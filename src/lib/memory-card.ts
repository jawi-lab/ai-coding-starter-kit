import type { DurationCategory } from './activity-types'
import { formatGermanDate, formatGermanDateRange } from './date-format'

/**
 * Memory Cards (PROJ-17) — die Karte ist eine abgeleitete Ansicht der
 * Aktivität. Diese Helfer bündeln die drei Ableitungen, die Album-Grid und
 * Reveal-Overlay teilen: Farbakzent je Dauer-Kategorie, Karten-Datum
 * (Termin vor Abschlussdatum) und die „Neu"-Erkennung gegen den
 * „Album zuletzt geöffnet"-Zeitstempel.
 */

export interface MemoryAccent {
  /** Akzent-Balken unter dem Cover (Rahmen-/Farbakzent laut Spec). */
  bar: string
  /** Cover-Gradient für den gestalteten Platzhalter (Styleguide-Fallback). */
  gradient: string
}

/**
 * Finale Farbzuordnung (Decision Log: „finale Farbzuordnung im /frontend"):
 * spontan → Blush (warm, spontan), Wochenende → Honiggold,
 * längerer Zeitraum → Waldgrün. Deckt sich mit den drei Cover-Gradients.
 */
export const MEMORY_ACCENTS: Record<DurationCategory, MemoryAccent> = {
  spontan: { bar: 'bg-blush', gradient: 'bg-cover-blush' },
  wochenende: { bar: 'bg-secondary', gradient: 'bg-cover-gold' },
  laengerer_zeitraum: { bar: 'bg-primary', gradient: 'bg-cover-green' },
}

/** Unbekannte/alte Kategorie-Werte fallen sicher auf Blush zurück. */
export function memoryAccent(category: string): MemoryAccent {
  return MEMORY_ACCENTS[category as DurationCategory] ?? MEMORY_ACCENTS.spontan
}

/**
 * Datum auf der Karte: Termin der Aktivität (Bereich, gleiche Tage
 * zusammengefasst), sonst Abschlussdatum — „für die Erinnerung zählt,
 * wann es stattfand" (Product Decision).
 */
export function memoryCardDate(activity: {
  start_date: string | null
  end_date: string | null
  completed_at: string | null
  created_at: string
}): string {
  const range = formatGermanDateRange(activity.start_date, activity.end_date, {
    collapseEqual: true,
    dateOnly: true,
  })
  if (range) return range
  return formatGermanDate(activity.completed_at ?? activity.created_at)
}

/**
 * „Neu" = Abschlussdatum jünger als „Album zuletzt geöffnet". Backfill-Karten
 * sind per Backend-Seeding immer älter als der Start-Zeitstempel → nie „Neu".
 */
export function isCardNew(
  completedAt: string | null,
  lastSeenAt: string | null | undefined
): boolean {
  if (!completedAt || !lastSeenAt) return false
  return new Date(completedAt).getTime() > new Date(lastSeenAt).getTime()
}
