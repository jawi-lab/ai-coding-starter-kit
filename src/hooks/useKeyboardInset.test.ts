import { act, renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useKeyboardInset } from './useKeyboardInset'

const mocks = vi.hoisted(() => ({
  platform: 'web',
  listeners: {} as Record<string, (info: { keyboardHeight: number }) => void>,
  remove: vi.fn(),
}))

vi.mock('@capacitor/core', () => ({
  Capacitor: { getPlatform: () => mocks.platform },
}))

vi.mock('@capacitor/keyboard', () => ({
  Keyboard: {
    addListener: async (name: string, fn: (info: { keyboardHeight: number }) => void) => {
      mocks.listeners[name] = fn
      return { remove: mocks.remove }
    },
  },
}))

describe('useKeyboardInset in der iOS-App', () => {
  beforeEach(() => {
    mocks.platform = 'ios'
    mocks.listeners = {}
    mocks.remove.mockClear()
    vi.stubGlobal('innerHeight', 874)
  })

  async function renderWithListeners() {
    const view = renderHook(() => useKeyboardInset(true))
    await waitFor(() => expect(mocks.listeners.keyboardWillHide).toBeDefined())
    return view
  }

  it('nimmt die Höhe vom Plugin', async () => {
    const { result } = await renderWithListeners()
    act(() => mocks.listeners.keyboardWillShow({ keyboardHeight: 336 }))
    expect(result.current).toEqual({ inset: 336, height: 530 })
  })

  it('setzt beim Schließen der Tastatur zurück', async () => {
    const { result } = await renderWithListeners()
    act(() => mocks.listeners.keyboardWillShow({ keyboardHeight: 336 }))
    act(() => mocks.listeners.keyboardWillHide({ keyboardHeight: 0 }))
    expect(result.current).toEqual({ inset: 0, height: 0 })
  })

  it('entfernt die Listener beim Unmount', async () => {
    const { unmount } = await renderWithListeners()
    await waitFor(() => expect(mocks.listeners.keyboardDidShow).toBeDefined())
    await act(async () => {})
    unmount()
    expect(mocks.remove).toHaveBeenCalledTimes(3)
  })
})

describe('useKeyboardInset im Web', () => {
  it('registriert keine Plugin-Listener', () => {
    mocks.platform = 'web'
    mocks.listeners = {}
    renderHook(() => useKeyboardInset(true))
    expect(mocks.listeners).toEqual({})
  })
})
