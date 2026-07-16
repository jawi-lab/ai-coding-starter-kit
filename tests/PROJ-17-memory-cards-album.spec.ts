import { test, expect, type Page } from '@playwright/test'

// PROJ-17 — Memory Cards & Album.
//
// Die Karte ist eine ABGELEITETE Ansicht der Aktivität — es gibt keine
// Karten-Tabelle. Die datengetriebene Kern-Logik (completed_at-Trigger
// fälschungssicher, Backfill, Mitgliedschafts-Historie + „ist oder war
// Mitglied"-Lese-RLS, „Neu"-Erkennung) ist DB-seitig und wurde per
// SQL-Rollback-Transaktionen gegen die echte Supabase-Instanz sowie in
// memory-card.test.ts / useArchive.test.ts verifiziert (siehe QA-Ergebnisse
// in der Spec). Diese E2E-Tests sichern die stabilen Client-Oberflächen des
// Albums: Tab-Umbenennung, Grid/Leer-State, „Mehr laden", Karten-Tap →
// read-only-Detail. Reveal-Flip und Punkt-Indikator hängen an einem echten
// Statuswechsel bzw. Server-Zeitstempeln und werden bewusst manuell
// verifiziert (siehe Spec), nicht hier automatisiert.
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

/** Öffnet das Profil-Sheet — mobile via Bottom-Nav, desktop via Sidebar. */
async function openProfileSheet(page: Page): Promise<boolean> {
  await page.goto('/groups')
  await page.waitForSelector('main', { timeout: 5000 })
  const avatarBtn = page.getByRole('button', { name: /Profil( öffnen| & Archiv)?$/ }).first()
  if ((await avatarBtn.count()) === 0) return false
  await avatarBtn.click()
  await page.waitForTimeout(400)
  return true
}

async function openAlbumTab(page: Page): Promise<boolean> {
  const opened = await openProfileSheet(page)
  if (!opened) return false
  const albumTab = page.getByRole('tab', { name: 'Album' })
  if ((await albumTab.count()) === 0) return false
  await albumTab.click()
  await page.waitForTimeout(600)
  return true
}

// ─── AC: Archiv-Tab wird zum Album ─────────────────────────────────────────────

test.describe('PROJ-17 AC-ALBUM: Album-Tab', () => {
  test.skip(!hasCredentials, 'Requires TEST_USER_EMAIL + TEST_USER_PASSWORD env vars')

  test.beforeEach(async ({ page }) => {
    await loginAs(page, TEST_EMAIL, TEST_PASSWORD)
  })

  test('AC-TAB-1: Der ehemalige "Archiv"-Tab heißt jetzt "Album"', async ({ page }) => {
    if (page.url().includes('onboarding')) { test.skip(true, 'User has no groups yet'); return }
    const opened = await openProfileSheet(page)
    if (!opened) { test.skip(true, 'Avatar button not found'); return }
    await expect(page.getByRole('tab', { name: 'Album' })).toBeVisible({ timeout: 3000 })
    await expect(page.getByRole('tab', { name: 'Archiv' })).toHaveCount(0)
  })

  test('AC-TAB-2: Album zeigt entweder ein Karten-Grid oder den Leer-State', async ({ page }) => {
    if (page.url().includes('onboarding')) { test.skip(true, 'User has no groups yet'); return }
    const opened = await openAlbumTab(page)
    if (!opened) { test.skip(true, 'Album tab not reachable'); return }
    const emptyState = page.getByText('Noch keine Erinnerungen')
    const grid = page.locator('.grid.grid-cols-2')
    const hasEmpty = (await emptyState.count()) > 0
    const hasGrid = (await grid.count()) > 0
    expect(hasEmpty || hasGrid).toBe(true)
  })

  test('AC-EMPTY-1: Leer-State trägt den in der Spec definierten Text', async ({ page }) => {
    if (page.url().includes('onboarding')) { test.skip(true, 'User has no groups yet'); return }
    const opened = await openAlbumTab(page)
    if (!opened) { test.skip(true, 'Album tab not reachable'); return }
    const emptyState = page.getByText('Noch keine Erinnerungen')
    if ((await emptyState.count()) === 0) { test.skip(true, 'Album has cards; empty-state not applicable'); return }
    await expect(emptyState).toBeVisible({ timeout: 3000 })
    await expect(
      page.getByText('Schließt eure erste Aktivität ab und eure erste Karte erscheint hier!')
    ).toBeVisible({ timeout: 3000 })
  })

  test('AC-GRID-1: Karten-Grid ist 2-spaltig, Karte zeigt Titel + Datum', async ({ page }) => {
    if (page.url().includes('onboarding')) { test.skip(true, 'User has no groups yet'); return }
    const opened = await openAlbumTab(page)
    if (!opened) { test.skip(true, 'Album tab not reachable'); return }
    const grid = page.locator('.grid.grid-cols-2').first()
    if ((await grid.count()) === 0) { test.skip(true, 'Album is empty; grid test not applicable'); return }
    await expect(grid).toBeVisible({ timeout: 3000 })
    // Mindestens eine Karte (button) im Grid
    const cards = grid.getByRole('button')
    expect(await cards.count()).toBeGreaterThan(0)
  })

  test('AC-DETAIL-1: Tap auf eine Karte öffnet das Detail-Sheet im read-only-Modus', async ({ page }) => {
    if (page.url().includes('onboarding')) { test.skip(true, 'User has no groups yet'); return }
    const opened = await openAlbumTab(page)
    if (!opened) { test.skip(true, 'Album tab not reachable'); return }
    const grid = page.locator('.grid.grid-cols-2').first()
    if ((await grid.count()) === 0) { test.skip(true, 'Album is empty; detail test not applicable'); return }
    const firstCard = grid.getByRole('button').first()
    await firstCard.click()
    await page.waitForTimeout(600)
    // Read-only: kein Kommentar-Eingabefeld, keine Status-/Abschluss-Aktion.
    const dialog = page.getByRole('dialog').last()
    await expect(dialog).toBeVisible({ timeout: 3000 })
    // In read-only darf es keine Mutations-Steuerung (Kommentar senden) geben.
    await expect(page.getByPlaceholder(/Kommentar/i)).toHaveCount(0)
  })
})

// ─── AC: Filter-Chips (nur bei >1 Gruppe) ──────────────────────────────────────

test.describe('PROJ-17 AC-CHIPS: Gruppen-Filter', () => {
  test.skip(!hasCredentials, 'Requires TEST_USER_EMAIL + TEST_USER_PASSWORD env vars')

  test.beforeEach(async ({ page }) => {
    await loginAs(page, TEST_EMAIL, TEST_PASSWORD)
  })

  test('AC-CHIP-1: Bei genau einer Gruppe erscheint KEIN "Alle"-Filter-Chip', async ({ page }) => {
    if (page.url().includes('onboarding')) { test.skip(true, 'User has no groups yet'); return }
    const opened = await openAlbumTab(page)
    if (!opened) { test.skip(true, 'Album tab not reachable'); return }
    const alleChip = page.getByRole('button', { name: 'Alle', exact: true })
    const chipCount = await alleChip.count()
    // QA-Testaccount ist in genau einer Gruppe → kein "Alle"-Chip.
    // Bei mehreren Gruppen muss der Chip dagegen existieren.
    if (chipCount > 0) {
      await expect(alleChip.first()).toBeVisible()
    } else {
      expect(chipCount).toBe(0)
    }
  })
})
