import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { useWrappedAvailability } from './useWrappedAvailability'
import type { DatedActivity } from '@/lib/wrapped'

// --- Supabase mock (hoisted, damit die Factory darauf zugreifen kann) ---
const { mockActivitiesResult, mockRemoveChannel, mockSubscribe, mockOn, realtimeHandlers } =
  vi.hoisted(() => ({
    mockActivitiesResult: vi.fn(),
    mockRemoveChannel: vi.fn(),
    mockSubscribe: vi.fn().mockReturnValue({}),
    mockOn: vi.fn(),
    realtimeHandlers: [] as Array<() => void>,
  }))

vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: () => ({
      select: () => ({
        eq: () => ({ eq: () => mockActivitiesResult() }),
      }),
    }),
    channel: (name: string) => ({
      on: (event: string, config: unknown, handler: () => void) => {
        mockOn(name, event, config)
        realtimeHandlers.push(handler)
        return { subscribe: mockSubscribe }
      },
    }),
    removeChannel: mockRemoveChannel,
  },
}))

/** Drei abgeschlossene Aktivitäten im laufenden Jahr — die Schwelle für den Rückblick. */
function activitiesThisYear(count: number, year = new Date().getFullYear()): DatedActivity[] {
  return Array.from({ length: count }, (_, i) => ({
    start_date: `${year}-03-0${i + 1}`,
    completed_at: null,
    created_at: `${year}-03-0${i + 1}`,
  }))
}

describe('useWrappedAvailability', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    realtimeHandlers.length = 0
    mockActivitiesResult.mockResolvedValue({ data: [], error: null })
  })

  it('startet im Ladezustand und meldet nach dem Laden fertig', async () => {
    mockActivitiesResult.mockResolvedValue({ data: activitiesThisYear(3), error: null })

    const { result } = renderHook(() => useWrappedAvailability('group-1'))

    expect(result.current.loading).toBe(true)
    await waitFor(() => expect(result.current.loading).toBe(false))
  })

  it('leitet die verfügbaren Jahrgänge aus den geladenen Aktivitäten ab', async () => {
    const lastYear = new Date().getFullYear() - 1
    mockActivitiesResult.mockResolvedValue({
      data: activitiesThisYear(4, lastYear),
      error: null,
    })

    const { result } = renderHook(() => useWrappedAvailability('group-1'))

    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.availableYears).toEqual([lastYear])
    expect(result.current.currentYear).toBe(new Date().getFullYear())
  })

  it('beendet den Ladezustand auch, wenn die Abfrage fehlschlägt', async () => {
    mockActivitiesResult.mockResolvedValue({ data: null, error: { message: 'nope' } })

    const { result } = renderHook(() => useWrappedAvailability('group-1'))

    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.availableYears).toEqual([])
    expect(result.current.currentYearLive).toBe(false)
  })

  it('lädt bei Gruppenwechsel neu und zeigt währenddessen wieder den Ladezustand', async () => {
    const lastYear = new Date().getFullYear() - 1
    mockActivitiesResult.mockResolvedValue({ data: activitiesThisYear(4, lastYear), error: null })

    const { result, rerender } = renderHook(({ id }) => useWrappedAvailability(id), {
      initialProps: { id: 'group-1' },
    })
    await waitFor(() => expect(result.current.loading).toBe(false))

    // Erst nach dem Wechsel auflösen, damit der Zwischenzustand prüfbar bleibt.
    let resolve: (v: unknown) => void = () => {}
    mockActivitiesResult.mockReturnValue(new Promise((r) => { resolve = r }))

    rerender({ id: 'group-2' })
    expect(result.current.loading).toBe(true)

    await act(async () => {
      resolve({ data: activitiesThisYear(3, lastYear), error: null })
    })
    await waitFor(() => expect(result.current.loading).toBe(false))
  })

  it('lädt bei Realtime-Änderungen nach, ohne zurück in den Ladezustand zu fallen', async () => {
    const lastYear = new Date().getFullYear() - 1
    mockActivitiesResult.mockResolvedValue({ data: activitiesThisYear(2, lastYear), error: null })

    const { result } = renderHook(() => useWrappedAvailability('group-1'))
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.availableYears).toEqual([]) // 2 < Schwelle von 3

    mockActivitiesResult.mockResolvedValue({ data: activitiesThisYear(3, lastYear), error: null })
    await act(async () => {
      realtimeHandlers.forEach((h) => h())
    })

    await waitFor(() => expect(result.current.availableYears).toEqual([lastYear]))
    expect(result.current.loading).toBe(false)
  })

  it('räumt den Realtime-Kanal beim Unmount ab', async () => {
    const { unmount } = renderHook(() => useWrappedAvailability('group-1'))
    await waitFor(() => expect(mockSubscribe).toHaveBeenCalled())
    unmount()
    expect(mockRemoveChannel).toHaveBeenCalled()
  })
})
