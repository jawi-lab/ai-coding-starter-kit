// Merkt sich die zuletzt geöffnete Gruppe, damit die persistente Bottom-Nav
// (Home · Vorschläge · Board · Termine · Profil) auch außerhalb einer Gruppe
// (z.B. auf Home) sinnvolle Tab-Ziele hat. Rein clientseitig via localStorage —
// passt zum Static Export (kein Server-State) und zur Capacitor-WebView.

const LAST_GROUP_KEY = 'zusammen:last-group-id'

export function getLastGroupId(): string | null {
  if (typeof window === 'undefined') return null
  try {
    return window.localStorage.getItem(LAST_GROUP_KEY)
  } catch {
    return null
  }
}

export function setLastGroupId(groupId: string): void {
  if (typeof window === 'undefined' || !groupId) return
  try {
    window.localStorage.setItem(LAST_GROUP_KEY, groupId)
  } catch {
    // Speicher nicht verfügbar (Private Mode o.ä.) — Tabs fallen dann auf die
    // erste Gruppe zurück, kein harter Fehler.
  }
}
