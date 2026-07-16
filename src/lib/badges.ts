/**
 * Stufen- und Fortschritts-Regeln für Persönliche Rollen-Badges (PROJ-16).
 *
 * Kapselt Badge-Namen, Stufen-Schwellen und Fortschritts-Berechnung an einer
 * Stelle (gleiche Konvention wie momentum.ts ↔ DB: die Schwellen 5/15/30
 * müssen zu `badge_tier_for` in der Migration passen). Reine Rechen-Datei —
 * kein Supabase, kein React, damit sie trivial testbar bleibt und im
 * Static Export läuft.
 */

/** Badge-Schlüssel wie in der DB-Spalte `user_badges.badge`. */
export type BadgeKey = 'ideengeber' | 'entscheider' | 'planer' | 'immer_dabei'

export interface BadgeInfo {
  key: BadgeKey
  /** Anzeigename, z.B. „Ideengeber". */
  name: string
  /** Emoji-Icon des Badges. */
  icon: string
  /** Kurzbeschreibung der Rolle (fürs Profil). */
  description: string
}

/** Die 4 Badges in Anzeige-Reihenfolge. */
export const BADGES: readonly BadgeInfo[] = [
  { key: 'ideengeber', name: 'Ideengeber', icon: '💡', description: 'bringt die Ideen ein' },
  { key: 'entscheider', name: 'Entscheider', icon: '⚡', description: 'bringt Entscheidungen voran' },
  { key: 'planer', name: 'Planer', icon: '🗓️', description: 'macht aus Ideen Pläne' },
  { key: 'immer_dabei', name: 'Immer dabei', icon: '✅', description: 'ist verlässlich am Start' },
] as const

export function badgeInfo(key: BadgeKey): BadgeInfo {
  return BADGES.find((b) => b.key === key)!
}

export interface BadgeTier {
  /** Schwellenwert = DB-Repräsentation der Stufe (5/15/30). */
  threshold: number
  name: string
  /** Emoji-Fallback für reine Text-Kontexte (Toasts). UI rendert MedalIcon. */
  icon: string
  /** Medaillen-Rang für das SVG-Icon-Set (MedalIcon in mellon-icons). */
  rank: 'bronze' | 'silber' | 'gold'
}

/** Die 3 Stufen, aufsteigend. Schwellen 5/15/30 laut Spec — für alle Badges gleich. */
export const BADGE_TIERS: readonly BadgeTier[] = [
  { threshold: 5, name: 'Bronze', icon: '🥉', rank: 'bronze' },
  { threshold: 15, name: 'Silber', icon: '🥈', rank: 'silber' },
  { threshold: 30, name: 'Gold', icon: '🥇', rank: 'gold' },
] as const

/** Höchste Gold-Schwelle (ab hier: Rohzahl statt Fortschrittsbalken). */
export const GOLD_THRESHOLD = 30

/**
 * Stufe für einen Zähler als Schwellenwert (0 = noch keine Stufe).
 * Muss identisch zu `badge_tier_for` in der DB rechnen.
 */
export function tierForCount(count: number): number {
  let tier = 0
  for (const t of BADGE_TIERS) {
    if (count >= t.threshold) tier = t.threshold
  }
  return tier
}

/** Stufen-Metadaten zu einem Schwellenwert (0/unbekannt → null). */
export function tierInfo(tier: number): BadgeTier | null {
  return BADGE_TIERS.find((t) => t.threshold === tier) ?? null
}

/** Die nächste noch nicht erreichte Stufe, oder null ab Gold. */
export function nextTier(count: number): BadgeTier | null {
  return BADGE_TIERS.find((t) => count < t.threshold) ?? null
}

/**
 * Fortschritt zur nächsten Stufe in Prozent (0–100) für den Balken.
 * Läuft von der vorherigen Schwelle zur nächsten (z.B. 10 von 5→15 = 50%).
 * Ab Gold gibt es keinen Balken → null.
 */
export function progressToNextTier(count: number): number | null {
  const next = nextTier(count)
  if (!next) return null
  const current = tierForCount(count)
  const span = next.threshold - current
  return Math.round(((count - current) / span) * 100)
}

/** Fortschrittstext fürs Profil, z.B. „Noch 5 bis Bronze". Ab Gold null. */
export function progressLabel(count: number): string | null {
  const next = nextTier(count)
  if (!next) return null
  return `Noch ${next.threshold - count} bis ${next.name}`
}

/**
 * Stufe, für die nach einer Aktion ein Toast fällig ist: die verdiente Stufe,
 * sofern sie über dem Stand vor der Aktion liegt — sonst null. Bei mehreren
 * übersprungenen Stufen wird bewusst nur die höchste getoastet (Spec).
 * Kein Re-Toast beim Wieder-Überschreiten: `earnedBefore` ist die persistierte
 * monotone Stufe, nicht der Live-Zähler.
 */
export function pendingToastTier(earnedBefore: number, earnedAfter: number): number | null {
  if (earnedAfter > earnedBefore && tierInfo(earnedAfter) !== null) {
    return earnedAfter
  }
  return null
}

/**
 * „Neu"-Hervorhebung im Profil: verdiente Stufe über dem Angesehen-Stand.
 * Erlischt, sobald `mark_own_badges_seen` angesehen = verdient gesetzt hat.
 */
export function hasUnseenTier(earnedTier: number, seenTier: number): boolean {
  return earnedTier > seenTier
}
