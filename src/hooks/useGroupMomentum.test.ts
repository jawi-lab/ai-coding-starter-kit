import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { useGroupMomentum } from './useGroupMomentum'

// --- Supabase mock (hoisted so the factory can reference them) ---
const { mockMomentumResult, mockSeenResult, mockUpsert, mockRemoveChannel, mockSubscribe, mockOn } =
  vi.hoisted(() => ({
    mockMomentumResult: vi.fn(),
    mockSeenResult: vi.fn(),
    mockUpsert: vi.fn(),
    mockRemoveChannel: vi.fn(),
    mockSubscribe: vi.fn().mockReturnValue({}),
    mockOn: vi.fn(),
  }))

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({ user: { id: 'user-1' } }),
}))

vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: (table: string) => {
      if (table === 'group_momentum') {
        return {
          select: () => ({ eq: () => ({ maybeSingle: () => mockMomentumResult() }) }),
        }
      }
      // group_momentum_seen
      return {
        select: () => ({
          eq: () => ({ eq: () => ({ maybeSingle: () => mockSeenResult() }) }),
        }),
        upsert: (...args: unknown[]) => {
          mockUpsert(...args)
          return Promise.resolve({ error: null })
        },
      }
    },
    channel: () => ({
      on: (...args: unknown[]) => {
        mockOn(...args)
        return { subscribe: mockSubscribe }
      },
    }),
    removeChannel: mockRemoveChannel,
  },
}))

function mockData(
  momentum: { completed_count: number; highest_milestone: number } | null,
  seen: number | null,
) {
  mockMomentumResult.mockResolvedValue({ data: momentum, error: null })
  mockSeenResult.mockResolvedValue({
    data: seen === null ? null : { highest_seen_milestone: seen },
    error: null,
  })
}

describe('useGroupMomentum', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('loads the momentum row and reports no celebration when already seen', async () => {
    mockData({ completed_count: 7, highest_milestone: 5 }, 5)

    const { result } = renderHook(() => useGroupMomentum('group-1'))

    await waitFor(() =>
      expect(result.current.momentum).toEqual({ count: 7, highestMilestone: 5 }),
    )
    expect(result.current.pendingMilestone).toBeNull()
  })

  it('reports the highest missed milestone as pending (5 and 10 missed → 10)', async () => {
    mockData({ completed_count: 11, highest_milestone: 10 }, 0)

    const { result } = renderHook(() => useGroupMomentum('group-1'))

    await waitFor(() => expect(result.current.pendingMilestone).toBe(10))
  })

  it('treats a missing seen row as "nothing seen yet"', async () => {
    mockData({ completed_count: 5, highest_milestone: 5 }, null)

    const { result } = renderHook(() => useGroupMomentum('group-1'))

    await waitFor(() => expect(result.current.pendingMilestone).toBe(5))
  })

  it('hides momentum silently when the row does not exist (pre-backend rollout)', async () => {
    mockData(null, 0)

    const { result } = renderHook(() => useGroupMomentum('group-1'))

    // Kein Fehlerzustand: momentum bleibt null, keine Feier.
    await waitFor(() => expect(mockMomentumResult).toHaveBeenCalled())
    expect(result.current.momentum).toBeNull()
    expect(result.current.pendingMilestone).toBeNull()
  })

  it('markCelebrationSeen upserts the own row and clears the pending celebration', async () => {
    mockData({ completed_count: 10, highest_milestone: 10 }, 0)

    const { result } = renderHook(() => useGroupMomentum('group-1'))
    await waitFor(() => expect(result.current.pendingMilestone).toBe(10))

    act(() => {
      result.current.markCelebrationSeen()
    })

    expect(result.current.pendingMilestone).toBeNull()
    expect(mockUpsert).toHaveBeenCalledWith(
      { group_id: 'group-1', user_id: 'user-1', highest_seen_milestone: 10 },
      { onConflict: 'group_id,user_id' },
    )
  })

  it('subscribes to Realtime on group_momentum filtered by groupId', async () => {
    mockData({ completed_count: 0, highest_milestone: 0 }, 0)

    renderHook(() => useGroupMomentum('group-abc'))

    await waitFor(() =>
      expect(mockOn).toHaveBeenCalledWith(
        'postgres_changes',
        expect.objectContaining({
          event: '*',
          schema: 'public',
          table: 'group_momentum',
          filter: 'group_id=eq.group-abc',
        }),
        expect.any(Function),
      ),
    )
    expect(mockSubscribe).toHaveBeenCalled()
  })

  it('does not fetch when groupId is empty and cleans up the channel on unmount', async () => {
    mockData({ completed_count: 0, highest_milestone: 0 }, 0)

    const empty = renderHook(() => useGroupMomentum(''))
    expect(mockMomentumResult).not.toHaveBeenCalled()
    empty.unmount()
    expect(mockRemoveChannel).not.toHaveBeenCalled()

    const mounted = renderHook(() => useGroupMomentum('group-1'))
    await waitFor(() => expect(mockMomentumResult).toHaveBeenCalled())
    mounted.unmount()
    expect(mockRemoveChannel).toHaveBeenCalledTimes(1)
  })
})
