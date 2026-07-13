/**
 * Level-Regeln für Gruppen-Momentum (PROJ-15).
 *
 * Kapselt Namen, Schwellen und Fortschritts-Berechnung an einer Stelle
 * (Decision Log: Level-Namen fest verdrahtet auf Deutsch, hier später
 * leicht lokalisierbar/austauschbar). Reine Rechen-Datei — kein Supabase,
 * kein React, damit sie trivial testbar bleibt und im Static Export läuft.
 */

export interface MomentumLevel {
  /** Level-Nummer 1–4 (nur Anzeige in der Level-Leiter). */
  level: number
  name: string
  /** Ab dieser Anzahl abgeschlossener Aktivitäten ist das Level erreicht. */
  threshold: number
}

/** Die 4 Level, aufsteigend. Schwellen 0/5/10/25 laut Spec. */
export const MOMENTUM_LEVELS: readonly MomentumLevel[] = [
  { level: 1, name: 'Neue Gruppe', threshold: 0 },
  { level: 2, name: 'Gruppe', threshold: 5 },
  { level: 3, name: 'Eingespielte Gruppe', threshold: 10 },
  { level: 4, name: 'Legendäre Gruppe', threshold: 25 },
] as const

/** Meilenstein-Schwellen, die gefeiert werden (Level 1 ist Startzustand). */
export const MOMENTUM_MILESTONES: readonly number[] = MOMENTUM_LEVELS.slice(1).map(
  (l) => l.threshold,
)

/** Aktuelles Level für eine Anzahl abgeschlossener Aktivitäten. */
export function levelForCount(count: number): MomentumLevel {
  let current = MOMENTUM_LEVELS[0]
  for (const level of MOMENTUM_LEVELS) {
    if (count >= level.threshold) current = level
  }
  return current
}

/** Das nächste noch nicht erreichte Level, oder null im höchsten Level. */
export function nextLevel(count: number): MomentumLevel | null {
  return MOMENTUM_LEVELS.find((l) => count < l.threshold) ?? null
}

/**
 * Fortschritt zum nächsten Meilenstein in Prozent (0–100) für den Balken.
 * Läuft immer von der vorherigen Schwelle zur nächsten (z.B. 7 von 5→10 = 40%).
 * Im höchsten Level gibt es keinen Balken → null.
 */
export function progressToNextLevel(count: number): number | null {
  const next = nextLevel(count)
  if (!next) return null
  const current = levelForCount(count)
  const span = next.threshold - current.threshold
  return Math.round(((count - current.threshold) / span) * 100)
}

/** Fortschrittstext fürs Banner, z.B. „Noch 3 bis Eingespielte Gruppe". */
export function progressLabel(count: number): string | null {
  const next = nextLevel(count)
  if (!next) return null
  return `Noch ${next.threshold - count} bis ${next.name}`
}

/**
 * Höchster Meilenstein, dessen Feier für dieses Mitglied noch aussteht:
 * der `highestMilestone` der Gruppe, sofern er über dem eigenen Gesehen-Wert
 * liegt — sonst null. Bei mehreren verpassten Meilensteinen wird bewusst nur
 * der höchste gefeiert (Spec: keine gestapelten Overlays).
 */
export function pendingCelebrationMilestone(
  highestMilestone: number,
  highestSeen: number,
): number | null {
  if (highestMilestone > highestSeen && MOMENTUM_MILESTONES.includes(highestMilestone)) {
    return highestMilestone
  }
  return null
}

/** Level zu einem Meilenstein (für die Feier-Überschrift). */
export function levelForMilestone(milestone: number): MomentumLevel | null {
  return MOMENTUM_LEVELS.find((l) => l.threshold === milestone && l.threshold > 0) ?? null
}
