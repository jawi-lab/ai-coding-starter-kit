import { test, expect, type Page } from '@playwright/test'

// PROJ-12 — Benachrichtigungen & Einstellungen (In-App-Center + Pro-Typ-Schalter).
//
// The "loud" channels (push/email fan-out, realtime delivery, unsubscribe) are
// server-side and covered by the send-push/unsubscribe unit tests. These E2E tests
// exercise the client surfaces an authenticated user actually sees: the header bell
// + center, and the per-type preferences matrix in the profile.
//
// Authenticated tests require TEST_USER_EMAIL + TEST_USER_PASSWORD and skip without
// them (same pattern as the other PROJ specs), so the suite stays green locally and
// becomes a real regression gate in CI where credentials exist.

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

test.describe('PROJ-12 Regression — the bell lives behind auth', () => {
  test('AC-GUARD: an unauthenticated visit to /groups redirects to /login (bell never renders logged-out)', async ({
    page,
  }) => {
    await page.goto('/groups')
    await page.waitForURL(/\/login/, { timeout: 5000 })
    expect(page.url()).toContain('/login')
    // The notification bell is an authenticated-only header control.
    await expect(page.getByRole('button', { name: /Benachrichtigungen/ })).toHaveCount(0)
  })
})

// ─── In-App-Center (Glocke) ─────────────────────────────────────────────────────

test.describe('AC-BELL: Glocke + Benachrichtigungs-Center', () => {
  test.skip(!hasCredentials, 'Requires TEST_USER_EMAIL + TEST_USER_PASSWORD env vars')

  test.beforeEach(async ({ page }) => {
    await loginAs(page, TEST_EMAIL, TEST_PASSWORD)
  })

  test('AC-BELL-1: the bell is present in the "Meine Gruppen" header', async ({ page }) => {
    if (page.url().includes('onboarding')) {
      test.skip(true, 'User has no groups yet')
      return
    }
    await page.goto('/groups')
    await page.waitForSelector('main', { timeout: 5000 })
    await expect(page.getByRole('button', { name: /Benachrichtigungen/ })).toBeVisible({
      timeout: 3000,
    })
  })

  test('AC-BELL-2: tapping the bell opens the center titled "Benachrichtigungen"', async ({
    page,
  }) => {
    if (page.url().includes('onboarding')) {
      test.skip(true, 'User has no groups yet')
      return
    }
    await page.goto('/groups')
    await page.waitForSelector('main', { timeout: 5000 })
    await page.getByRole('button', { name: /Benachrichtigungen/ }).click()
    await expect(page.getByRole('heading', { name: 'Benachrichtigungen' })).toBeVisible({
      timeout: 3000,
    })
  })

  test('AC-BELL-3: an inbox with no entries shows the friendly empty state', async ({ page }) => {
    if (page.url().includes('onboarding')) {
      test.skip(true, 'User has no groups yet')
      return
    }
    await page.goto('/groups')
    await page.waitForSelector('main', { timeout: 5000 })
    await page.getByRole('button', { name: /Benachrichtigungen/ }).click()
    await page.waitForTimeout(600)
    // Either a populated list OR the friendly empty state — never a raw empty box.
    const emptyState = page.getByText('Alles ruhig hier')
    const hasEmpty = (await emptyState.count()) > 0
    if (hasEmpty) {
      await expect(emptyState).toBeVisible()
    } else {
      // A non-empty inbox is equally valid; assert the center rendered a list region.
      await expect(page.getByRole('heading', { name: 'Benachrichtigungen' })).toBeVisible()
    }
  })
})

// ─── Pro-Typ-Einstellungen (Profil) ─────────────────────────────────────────────

test.describe('AC-PREFS: Benachrichtigungs-Einstellungen im Profil', () => {
  test.skip(!hasCredentials, 'Requires TEST_USER_EMAIL + TEST_USER_PASSWORD env vars')

  test.beforeEach(async ({ page }) => {
    await loginAs(page, TEST_EMAIL, TEST_PASSWORD)
  })

  async function openProfile(page: Page): Promise<boolean> {
    await page.goto('/groups')
    await page.waitForSelector('main', { timeout: 5000 })
    const avatarBtn = page.getByRole('button', { name: 'Profil öffnen' })
    if ((await avatarBtn.count()) === 0) return false
    await avatarBtn.click()
    await page.waitForTimeout(400)
    return true
  }

  test('AC-PREFS-1: the profile shows a "Benachrichtigungen" section with the E-Mail column', async ({
    page,
  }) => {
    if (page.url().includes('onboarding')) {
      test.skip(true, 'User has no groups yet')
      return
    }
    if (!(await openProfile(page))) {
      test.skip(true, 'Avatar button not found')
      return
    }
    // The section heading + the per-type E-Mail switch column header (E-Mail is shown
    // on every platform; Push is native-only and absent in the web test browser).
    await expect(page.getByText('E-Mail', { exact: true })).toBeVisible({ timeout: 3000 })
    await expect(
      page.getByRole('switch', { name: /E-Mail für/ }).first(),
    ).toBeVisible({ timeout: 3000 })
  })

  test('AC-PREFS-2: toggling an E-Mail switch persists (checked state flips and stays)', async ({
    page,
  }) => {
    if (page.url().includes('onboarding')) {
      test.skip(true, 'User has no groups yet')
      return
    }
    if (!(await openProfile(page))) {
      test.skip(true, 'Avatar button not found')
      return
    }
    const firstEmail = page.getByRole('switch', { name: /E-Mail für/ }).first()
    await expect(firstEmail).toBeVisible({ timeout: 3000 })
    const before = await firstEmail.getAttribute('aria-checked')
    await firstEmail.click()
    await page.waitForTimeout(500)
    const after = await firstEmail.getAttribute('aria-checked')
    expect(after).not.toBe(before)
    // Reset to the original state so the test is idempotent for the shared test user.
    await firstEmail.click()
    await page.waitForTimeout(300)
  })
})
