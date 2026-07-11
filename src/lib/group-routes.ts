// Zentrale Definition der Gruppen-Detail-Navigation.
//
// Für den Static Export (PROJ-9) gibt es keine dynamische Route mehr
// (`/groups/[groupId]/...` lässt sich nicht vorrendern, da Gruppen-IDs zur
// Build-Zeit unbekannt sind). Stattdessen liefert eine einzige statische Hülle
// `/groups/view` aus; Gruppe und Tab kommen aus Query-Params und werden
// client-seitig aufgelöst. Das funktioniert identisch auf Vercel (statisch) und
// in der Capacitor-WebView, ohne Host-spezifische Rewrites.

// Gruppen-Bereiche. Reihenfolge = obere Tab-Leiste (Desktop) und Bottom-Navigation
// (mobil/nativ, PROJ-9). Das frühere `archiv` ist entfernt — das echte (persönliche)
// Archiv lebt im Profil-Sheet; der Gruppen-Archiv-Tab war nur ein Platzhalter und
// hätte diese Funktion gedoppelt.
export const GROUP_TABS = [
  { seg: 'vorschlaege', label: 'Vorschläge' },
  { seg: 'planung', label: 'Board' },
  { seg: 'termine', label: 'Termine' },
] as const

export type GroupTab = (typeof GROUP_TABS)[number]['seg']

export const DEFAULT_GROUP_TAB: GroupTab = 'vorschlaege'

/** Baut die URL zur Gruppen-Detail-Hülle (`/groups/view?id=...&tab=...`). */
export function groupHref(groupId: string, tab: GroupTab = DEFAULT_GROUP_TAB): string {
  return `/groups/view?id=${encodeURIComponent(groupId)}&tab=${tab}`
}

export function isGroupTab(value: string | null | undefined): value is GroupTab {
  return GROUP_TABS.some((t) => t.seg === value)
}

/** Validiert den `tab`-Query-Param und fällt sonst auf den Default zurück. */
export function resolveGroupTab(value: string | null | undefined): GroupTab {
  return isGroupTab(value) ? value : DEFAULT_GROUP_TAB
}
