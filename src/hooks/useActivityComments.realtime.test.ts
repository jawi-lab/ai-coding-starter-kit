import { describe, it, expect, vi, beforeEach } from 'vitest'
import { act, renderHook, waitFor } from '@testing-library/react'
import { useActivityComments } from './useActivityComments'

type Change = { eventType: string; old: { id?: string } }

const { mocks } = vi.hoisted(() => ({
  mocks: {
    rows: [] as { id: string }[],
    deletedRows: [] as { id: string }[] | null,
    deleteError: null as { message: string } | null,
    fetchCount: 0,
    onChange: null as ((payload: Change) => void) | null,
    filter: '',
  },
}))

vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: () => ({
      select: () => ({
        eq: () => ({
          order: async () => {
            mocks.fetchCount += 1
            return { data: mocks.rows, error: null }
          },
        }),
      }),
      delete: () => ({
        eq: () => ({
          select: async () => ({ data: mocks.deletedRows, error: mocks.deleteError }),
        }),
      }),
    }),
    channel: () => {
      const channel = {
        on: (_type: string, config: { filter: string }, handler: (payload: Change) => void) => {
          mocks.filter = config.filter
          mocks.onChange = handler
          return channel
        },
        subscribe: () => channel,
      }
      return channel
    },
    removeChannel: vi.fn(),
  },
}))

async function renderLoaded() {
  const view = renderHook(() => useActivityComments('act-1'))
  await waitFor(() => expect(view.result.current.loaded).toBe(true))
  return view
}

const ids = (view: Awaited<ReturnType<typeof renderLoaded>>) => view.result.current.comments.map((c) => c.id)

describe('useActivityComments: Realtime und Löschen', () => {
  beforeEach(() => {
    mocks.rows = [{ id: 'c1' }, { id: 'c2' }]
    mocks.deletedRows = []
    mocks.deleteError = null
    mocks.fetchCount = 0
    mocks.onChange = null
  })

  it('abonniert nur die Kommentare der eigenen Aktivität', async () => {
    await renderLoaded()
    expect(mocks.filter).toBe('activity_id=eq.act-1')
  })

  it('entfernt einen von anderen gelöschten Kommentar ohne neues Laden', async () => {
    const view = await renderLoaded()
    const before = mocks.fetchCount
    act(() => mocks.onChange?.({ eventType: 'DELETE', old: { id: 'c1' } }))
    expect(ids(view)).toEqual(['c2'])
    expect(mocks.fetchCount).toBe(before)
  })

  it('lädt bei neuen Kommentaren neu, weil das Ereignis keinen Autor enthält', async () => {
    await renderLoaded()
    const before = mocks.fetchCount
    await act(async () => mocks.onChange?.({ eventType: 'INSERT', old: {} }))
    expect(mocks.fetchCount).toBe(before + 1)
  })

  it('entfernt den Kommentar, wenn wirklich eine Zeile gelöscht wurde', async () => {
    const view = await renderLoaded()
    mocks.deletedRows = [{ id: 'c1' }]
    let ok = false
    await act(async () => {
      ok = await view.result.current.deleteComment('c1')
    })
    expect(ok).toBe(true)
    expect(ids(view)).toEqual(['c2'])
  })

  it('behält den Kommentar und meldet Fehler, wenn RLS 0 Zeilen löscht', async () => {
    const view = await renderLoaded()
    mocks.deletedRows = []
    let ok = true
    await act(async () => {
      ok = await view.result.current.deleteComment('c1')
    })
    expect(ok).toBe(false)
    expect(ids(view)).toEqual(['c1', 'c2'])
  })

  it('behält den Kommentar bei einem Datenbankfehler', async () => {
    const view = await renderLoaded()
    mocks.deletedRows = null
    mocks.deleteError = { message: 'denied' }
    let ok = true
    await act(async () => {
      ok = await view.result.current.deleteComment('c1')
    })
    expect(ok).toBe(false)
    expect(ids(view)).toEqual(['c1', 'c2'])
  })
})
