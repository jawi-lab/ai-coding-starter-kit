/**
 * Mellon Rückblick (ZUSAMMEN Wrapped, PROJ-18) — reine Rechen-Datei.
 *
 * Kapselt die Jahres-, Zähl- und Skip-Regeln des Rückblicks an einer Stelle:
 * kein Supabase, kein React. So sind die kniffligen Regeln (Jahreszuordnung,
 * Gleichstände, Meilenstein-Herleitung, „welche Slide erscheint überhaupt")
 * isoliert testbar und laufen im Static Export. Der Datensammler-Hook
 * (`useGroupWrapped`) lädt nur die Rohdaten und ruft `buildWrappedSlides`.
 */

import { levelForCount, MOMENTUM_MILESTONES } from './momentum'

/** Ab so vielen abgeschlossenen Aktivitäten im Jahr gibt es einen Rückblick. */
export const MIN_COMPLETED_FOR_WRAPPED = 3

/**
 * Rückblick-„Saison": der ganze Dezember (Monat-Index 11). Ab dem 1.12. lokaler
 * Gerätezeit erscheint der Teaser-Banner des laufenden Jahres; ab dem 1.1. ist
 * das Vorjahr nur noch übers Archiv erreichbar.
 */
export const WRAPPED_SEASON_MONTH = 11

/** Bis zu so viele Gleichplatzierte werden bei einem Shout-out gemeinsam geehrt. */
export const SHOUTOUT_MAX_TIES = 3

const MONTH_NAMES_DE = [
  'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
  'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember',
] as const

export function monthNameDe(monthIndex: number): string {
  return MONTH_NAMES_DE[monthIndex] ?? ''
}

/**
 * Jahr eines Datumsstrings in lokaler Zeit. Reine Datumswerte (`YYYY-MM-DD`)
 * bekommen eine Mitternachts-Zeit angehängt, damit sie lokal statt in UTC
 * geparst werden (sonst Jahres-/Tages-Verschiebung an der Grenze) — dasselbe
 * Muster wie `date-format.ts`.
 */
function yearOfLocal(value: string): number {
  const iso = value.length === 10 ? `${value}T00:00:00` : value
  return new Date(iso).getFullYear()
}

/** Monats-Index (0–11) eines Datumsstrings in lokaler Zeit. */
function monthOfLocal(value: string): number {
  const iso = value.length === 10 ? `${value}T00:00:00` : value
  return new Date(iso).getMonth()
}

/** Datumsfelder einer Aktivität, aus denen sich Jahr & Monat ergeben. */
export interface DatedActivity {
  start_date: string | null
  completed_at: string | null
  created_at: string
}

/**
 * Das Bezugsdatum einer Aktivität für die Jahreszuordnung: Startdatum →
 * Abschluss-Zeitpunkt → Erstelldatum (Fallback-Kette laut Technical Decision).
 * So landet jede Aktivität in genau einem Jahr.
 */
function referenceDate(a: DatedActivity): string {
  return a.start_date ?? a.completed_at ?? a.created_at
}

/** Jahr, in dem eine Aktivität für den Rückblick „stattfand". */
export function wrappedYearForActivity(a: DatedActivity): number {
  return yearOfLocal(referenceDate(a))
}

/** Monat (0–11), in dem eine Aktivität „stattfand" — für die aktivster-Monat-Slide. */
export function wrappedMonthForActivity(a: DatedActivity): number {
  return monthOfLocal(referenceDate(a))
}

/** Ist `now` in der Rückblick-Saison (Dezember, lokale Gerätezeit)? */
export function isWrappedSeason(now: Date = new Date()): boolean {
  return now.getMonth() === WRAPPED_SEASON_MONTH
}

/**
 * Aus den abgeschlossenen Aktivitäten die Jahre ableiten, für die ein Rückblick
 * angeboten wird — nur die Archiv-Sicht (dauerhaft):
 *  - Vergangene Jahre mit ≥ 3 Abschlüssen: immer.
 *  - Das laufende Jahr: nur während der Dezember-Saison.
 * Neueste zuerst.
 */
export function availableWrappedYears(
  completed: DatedActivity[],
  now: Date = new Date(),
): number[] {
  const counts = new Map<number, number>()
  for (const a of completed) {
    const y = wrappedYearForActivity(a)
    counts.set(y, (counts.get(y) ?? 0) + 1)
  }
  const currentYear = now.getFullYear()
  const season = isWrappedSeason(now)

  return [...counts.entries()]
    .filter(([year, count]) => {
      if (count < MIN_COMPLETED_FOR_WRAPPED) return false
      if (year > currentYear) return false // Defensive: keine Zukunftsdaten.
      if (year === currentYear) return season
      return true
    })
    .map(([year]) => year)
    .sort((a, b) => b - a)
}

/**
 * Zeigt eine ausreichend aktive Gruppe im laufenden Jahr JETZT den Teaser-Banner?
 * Nur in der Dezember-Saison und ab 3 Abschlüssen im laufenden Jahr.
 */
export function isCurrentYearWrappedLive(
  completed: DatedActivity[],
  now: Date = new Date(),
): boolean {
  if (!isWrappedSeason(now)) return false
  const currentYear = now.getFullYear()
  const count = completed.filter((a) => wrappedYearForActivity(a) === currentYear).length
  return count >= MIN_COMPLETED_FOR_WRAPPED
}

// ---------------------------------------------------------------------------
// Slide-Bau
// ---------------------------------------------------------------------------

export interface ShoutoutPerson {
  id: string
  name: string
}

export type WrappedSlide =
  | { type: 'intro'; year: number; groupName: string }
  | { type: 'count'; count: number }
  | { type: 'top-month'; monthIndex: number; count: number }
  | { type: 'top-activity'; name: string; votes: number }
  | { type: 'votes'; count: number }
  | { type: 'momentum'; levelName: string; milestones: number[] }
  | { type: 'shoutout-ideas'; people: ShoutoutPerson[]; count: number }
  | { type: 'shoutout-votes'; people: ShoutoutPerson[]; count: number }
  | { type: 'outro'; year: number; count: number; voteCount: number; groupName: string }

/** Eine für den Rückblick geladene, jahreszugeordnete Aktivität. */
export interface WrappedActivity {
  id: string
  name: string
  current_votes: number
  initiator_id: string
  status: string
  start_date: string | null
  completed_at: string | null
  created_at: string
}

/** Eine Abstimmung mit dem Zeitpunkt, um sie einem Jahr zuzuordnen. */
export interface WrappedVote {
  user_id: string
  created_at: string
}

export interface BuildWrappedInput {
  year: number
  groupName: string
  /** ALLE Aktivitäten der Gruppe (jeden Status) — jahresgefiltert hier drin. */
  activities: WrappedActivity[]
  /** ALLE Abstimmungen der Gruppe — jahresgefiltert hier drin. */
  votes: WrappedVote[]
  /** Aktuelle Mitglieder (für Shout-outs — keine Geister-Ehrungen). */
  memberIds: Set<string>
  /** Anzeigenamen je User-ID (aktuelle Mitglieder). */
  nameById: Map<string, string>
  /** Live-Gesamtzahl aus `group_momentum` für das aktuelle Level, oder null. */
  momentumCount: number | null
}

/**
 * Zählt Vorkommen je Schlüssel (z.B. Vorschläge je Initiator:in). Liefert ALLE
 * Stufen — nicht nur die Spitze —, damit `resolveShoutout` bei ausgeschiedenen
 * Erstplatzierten auf die nächste Stufe zurückfallen kann.
 */
function countBy<T>(
  items: T[],
  keyOf: (item: T) => string,
): { key: string; count: number }[] {
  const counts = new Map<string, number>()
  for (const item of items) {
    const k = keyOf(item)
    counts.set(k, (counts.get(k) ?? 0) + 1)
  }
  return [...counts.entries()].map(([key, count]) => ({ key, count }))
}

/**
 * Meilensteine (5/10/25), die die Gruppe IM Rückblick-Jahr überschritten hat:
 * jede Schwelle zwischen „Abschlüsse aller Vorjahre" und „Abschlüsse bis
 * Jahresende". Hergeleitet aus den jahreszugeordneten Abschlüssen — keine
 * Meilenstein-Historie in der DB (Technical Decision).
 */
function milestonesReachedInYear(allCompleted: DatedActivity[], year: number): number[] {
  const before = allCompleted.filter((a) => wrappedYearForActivity(a) < year).length
  const through = allCompleted.filter((a) => wrappedYearForActivity(a) <= year).length
  return MOMENTUM_MILESTONES.filter((m) => m > before && m <= through)
}

/**
 * Baut die anzeigbare Slide-Liste für ein Rückblick-Jahr. Wendet alle Zähl- und
 * Skip-Regeln an: Slides ohne sinnvolle Daten tauchen gar nicht erst auf, der
 * Viewer muss nichts überspringen. Intro, Große Zahl und Outro erscheinen immer
 * (durch die ≥-3-Schwelle garantiert sinnvoll).
 */
export function buildWrappedSlides(input: BuildWrappedInput): WrappedSlide[] {
  const { year, groupName, activities, votes, memberIds, nameById, momentumCount } = input

  const inYear = activities.filter((a) => wrappedYearForActivity(a) === year)
  const completedInYear = inYear.filter((a) => a.status === 'abgeschlossen')
  const allCompleted = activities.filter((a) => a.status === 'abgeschlossen')
  const votesInYear = votes.filter((v) => wrappedYearForActivity({
    start_date: null, completed_at: null, created_at: v.created_at,
  }) === year)

  const slides: WrappedSlide[] = []

  // 1 — Intro (immer)
  slides.push({ type: 'intro', year, groupName })

  // 2 — Große Zahl (immer)
  slides.push({ type: 'count', count: completedInYear.length })

  // 3 — Aktivster Monat (Gleichstand: früherer Monat)
  const monthCounts = new Array(12).fill(0)
  for (const a of completedInYear) monthCounts[wrappedMonthForActivity(a)]++
  const maxMonthCount = Math.max(...monthCounts)
  if (maxMonthCount > 0) {
    const monthIndex = monthCounts.findIndex((c) => c === maxMonthCount)
    slides.push({ type: 'top-month', monthIndex, count: maxMonthCount })
  }

  // 4 — Top-Aktivität (meiste Votes; Gleichstand: früher stattgefunden)
  const voted = completedInYear.filter((a) => a.current_votes > 0)
  if (voted.length > 0) {
    const maxVotes = Math.max(...voted.map((a) => a.current_votes))
    const top = voted
      .filter((a) => a.current_votes === maxVotes)
      .sort((a, b) => referenceDate(a).localeCompare(referenceDate(b)))[0]
    slides.push({ type: 'top-activity', name: top.name, votes: top.current_votes })
  }

  // 5 — Abstimmungen (demokratische Bilanz)
  if (votesInYear.length > 0) {
    slides.push({ type: 'votes', count: votesInYear.length })
  }

  // 6 — Momentum (aktuelles Level + im Jahr erreichte Meilensteine)
  if (momentumCount !== null) {
    slides.push({
      type: 'momentum',
      levelName: levelForCount(momentumCount).name,
      milestones: milestonesReachedInYear(allCompleted, year),
    })
  }

  // 7 — Shout-out 1: Ideengeber:in (meiste Vorschläge, nur aktuelle Mitglieder)
  const ideaPeople = resolveShoutout(
    countBy(inYear, (a) => a.initiator_id),
    memberIds,
    nameById,
  )
  if (ideaPeople) {
    slides.push({ type: 'shoutout-ideas', people: ideaPeople.people, count: ideaPeople.count })
  }

  // 8 — Shout-out 2: fleißigste:r Abstimmer:in (meiste Votes, nur Mitglieder)
  const votePeople = resolveShoutout(
    countBy(votesInYear, (v) => v.user_id),
    memberIds,
    nameById,
  )
  if (votePeople) {
    slides.push({ type: 'shoutout-votes', people: votePeople.people, count: votePeople.count })
  }

  // 9 — Outro (immer)
  slides.push({
    type: 'outro',
    year,
    count: completedInYear.length,
    voteCount: votesInYear.length,
    groupName,
  })

  return slides
}

/**
 * Übersetzt ein „meiste X"-Ergebnis in würdigbare Personen:
 *  - nur aktuelle Mitglieder (verlassene Kandidat:innen fallen raus, die
 *    nächstplatzierten rücken NICHT automatisch nach — außer alle Erstplatzierten
 *    sind weg, dann greift die Rückfrage auf die nächste Stufe),
 *  - bei > 3 Gleichplatzierten (aktuelle Mitglieder) entfällt die Slide,
 *  - keine würdigbare Person → null (Slide entfällt).
 */
function resolveShoutout(
  tiers: { key: string; count: number }[],
  memberIds: Set<string>,
  nameById: Map<string, string>,
): { people: ShoutoutPerson[]; count: number } | null {
  if (tiers.length === 0) return null

  // Absteigend nach Zahl gruppieren, damit bei ausgeschiedenen Erstplatzierten
  // die nächste Stufe nachrücken kann.
  const byCount = new Map<number, string[]>()
  for (const { key, count } of tiers) {
    if (!byCount.has(count)) byCount.set(count, [])
    byCount.get(count)!.push(key)
  }
  const countsDesc = [...byCount.keys()].sort((a, b) => b - a)

  for (const count of countsDesc) {
    const present = byCount.get(count)!.filter((id) => memberIds.has(id))
    if (present.length === 0) continue // ganze Stufe ausgeschieden → nächste prüfen
    if (present.length > SHOUTOUT_MAX_TIES) return null // zu viele gleichauf
    const people = present.map((id) => ({ id, name: nameById.get(id) ?? 'Mitglied' }))
    return { people, count }
  }
  return null
}
