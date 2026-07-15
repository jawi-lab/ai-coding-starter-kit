import { test, expect, type Page } from '@playwright/test'

// PROJ-16 — Persönliche Rollen-Badges (Profil-Sektion, Mitgliederliste, Toast).
//
// Die Zähl-Automatik (Recount, Deduplizierung, Monotonie, Backfill) ist
// DB-getrieben und in badges.test.ts + badge-toasts.test.ts abgedeckt; sie
// wurde zusätzlich per Rollback-Transaktionen und manuell via Chrome DevTools
// gegen die echte Supabase-Instanz verifiziert (siehe QA-Ergebnisse in der
// Spec). Diese E2E-Tests sichern die stabilen Client-Oberflächen: die
// Badge-Sektion im Profil und die Badge-Icons in der Mitgliederliste —
// account-unabhängig formuliert, damit sie mit jedem Testaccount laufen.
//
// Authentifizierte Tests brauchen TEST_USER_EMAIL + TEST_USER_PASSWORD und
// skippen sonst (gleiches Muster wie die anderen PROJ-Specs).

const TEST_EMAIL = process.env.TEST_USER_EMAIL ?? ''
const TEST_PASSWORD = process.env.TEST_USER_PASSWORD ?? ''
const hasCredentials = Boolean(TEST_EMAIL && TEST_PASSWORD)

const BADGE_NAMES = ['Ideengeber', 'Entscheider', 'Planer', 'Immer dabei'] as const

async function loginAs(page: Page, email: string, password: string) {
  await page.goto('/login')
  await page.waitForSelector('form', { timeout: 5000 })
  await page.getByLabel('E-Mail').fill(email)
  await page.getByLabel('Passwort').fill(password)
  await page.getByRole('button', { name: 'Einloggen', exact: true }).click()
  await page.waitForURL(/\/(groups|onboarding)/, { timeout: 10000 })
}

/**
 * Öffnet das Profil-Sheet — mobile über den Bottom-Nav-Button „Profil",
 * desktop über den Sidebar-Button „… Profil & Archiv".
 */
async function openProfile(page: Page) {
  await page.goto('/groups')
  await page.waitForSelector('main', { timeout: 5000 })
  await page
    .getByRole('button', { name: /Profil( & Archiv)?$/ })
    .first()
    .click()
  await expect(page.getByRole('heading', { name: 'Meine Badges' })).toBeVisible({ timeout: 8000 })
}

/** Öffnet die Gruppen-Einstellungen (Mitgliederliste) der ersten Gruppe des Accounts. */
async function openMemberList(page: Page): Promise<boolean> {
  await page.goto('/groups')
  const groupCard = page.getByRole('button', { name: /Mitglied(er)? · / }).first()
  await groupCard.waitFor({ state: 'visible', timeout: 8000 }).catch(() => null)
  if (!(await groupCard.count())) return false
  await groupCard.click()
  await page.waitForURL(/\/groups\/view\/?\?id=/, { timeout: 8000 })
  await page.getByRole('button', { name: 'Gruppen-Einstellungen öffnen' }).click()
  await expect(page.getByText(/^Mitglieder \(/)).toBeVisible({ timeout: 8000 })
  return true
}

// ─── Regression (ohne Credentials) ──────────────────────────────────────────────

test.describe('PROJ-16 Regression — Badges leben hinter Auth', () => {
  test('AC-GUARD: unauthentifiziert gibt es keine Badge-Daten — /groups leitet auf /login um', async ({
    page,
  }) => {
    await page.goto('/groups')
    await page.waitForURL(/\/login/, { timeout: 5000 })
    expect(page.url()).toContain('/login')
    await expect(page.getByText('Meine Badges')).toHaveCount(0)
  })
})

// ─── Authentifiziert ────────────────────────────────────────────────────────────

test.describe('PROJ-16 — Badge-Sektion im Profil', () => {
  test.skip(!hasCredentials, 'TEST_USER_EMAIL/TEST_USER_PASSWORD nicht gesetzt')

  test.beforeEach(async ({ page }) => {
    await loginAs(page, TEST_EMAIL, TEST_PASSWORD)
  })

  test('AC-PROFIL-1: das Profil zeigt alle vier Badges mit Stufe oder „Noch nicht erreicht"', async ({
    page,
  }) => {
    await openProfile(page)
    const dialog = page.getByRole('dialog', { name: 'Mein Konto' })

    for (const name of BADGE_NAMES) {
      const title = dialog.getByText(name, { exact: true })
      await expect(title).toBeVisible()
      // Jede Karte trägt entweder einen Stufen-Chip („🥉 Bronze" etc.)
      // oder den ausgegrauten Zustand „Noch nicht erreicht".
      const card = title.locator(
        'xpath=ancestor::div[contains(@class, "rounded-md") and contains(@class, "border")][1]',
      )
      await expect(
        card.getByText(/^(🥉 Bronze|🥈 Silber|🥇 Gold|Noch nicht erreicht)$/),
      ).toBeVisible()
    }
  })

  test('AC-PROFIL-2: unterhalb von Gold zeigt jede Badge-Karte Fortschrittsbalken + „Noch X bis …", ab Gold die Rohzahl', async ({
    page,
  }) => {
    await openProfile(page)
    const dialog = page.getByRole('dialog', { name: 'Mein Konto' })

    for (const name of BADGE_NAMES) {
      const card = dialog
        .getByText(name, { exact: true })
        .locator('xpath=ancestor::div[contains(@class, "rounded-md") and contains(@class, "border")][1]')

      const isGold = (await card.getByText(/^🥇 Gold$/).count()) > 0
      if (isGold) {
        // Gold: Rohzahl statt Balken (Spec).
        await expect(card.getByText(/^\d+ Aktion(en)?$/)).toBeVisible()
        await expect(card.getByRole('progressbar')).toHaveCount(0)
      } else {
        await expect(card.getByRole('progressbar')).toBeVisible()
        await expect(card.getByText(/^Noch \d+ bis (Bronze|Silber|Gold)$/)).toBeVisible()
      }
    }
  })

  test('AC-PROFIL-3: die Badge-Sektion blockiert das restliche Profil nicht (Darstellung & Logout bleiben bedienbar)', async ({
    page,
  }) => {
    await openProfile(page)
    const dialog = page.getByRole('dialog', { name: 'Mein Konto' })
    // Kernfunktionen des Profils unterhalb der Badge-Sektion sind erreichbar.
    await expect(dialog.getByText('Darstellung', { exact: true })).toBeVisible()
    await expect(dialog.getByRole('button', { name: 'Ausloggen' })).toBeVisible()
  })
})

test.describe('PROJ-16 — Badge-Icons in der Mitgliederliste', () => {
  test.skip(!hasCredentials, 'TEST_USER_EMAIL/TEST_USER_PASSWORD nicht gesetzt')

  test.beforeEach(async ({ page }) => {
    await loginAs(page, TEST_EMAIL, TEST_PASSWORD)
  })

  test('AC-LISTE-1: verdiente Badges erscheinen als kleine Icons mit Stufen-Kennzeichnung (aria-label)', async ({
    page,
  }) => {
    if (!(await openMemberList(page))) {
      test.skip(true, 'Account hat keine Gruppe')
      return
    }
    // Badge-Pills tragen ein sprechendes aria-label „Badge: {Name}, Stufe {Stufe}".
    // Ob welche existieren, hängt vom Datenstand ab — wenn ja, müssen sie dem
    // Muster entsprechen (nur verdiente Stufen, feste Namen).
    const pills = page.locator('[aria-label^="Badge: "]')
    const count = await pills.count()
    for (let i = 0; i < count; i++) {
      await expect(pills.nth(i)).toHaveAttribute(
        'aria-label',
        /^Badge: (Ideengeber|Entscheider|Planer|Immer dabei), Stufe (Bronze|Silber|Gold)$/,
      )
    }
  })

  test('AC-LISTE-2: die Mitgliederliste zeigt niemals Zähler oder Fortschritt anderer', async ({
    page,
  }) => {
    if (!(await openMemberList(page))) {
      test.skip(true, 'Account hat keine Gruppe')
      return
    }
    const dialog = page.getByRole('dialog')
    // Kein Fortschrittstext, kein Fortschrittsbalken, keine Rohzahlen in der Liste.
    await expect(dialog.getByText(/Noch \d+ bis /)).toHaveCount(0)
    await expect(dialog.getByRole('progressbar')).toHaveCount(0)
    await expect(dialog.getByText(/^\d+ Aktion(en)?$/)).toHaveCount(0)
  })
})
