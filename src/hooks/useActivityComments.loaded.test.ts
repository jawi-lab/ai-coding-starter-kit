import { describe, it, expect, vi, beforeEach } from 'vitest'
import { act, renderHook, waitFor } from '@testing-library/react'
import { useActivityComments } from './useActivityComments'

const { mockOrder, mockDeleteEq } = vi.hoisted(() => ({ mockOrder: vi.fn(), mockDeleteEq: vi.fn() }))

vi.mock('@/lib/supabase', () => {
  const channel = { on: () => channel, subscribe: () => channel }
  return {
    supabase: {
      from: () => ({
        select: () => ({ eq: () => ({ order: mockOrder }) }),
        delete: () => ({ eq: mockDeleteEq }),
      }),
      channel: () => channel,
      removeChannel: vi.fn(),
    },
  }
})

describe('useActivityComments loaded', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockOrder.mockResolvedValue({ data: [{ id: 'c1' }], error: null })
  })

  it('wird erst nach dem Laden der aktuellen Aktivität wahr', async () => {
    const { result } = renderHook(() => useActivityComments('act-1'))
    expect(result.current.loaded).toBe(false)
    await waitFor(() => expect(result.current.loaded).toBe(true))
    expect(result.current.comments).toHaveLength(1)
  })

  it('gilt beim Wiederöffnen derselben Aktivität erst nach dem neuen Laden', async () => {
    const { result, rerender } = renderHook(
      ({ id }: { id: string | null }) => useActivityComments(id),
      { initialProps: { id: 'act-1' as string | null } }
    )
    await waitFor(() => expect(result.current.loaded).toBe(true))

    rerender({ id: null })
    expect(result.current.loaded).toBe(false)

    rerender({ id: 'act-1' })
    expect(result.current.loaded).toBe(false)
    await waitFor(() => expect(result.current.loaded).toBe(true))
  })

  it('bleibt bei einem Ladefehler falsch', async () => {
    mockOrder.mockResolvedValue({ data: null, error: { message: 'x' } })
    const { result } = renderHook(() => useActivityComments('act-1'))
    await waitFor(() => expect(result.current.error).not.toBeNull())
    expect(result.current.loaded).toBe(false)
  })
  it('entfernt einen gelöschten Kommentar sofort aus der Liste', async () => {
    mockDeleteEq.mockResolvedValue({ error: null })
    const { result } = renderHook(() => useActivityComments('act-1'))
    await waitFor(() => expect(result.current.comments).toHaveLength(1))

    await act(async () => {
      expect(await result.current.deleteComment('c1')).toBe(true)
    })

    expect(result.current.comments).toHaveLength(0)
  })

  it('behält den Kommentar, wenn das Löschen fehlschlägt', async () => {
    mockDeleteEq.mockResolvedValue({ error: { message: 'x' } })
    const { result } = renderHook(() => useActivityComments('act-1'))
    await waitFor(() => expect(result.current.comments).toHaveLength(1))

    await act(async () => {
      expect(await result.current.deleteComment('c1')).toBe(false)
    })

    expect(result.current.comments).toHaveLength(1)
  })
})
