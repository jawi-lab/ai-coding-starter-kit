import { test, expect, type Page } from '@playwright/test'

// Authenticated tests require: TEST_USER_EMAIL + TEST_USER_PASSWORD env vars.
// The full 3-step intro (Welcome → Profile → Group) only renders for a profile
// with `onboarded = false`; a normal test account is already onboarded, so those
// tests self-skip gracefully when the intro is not shown.
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

// ─── Regression: Auth guard on /onboarding ──────────────────────────────────────

test.describe('PROJ-13 Regression — Auth guard', () => {
  test('AC-GUARD: Unauthenticated user visiting /onboarding is redirected to /login', async ({
    page,
  }) => {
    await page.goto('/onboarding')
    await page.waitForURL(/\/login/, { timeout: 5000 })
    expect(page.url()).toContain('/login')
  })
})

// ─── Authenticated onboarding flow ──────────────────────────────────────────────

test.describe('PROJ-13 Onboarding flow', () => {
  test.skip(!hasCredentials, 'Requires TEST_USER_EMAIL + TEST_USER_PASSWORD env vars')

  test('AC-GROUP-STEP: /onboarding shows the "Wie möchtest du starten?" group step', async ({
    page,
  }) => {
    await loginAs(page, TEST_EMAIL, TEST_PASSWORD)
    await page.goto('/onboarding')
    await page.waitForSelector('main', { timeout: 5000 })

    // Either the full intro (welcome first) or the group-only step is shown.
    // Advance past welcome + profile if present so we land on the group step.
    const losGehts = page.getByRole('button', { name: /Los geht/ })
    if (await losGehts.count()) {
      await losGehts.click()
      const weiter = page.getByRole('button', { name: 'Weiter' })
      if (await weiter.count()) await weiter.click()
    }

    await expect(
      page.getByRole('heading', { name: /Wie möchtest du starten|Gemeinsam etwas/ })
    ).toBeVisible({ timeout: 3000 })
  })

  test('AC-GROUP-CARDS: Group step offers "Gruppe gründen" and "Code eingeben"', async ({
    page,
  }) => {
    await loginAs(page, TEST_EMAIL, TEST_PASSWORD)
    await page.goto('/onboarding')
    await page.waitForSelector('main', { timeout: 5000 })

    const losGehts = page.getByRole('button', { name: /Los geht/ })
    if (await losGehts.count()) {
      await losGehts.click()
      const weiter = page.getByRole('button', { name: 'Weiter' })
      if (await weiter.count()) await weiter.click()
    }

    const createCard = page.getByText('Gruppe gründen')
    const joinCard = page.getByText('Code eingeben')
    if ((await createCard.count()) === 0) {
      test.skip(true, 'Group step not reachable for this account state')
      return
    }
    await expect(createCard).toBeVisible({ timeout: 3000 })
    await expect(joinCard).toBeVisible({ timeout: 3000 })

    // "Gruppe gründen" reveals the CreateGroupForm; "← Zurück zur Auswahl" returns.
    await createCard.click()
    await expect(page.getByText('← Zurück zur Auswahl')).toBeVisible({ timeout: 3000 })
    await page.getByText('← Zurück zur Auswahl').click()
    await expect(joinCard).toBeVisible({ timeout: 3000 })
  })

  test('AC-SIGNOUT: "Abmelden" ends the session and returns to /login', async ({ page }) => {
    await loginAs(page, TEST_EMAIL, TEST_PASSWORD)
    await page.goto('/onboarding')
    await page.waitForSelector('main', { timeout: 5000 })

    const abmelden = page.getByRole('button', { name: 'Abmelden' })
    if ((await abmelden.count()) === 0) {
      test.skip(true, 'Onboarding flow not shown (user already in a group)')
      return
    }
    await abmelden.click()
    await page.waitForURL(/\/login/, { timeout: 5000 })
    expect(page.url()).toContain('/login')
  })
})
