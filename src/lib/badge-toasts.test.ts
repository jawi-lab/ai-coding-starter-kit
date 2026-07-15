import { describe, it, expect, vi, beforeEach } from 'vitest'
import { seedBadgeBaseline, checkBadgeToast, resetBadgeToastStateForTests } from './badge-toasts'

const mocks = vi.hoisted(() => ({
  toast: vi.fn(),
  getSession: vi.fn(),
  /** Ergebnis des Seed-Selects (alle Badges des Nutzers). */
  seedResult: vi.fn(),
  /** Ergebnis des Einzel-Selects nach einer Aktion. */
  rowResult: vi.fn(),
}))

vi.mock('sonner', () => ({ toast: mocks.toast }))

vi.mock('@/lib/supabase', () => ({
  supabase: {
    auth: { getSession: mocks.getSession },
    from: () => ({
      select: () => ({
        eq: () => ({
          // Seed-Pfad: .select().eq() wird direkt awaited (thenable).
          then: (onFulfilled: (v: unknown) => unknown) =>
            Promise.resolve(mocks.seedResult()).then(onFulfilled),
          // Check-Pfad: .select().eq().eq().maybeSingle()
          eq: () => ({ maybeSingle: () => Promise.resolve(mocks.rowResult()) }),
        }),
      }),
    }),
  },
}))

function loggedInAs(userId: string | null) {
  mocks.getSession.mockResolvedValue({
    data: { session: userId ? { user: { id: userId } } : null },
  })
}

function seedRows(tiers: Record<string, number>) {
  mocks.seedResult.mockReturnValue({
    data: Object.entries(tiers).map(([badge, tier]) => ({
      badge,
      highest_earned_tier: tier,
    })),
    error: null,
  })
}

describe('checkBadgeToast', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    resetBadgeToastStateForTests()
    loggedInAs('user-1')
  })

  it('toastet beim Stufen-Aufstieg (0 → Bronze)', async () => {
    seedRows({ ideengeber: 0, entscheider: 0, planer: 0, immer_dabei: 0 })
    await seedBadgeBaseline('user-1')

    mocks.rowResult.mockReturnValue({ data: { highest_earned_tier: 5 }, error: null })
    await checkBadgeToast('ideengeber')

    expect(mocks.toast).toHaveBeenCalledTimes(1)
    expect(mocks.toast).toHaveBeenCalledWith(
      'Neues Badge: Ideengeber 🥉',
      expect.objectContaining({ description: expect.stringContaining('Bronze') })
    )
  })

  it('toastet NICHT, wenn die Stufe gleich bleibt (Aktion 6 von 15)', async () => {
    seedRows({ entscheider: 5 })
    await seedBadgeBaseline('user-1')

    mocks.rowResult.mockReturnValue({ data: { highest_earned_tier: 5 }, error: null })
    await checkBadgeToast('entscheider')

    expect(mocks.toast).not.toHaveBeenCalled()
  })

  it('toastet bei übersprungenen Stufen nur die höchste', async () => {
    seedRows({ planer: 0 })
    await seedBadgeBaseline('user-1')

    mocks.rowResult.mockReturnValue({ data: { highest_earned_tier: 15 }, error: null })
    await checkBadgeToast('planer')

    expect(mocks.toast).toHaveBeenCalledTimes(1)
    expect(mocks.toast.mock.calls[0][0]).toBe('Neues Badge: Planer 🥈')
  })

  it('toastet nach der Baseline-Aktualisierung nicht erneut für dieselbe Stufe', async () => {
    seedRows({ immer_dabei: 0 })
    await seedBadgeBaseline('user-1')

    mocks.rowResult.mockReturnValue({ data: { highest_earned_tier: 5 }, error: null })
    await checkBadgeToast('immer_dabei')
    await checkBadgeToast('immer_dabei')

    expect(mocks.toast).toHaveBeenCalledTimes(1)
  })

  it('toastet nicht ohne Baseline (Seed nie gelaufen) — lieber verpasst als falsch', async () => {
    mocks.rowResult.mockReturnValue({ data: { highest_earned_tier: 5 }, error: null })
    await checkBadgeToast('ideengeber')

    expect(mocks.toast).not.toHaveBeenCalled()
  })

  it('toastet nicht, wenn der Seed fehlschlug (Badge ohne Baseline-Eintrag)', async () => {
    mocks.seedResult.mockReturnValue({ data: null, error: { message: 'network' } })
    await seedBadgeBaseline('user-1')

    mocks.rowResult.mockReturnValue({ data: { highest_earned_tier: 5 }, error: null })
    await checkBadgeToast('ideengeber')

    expect(mocks.toast).not.toHaveBeenCalled()
  })

  it('toastet nicht ohne eingeloggte Session', async () => {
    seedRows({ ideengeber: 0 })
    await seedBadgeBaseline('user-1')
    loggedInAs(null)

    await checkBadgeToast('ideengeber')

    expect(mocks.toast).not.toHaveBeenCalled()
  })

  it('toastet nicht für einen anderen Nutzer als die Baseline (Account-Wechsel)', async () => {
    seedRows({ ideengeber: 0 })
    await seedBadgeBaseline('user-1')
    loggedInAs('user-2')

    mocks.rowResult.mockReturnValue({ data: { highest_earned_tier: 5 }, error: null })
    await checkBadgeToast('ideengeber')

    expect(mocks.toast).not.toHaveBeenCalled()
  })
})
