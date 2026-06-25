'use client'

import { useCallback, useEffect, useState } from 'react'

export type Theme = 'light' | 'dark' | 'system'

export const THEME_STORAGE_KEY = 'zusammen-theme'

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
 * Client-side theme controller. Respects the OS preference by default
 * (`system`) and persists explicit choices to localStorage. The initial
 * paint is handled by an inline script in the root layout to avoid FOUC.
 */
export function useTheme() {
  const [theme, setThemeState] = useState<Theme>('system')

  // Hydrate from storage on mount.
  useEffect(() => {
    const stored = (localStorage.getItem(THEME_STORAGE_KEY) as Theme | null) ?? 'system'
    setThemeState(stored)
    applyTheme(stored)
  }, [])

  // Follow the OS preference live while in `system` mode.
  useEffect(() => {
    if (theme !== 'system') return
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = () => applyTheme('system')
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [theme])

  const setTheme = useCallback((next: Theme) => {
    setThemeState(next)
    localStorage.setItem(THEME_STORAGE_KEY, next)
    applyTheme(next)
  }, [])

  return { theme, setTheme }
}
