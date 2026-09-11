import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useTheme, THEME_STORAGE_KEY } from './useTheme'

const LEGACY_KEY = 'zusammen-theme'

function mockPrefersDark(dark: boolean) {
  vi.stubGlobal('matchMedia', (query: string) => ({
    matches: dark && query.includes('dark'),
    media: query,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }))
}

describe('useTheme', () => {
  beforeEach(() => {
    window.localStorage.clear()
    document.documentElement.classList.remove('dark')
    mockPrefersDark(false)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('liest die gespeicherte Wahl schon beim ersten Render', () => {
    window.localStorage.setItem(THEME_STORAGE_KEY, 'dark')

    const { result } = renderHook(() => useTheme())

    expect(result.current.theme).toBe('dark')
    expect(document.documentElement.classList.contains('dark')).toBe(true)
  })

  it('fällt ohne gespeicherte Wahl auf "system" zurück', () => {
    const { result } = renderHook(() => useTheme())
    expect(result.current.theme).toBe('system')
  })

  it('übernimmt den Wert des alten Schlüssels (Umbenennung ZUSAMMEN → Mellon)', () => {
    window.localStorage.setItem(LEGACY_KEY, 'dark')

    const { result } = renderHook(() => useTheme())

    expect(result.current.theme).toBe('dark')
  })

  it('speichert eine neue Wahl und setzt die .dark-Klasse', () => {
    const { result } = renderHook(() => useTheme())

    act(() => result.current.setTheme('dark'))

    expect(result.current.theme).toBe('dark')
    expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBe('dark')
    expect(document.documentElement.classList.contains('dark')).toBe(true)

    act(() => result.current.setTheme('light'))

    expect(result.current.theme).toBe('light')
    expect(document.documentElement.classList.contains('dark')).toBe(false)
  })

  it('hält mehrere Aufrufer synchron', () => {
    const a = renderHook(() => useTheme())
    const b = renderHook(() => useTheme())

    act(() => a.result.current.setTheme('dark'))

    expect(b.result.current.theme).toBe('dark')
  })

  it('zieht eine Änderung aus einem anderen Tab nach', () => {
    const { result } = renderHook(() => useTheme())

    act(() => {
      window.localStorage.setItem(THEME_STORAGE_KEY, 'dark')
      window.dispatchEvent(new StorageEvent('storage', { key: THEME_STORAGE_KEY }))
    })

    expect(result.current.theme).toBe('dark')
    expect(document.documentElement.classList.contains('dark')).toBe(true)
  })

  it('löst "system" gegen die OS-Einstellung auf', () => {
    mockPrefersDark(true)
    window.localStorage.setItem(THEME_STORAGE_KEY, 'system')

    renderHook(() => useTheme())

    expect(document.documentElement.classList.contains('dark')).toBe(true)
  })
})
