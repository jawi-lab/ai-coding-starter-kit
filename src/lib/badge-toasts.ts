import { toast } from 'sonner'
import { supabase } from './supabase'
import { badgeInfo, pendingToastTier, tierInfo, type BadgeKey } from './badges'

/**
 * Toast-Prüfung nach zählbaren Aktionen (PROJ-16).
 *
 * Der Toast erscheint nur auf dem Gerät, das die Aktion ausgelöst hat (Spec):
 * darum kein Realtime-Push, sondern eine Nach-Aktion-Prüfung. Das Modul hält
 * je Nutzer eine Baseline der verdienten Stufen; nach einer Aktion wird die
 * betroffene Stufe frisch gelesen und nur bei einem Anstieg getoastet — bei
 * übersprungenen Stufen nur die höchste (Logik in pendingToastTier).
 *
 * Ohne Baseline (Seed nie gelaufen oder fehlgeschlagen) wird still übernommen
 * statt getoastet — lieber ein verpasster Toast als ein falscher; die „Neu"-
 * Hervorhebung im Profil fängt den Fall über die DB ab.
 */

let baselineUserId: string | null = null
let baseline: Partial<Record<BadgeKey, number>> = {}
let seedInFlight: Promise<void> | null = null

/**
 * Baseline der eigenen verdienten Stufen laden. Einmal beim Betreten der
 * Gruppen-Ansicht aufrufen — vor der ersten zählbaren Aktion.
 */
export function seedBadgeBaseline(userId: string): Promise<void> {
  if (baselineUserId === userId && seedInFlight) return seedInFlight

  baselineUserId = userId
  baseline = {}
  seedInFlight = (async () => {
    const { data, error } = await supabase
      .from('user_badges')
      .select('badge, highest_earned_tier')
      .eq('user_id', userId)
    if (error || baselineUserId !== userId) return
    for (const row of data ?? []) {
      baseline[row.badge as BadgeKey] = row.highest_earned_tier
    }
  })()
  return seedInFlight
}

/**
 * Nach einer erfolgreichen zählbaren Aktion aufrufen (Fire-and-forget).
 * Der DB-Trigger hat die Akte zu diesem Zeitpunkt bereits aktualisiert.
 */
export async function checkBadgeToast(badge: BadgeKey): Promise<void> {
  try {
    const { data: sessionData } = await supabase.auth.getSession()
    const userId = sessionData.session?.user.id
    if (!userId || baselineUserId !== userId) return
    if (seedInFlight) await seedInFlight

    const { data, error } = await supabase
      .from('user_badges')
      .select('highest_earned_tier')
      .eq('user_id', userId)
      .eq('badge', badge)
      .maybeSingle()
    if (error || !data || baselineUserId !== userId) return

    const before = baseline[badge]
    baseline[badge] = data.highest_earned_tier
    if (before === undefined) return

    const risenTo = pendingToastTier(before, data.highest_earned_tier)
    if (risenTo === null) return

    const info = badgeInfo(badge)
    const tier = tierInfo(risenTo)
    if (!tier) return
    toast(`Neues Badge: ${info.name} ${tier.icon}`, {
      description: `${info.icon} ${tier.name} erreicht`,
    })
  } catch {
    // Badge-Toasts sind rein additiv — Fehler hier dürfen nie eine Aktion stören.
  }
}

/** Nur für Tests: Modul-Zustand zurücksetzen. */
export function resetBadgeToastStateForTests(): void {
  baselineUserId = null
  baseline = {}
  seedInFlight = null
}
