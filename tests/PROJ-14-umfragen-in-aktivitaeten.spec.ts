import { test, expect, type Page } from '@playwright/test'

// PROJ-14 — Umfragen in Aktivitäten (polls inside an activity detail sheet).
//
// Polls live behind auth, inside an activity that has reached at least `zu_planen`,
// and rely on Supabase Realtime for live votes. The deterministic, server-side parts
// (RLS, the umfrage_erstellt fan-out, message text) are covered by the send-push
// unit tests; the form validation + results rendering by the co-located component
// tests (CreatePollSheet.test.tsx, PollCard.test.tsx).
//
// These E2E tests exercise the authenticated client surface. Like the other PROJ
// specs they require TEST_USER_EMAIL + TEST_USER_PASSWORD and self-skip without them,
// so the suite stays green locally and becomes a real regression gate in CI.

const TEST_EMAIL = process.env.TEST_USER_EMAIL ?? ''
const TEST_PASSWORD = process.env.TEST_USER_PASSWORD ?? ''
const hasCredentials = Boolean(TEST_EMAIL && TEST_PASSWORD)

async function loginAs(page: Page, email: string, password: string) {
  await page.goto('/login')
  await page.waitForSelector('form', { timeout: 5000 })
  await page.getByLabel('E-Mail').fill(email)
  await page.getByLabel('Passwort').fill(password)
  await page.getByRole('button', { name: 'Einloggen', exact: true }).click()
  await page.waitForURL(/\/(groups|onboarding)/, { timeout: 10000 })
}

// ─── Regression (no credentials needed) ─────────────────────────────────────────

test.describe('PROJ-14 Regression — polls live behind auth', () => {
  test('AC-GUARD: an unauthenticated visit to /groups/view redirects to /login', async ({
    page,
  }) => {
    await page.goto('/groups/view')
    await page.waitForURL(/\/login/, { timeout: 5000 })
    expect(page.url()).toContain('/login')
    // The poll section only ever renders inside an authenticated activity detail sheet.
    await expect(page.getByRole('button', { name: 'Umfrage starten' })).toHaveCount(0)
  })
})

// ─── Authenticated flows ────────────────────────────────────────────────────────

test.describe('PROJ-14 — poll section in the activity detail', () => {
  test.skip(!hasCredentials, 'Requires TEST_USER_EMAIL + TEST_USER_PASSWORD env vars')

  test.beforeEach(async ({ page }) => {
    await loginAs(page, TEST_EMAIL, TEST_PASSWORD)
    if (page.url().includes('onboarding')) {
      test.skip(true, 'Test account has no group yet')
    }
  })

  // Opens the first activity that exposes a poll section (status >= zu_planen, i.e.
  // a card on the "Planung" board). Returns false when the account has no such
  // activity, so the test self-skips. Selectors mirror the PROJ-6 detail spec.
  async function openActivityWithPolls(page: Page): Promise<boolean> {
    await page.goto('/groups')
    await page.waitForSelector('main', { timeout: 5000 })
    const firstGroup = page.locator('button.rounded-\\[18px\\]').first()
    if ((await firstGroup.count()) === 0) return false
    await firstGroup.click()
    await page.waitForTimeout(600)

    // Polls appear from `zu_planen` upward → the planning board, not the proposals tab.
    const planungBtn = page.getByRole('button', { name: 'Planung' })
    if ((await planungBtn.count()) === 0) return false
    await expect(planungBtn).toBeEnabled({ timeout: 3000 })
    await planungBtn.click()
    await page.waitForTimeout(800)

    const kanbanCards = page.locator('[class*="rounded-\\[18px\\]"][class*="cursor-pointer"]')
    if ((await kanbanCards.count()) === 0) return false
    await kanbanCards.first().click()
    await page.waitForTimeout(800)

    // The poll section header appears once the detail sheet is mounted.
    const header = page.getByRole('heading', { name: 'Umfragen' })
    try {
      await header.waitFor({ timeout: 4000 })
    } catch {
      return false
    }
    return true
  }

  test('AC-CREATE-1: the poll section shows a "Umfrage starten" entry point', async ({ page }) => {
    if (!(await openActivityWithPolls(page))) {
      test.skip(true, 'No activity with a visible poll section on this account')
      return
    }
    await expect(page.getByRole('button', { name: 'Umfrage starten' }).first()).toBeVisible()
  })

  test('AC-CREATE-2: the create form requires a question and validates it', async ({ page }) => {
    if (!(await openActivityWithPolls(page))) {
      test.skip(true, 'No activity with a visible poll section on this account')
      return
    }
    await page.getByRole('button', { name: 'Umfrage starten' }).first().click()
    await expect(page.getByRole('dialog')).toBeVisible()
    // Submit empty → the question error surfaces, the dialog stays open.
    await page.getByRole('button', { name: 'Speichern' }).click()
    await expect(page.getByText('Frage ist erforderlich')).toBeVisible()
    await expect(page.getByRole('dialog')).toBeVisible()
  })

  test('AC-CREATE-3: creating a poll makes it appear at the top of the section', async ({
    page,
  }) => {
    if (!(await openActivityWithPolls(page))) {
      test.skip(true, 'No activity with a visible poll section on this account')
      return
    }
    const q = `E2E Umfrage ${Date.now()}`
    await page.getByRole('button', { name: 'Umfrage starten' }).first().click()
    await page.getByPlaceholder('z. B. Welches Restaurant?').fill(q)
    await page.getByPlaceholder('Option 1').fill('Option A')
    await page.getByPlaceholder('Option 2').fill('Option B')
    await page.getByRole('button', { name: 'Speichern' }).click()

    // The new poll renders (realtime + refetch) with its options.
    await expect(page.getByText(q)).toBeVisible({ timeout: 6000 })
    await expect(page.getByText('Option A')).toBeVisible()

    // Cleanup: remove the poll we just created (creator can delete).
    const card = page.locator('div', { hasText: q }).last()
    const del = card.getByRole('button', { name: 'Umfrage löschen' }).first()
    if (await del.count()) {
      await del.click()
      await page.getByRole('button', { name: 'Löschen' }).click()
      await expect(page.getByText(q)).toHaveCount(0, { timeout: 6000 })
    }
  })

  test('AC-VOTE-1: tapping an option toggles the current user\'s vote', async ({ page }) => {
    if (!(await openActivityWithPolls(page))) {
      test.skip(true, 'No activity with a visible poll section on this account')
      return
    }
    const q = `E2E Vote ${Date.now()}`
    await page.getByRole('button', { name: 'Umfrage starten' }).first().click()
    await page.getByPlaceholder('z. B. Welches Restaurant?').fill(q)
    await page.getByPlaceholder('Option 1').fill('Ja')
    await page.getByPlaceholder('Option 2').fill('Nein')
    await page.getByRole('button', { name: 'Speichern' }).click()
    await expect(page.getByText(q)).toBeVisible({ timeout: 6000 })

    const yes = page.getByRole('button', { name: /Ja/ }).first()
    await yes.click()
    await expect(yes).toHaveAttribute('aria-pressed', 'true', { timeout: 4000 })
    // Toggle back off.
    await yes.click()
    await expect(yes).toHaveAttribute('aria-pressed', 'false', { timeout: 4000 })

    // Cleanup.
    const card = page.locator('div', { hasText: q }).last()
    const del = card.getByRole('button', { name: 'Umfrage löschen' }).first()
    if (await del.count()) {
      await del.click()
      await page.getByRole('button', { name: 'Löschen' }).click()
      await expect(page.getByText(q)).toHaveCount(0, { timeout: 6000 })
    }
  })
})
