import { test, expect, type Page } from '@playwright/test'

// PROJ-15 — Gruppen-Momentum (Banner, Level-Leiter, Meilenstein-Feier).
//
// Die Feier-Mechanik (Realtime-Trigger, Einmaligkeit, Anti-Farming, Nachholen
// des höchsten Meilensteins) ist DB-getrieben und in useGroupMomentum.test.ts
// + momentum.test.ts abgedeckt; sie wurde zusätzlich manuell per Chrome
// DevTools gegen die echte Supabase-Instanz verifiziert (siehe QA-Ergebnisse
// in der Spec). Diese E2E-Tests sichern die stabilen Client-Oberflächen:
// Banner im Vorschläge-Tab und die Level-Leiter.
//
// Authentifizierte Tests brauchen TEST_USER_EMAIL + TEST_USER_PASSWORD und
// skippen sonst (gleiches Muster wie die anderen PROJ-Specs).

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

/**
 * Öffnet den Vorschläge-Tab der ersten Gruppe des Accounts.
 * Desktop hat keine Bottom-Nav — deshalb über die Gruppen-Karte auf Home
 * (funktioniert in beiden Viewports) und die Tab-URL direkt ansteuern.
 */
async function openVorschlaegeTab(page: Page): Promise<boolean> {
  await page.goto('/groups')
  // Die Gruppenliste lädt asynchron aus Supabase — auf die erste Karte warten.
  const groupCard = page.getByRole('button', { name: /Mitglied(er)? · / }).first()
  await groupCard.waitFor({ state: 'visible', timeout: 8000 }).catch(() => null)
  if (!(await groupCard.count())) return false
  await groupCard.click()
  await page.waitForURL(/\/groups\/view\/?\?id=/, { timeout: 8000 })
  const id = new URL(page.url()).searchParams.get('id')
  if (!id) return false
  await page.goto(`/groups/view/?id=${id}&tab=vorschlaege`)
  await page.waitForURL(/tab=vorschlaege/, { timeout: 8000 })
  return true
}

// ─── Regression (ohne Credentials) ──────────────────────────────────────────────

test.describe('PROJ-15 Regression — Momentum lebt hinter Auth', () => {
  test('AC-GUARD: unauthentifizierter Besuch der Gruppen-Ansicht landet auf /login (kein Banner)', async ({
    page,
  }) => {
    await page.goto('/groups/view/?id=00000000-0000-0000-0000-000000000000&tab=vorschlaege')
    await page.waitForURL(/\/login/, { timeout: 5000 })
    expect(page.url()).toContain('/login')
    await expect(page.getByText('Gruppen-Momentum')).toHaveCount(0)
  })
})

// ─── Authentifiziert ────────────────────────────────────────────────────────────

test.describe('PROJ-15 — Momentum-Banner & Level-Leiter', () => {
  test.skip(!hasCredentials, 'TEST_USER_EMAIL/TEST_USER_PASSWORD nicht gesetzt')

  test.beforeEach(async ({ page }) => {
    await loginAs(page, TEST_EMAIL, TEST_PASSWORD)
  })

  test('AC-BANNER-1: der Vorschläge-Tab zeigt das Momentum-Banner mit Level-Name und Zähler', async ({
    page,
  }) => {
    if (!(await openVorschlaegeTab(page))) {
      test.skip(true, 'Account hat keine Gruppe')
      return
    }
    // Banner ist ein Button (öffnet die Leiter) mit sprechendem aria-label.
    const banner = page.getByRole('button', { name: /^Gruppen-Momentum:/ })
    await expect(banner).toBeVisible({ timeout: 8000 })
    // Level-Name + Zahl stehen im Label (z.B. "Neue Gruppe, 0 abgeschlossene Aktivitäten")
    await expect(banner).toHaveAttribute(
      'aria-label',
      /(Neue Gruppe|Gruppe|Eingespielte Gruppe|Legendäre Gruppe), \d+ abgeschlossene Aktivitäten/,
    )
  })

  test('AC-BANNER-2: unterhalb des höchsten Levels zeigt das Banner den Fortschrittstext „Noch N bis …"', async ({
    page,
  }) => {
    if (!(await openVorschlaegeTab(page))) {
      test.skip(true, 'Account hat keine Gruppe')
      return
    }
    const banner = page.getByRole('button', { name: /^Gruppen-Momentum:/ })
    await expect(banner).toBeVisible({ timeout: 8000 })

    const label = (await banner.getAttribute('aria-label')) ?? ''
    if (label.includes('Legendäre Gruppe')) {
      // Höchstes Level: bewusst KEIN Fortschrittsbalken/-text.
      await expect(banner.getByText(/^Noch \d+ bis /)).toHaveCount(0)
    } else {
      await expect(banner.getByText(/^Noch \d+ bis /)).toBeVisible()
    }
  })

  test('AC-LADDER-1: Antippen des Banners öffnet die Level-Leiter mit allen 4 Leveln und Schwellen', async ({
    page,
  }) => {
    if (!(await openVorschlaegeTab(page))) {
      test.skip(true, 'Account hat keine Gruppe')
      return
    }
    await page.getByRole('button', { name: /^Gruppen-Momentum:/ }).click()

    const sheet = page.getByRole('dialog', { name: 'Eure Gruppen-Reise' })
    await expect(sheet).toBeVisible({ timeout: 5000 })

    // Alle 4 Level mit ihren Schwellen (0 = Startpunkt, dann 5/10/25).
    await expect(sheet.getByText('Neue Gruppe', { exact: true })).toBeVisible()
    await expect(sheet.getByText('Startpunkt eurer Reise')).toBeVisible()
    await expect(sheet.getByText('Gruppe', { exact: true })).toBeVisible()
    await expect(sheet.getByText('Ab 5 abgeschlossenen Aktivitäten')).toBeVisible()
    await expect(sheet.getByText('Eingespielte Gruppe', { exact: true })).toBeVisible()
    await expect(sheet.getByText('Ab 10 abgeschlossenen Aktivitäten')).toBeVisible()
    await expect(sheet.getByText('Legendäre Gruppe', { exact: true })).toBeVisible()
    await expect(sheet.getByText('Ab 25 abgeschlossenen Aktivitäten')).toBeVisible()

    // Genau ein Level ist als aktuell markiert.
    await expect(sheet.getByText('Aktuell', { exact: true })).toHaveCount(1)
  })

  test('AC-LADDER-2: die Leiter lässt sich schließen und der Tab bleibt nutzbar', async ({
    page,
  }) => {
    if (!(await openVorschlaegeTab(page))) {
      test.skip(true, 'Account hat keine Gruppe')
      return
    }
    await page.getByRole('button', { name: /^Gruppen-Momentum:/ }).click()
    const sheet = page.getByRole('dialog', { name: 'Eure Gruppen-Reise' })
    await expect(sheet).toBeVisible({ timeout: 5000 })

    await page.getByRole('button', { name: 'Schließen' }).click()
    await expect(sheet).toHaveCount(0, { timeout: 5000 })
    // Filter-Chips weiterhin bedienbar (kein hängender Overlay-Zustand).
    await expect(page.getByRole('button', { name: 'Alle' })).toBeVisible()
  })

  test('AC-ROLLE: das Banner ist unabhängig von der Rolle sichtbar (kollektiv)', async ({
    page,
  }) => {
    // Der Testaccount kann Admin/Redakteur/Beobachter sein — das Banner muss
    // in jedem Fall sichtbar sein (rollenunabhängige Anzeige laut Spec).
    if (!(await openVorschlaegeTab(page))) {
      test.skip(true, 'Account hat keine Gruppe')
      return
    }
    await expect(page.getByRole('button', { name: /^Gruppen-Momentum:/ })).toBeVisible({
      timeout: 8000,
    })
  })
})
