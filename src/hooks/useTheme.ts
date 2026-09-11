'use client'

import { useCallback, useEffect, useSyncExternalStore } from 'react'

export type Theme = 'light' | 'dark' | 'system'

export const THEME_STORAGE_KEY = 'mellon-theme'

/** Pre-rename key — read once as fallback so existing users keep their choice. */
const LEGACY_THEME_STORAGE_KEY = 'zusammen-theme'

function systemPrefersDark(): boolean {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-color-scheme: dark)').matches
  )
}

/** Toggle the `.dark` class on <html> for the resolved theme. */
export function applyTheme(theme: Theme): void {
  if (typeof document === 'undefined') return
  const dark = theme === 'dark' || (theme === 'system' && systemPrefersDark())
  document.documentElement.classList.toggle('dark', dark)
}

/**
 * Der gespeicherte Wert ist ein externer Store (localStorage), kein React-State.
 * Genau dafür ist `useSyncExternalStore` gedacht: React liest den Wert beim
 * Rendern, statt ihn per Effect nachträglich hineinzuschreiben — das spart die
 * zusätzliche Render-Runde nach dem Mount (react-hooks/set-state-in-effect) und
 * hält mehrere `useTheme`-Aufrufer automatisch synchron.
 */
const listeners = new Set<() => void>()

function subscribe(onChange: () => void): () => void {
  listeners.add(onChange)
  // Ein zweiter Tab kann die Wahl ändern.
  window.addEventListener('storage', onChange)
  return () => {
    listeners.delete(onChange)
    window.removeEventListener('storage', onChange)
  }
}

function readStoredTheme(): Theme {
  // `getSnapshot` läuft beim Rendern und darf nicht werfen — Safari im privaten
  // Modus verweigert den Zugriff auf localStorage.
  try {
    return (
      (window.localStorage.getItem(THEME_STORAGE_KEY) as Theme | null) ??
      (window.localStorage.getItem(LEGACY_THEME_STORAGE_KEY) as Theme | null) ??
      'system'
    )
  } catch {
    return 'system'
  }
}

/** Beim Prerender (Static Export) gibt es keinen Speicher — Default wie bisher. */
function getServerSnapshot(): Theme {
  return 'system'
}

/**
 * Client-side theme controller. Respects the OS preference by default
 * (`system`) and persists explicit choices to localStorage. The initial
 * paint is handled by an inline script in the root layout to avoid FOUC.
 */
export function useTheme() {
  const theme = useSyncExternalStore(subscribe, readStoredTheme, getServerSnapshot)

  // Die `.dark`-Klasse ist der externe Effekt der Wahl — inklusive des Falls,
  // dass ein anderer Tab sie geändert hat.
  useEffect(() => {
    applyTheme(theme)
  }, [theme])

  // Follow the OS preference live while in `system` mode.
  useEffect(() => {
    if (theme !== 'system') return
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = () => applyTheme('system')
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [theme])

  const setTheme = useCallback((next: Theme) => {
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, next)
    } catch {
      // Ohne Speicher bleibt die Wahl auf diese Sitzung beschränkt.
    }
    applyTheme(next)
    // `storage` feuert nur in anderen Tabs — dieser hier braucht den Anstoß.
    listeners.forEach((l) => l())
  }, [])

  return { theme, setTheme }
}
