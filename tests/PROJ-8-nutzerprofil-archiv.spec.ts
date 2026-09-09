import { test, expect, type Page } from '@playwright/test'

// Authenticated tests require: TEST_USER_EMAIL + TEST_USER_PASSWORD env vars
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
 * Öffnet das Profil-Sheet — mobil über die Bottom-Nav („Profil"), auf dem
 * Desktop über die Sidebar („… Profil & Archiv").
 *
 * Wirft absichtlich, statt `false` zurückzugeben: Die frühere Variante suchte
 * einen Button „Profil öffnen", den es nach dem Nav-Umbau nicht mehr gibt, und
 * ließ daraufhin *jeden* Test der Datei stumm skippen — grüne Läufe, die nichts
 * bewiesen. Ein fehlender Einstiegspunkt ist ein Fehler, kein Skip-Grund.
 */
async function openProfileSheet(page: Page) {
  await page.goto('/groups')
  await page.waitForSelector('main', { timeout: 5000 })
  const avatarBtn = page.getByRole('button', { name: /Profil( öffnen| & Archiv)?$/ }).first()
  await expect(
    avatarBtn,
    'Einstiegspunkt ins Profil-Sheet nicht gefunden (Bottom-Nav bzw. Sidebar)',
  ).toBeVisible({ timeout: 5000 })
  await avatarBtn.click()
  await expect(page.getByRole('tab', { name: 'Profil' })).toBeVisible({ timeout: 3000 })
}

/**
 * „Mein Konto" ist seit dem Mellon-Design-Pass eine Drill-down-Liste: Die
 * Sektionen liegen nicht mehr untereinander im Sheet, sondern hinter je einer
 * Zeile. Dieser Helper öffnet eine davon und wartet auf den Unterseiten-Header.
 */
async function openSubview(page: Page, label: string) {
  await page.getByRole('button', { name: label, exact: true }).click()
  await expect(page.getByRole('heading', { name: label })).toBeVisible({ timeout: 3000 })
}

/** Zurück von einer Unterseite auf die Wurzelebene von „Mein Konto". */
async function backToRoot(page: Page) {
  await page.getByRole('button', { name: 'Zurück' }).click()
  await expect(page.getByRole('heading', { name: 'Mein Konto' })).toBeVisible({ timeout: 3000 })
}

/** Überspringt den Test, wenn der Account noch im Onboarding hängt. */
function skipIfOnboarding(page: Page): boolean {
  if (page.url().includes('onboarding')) {
    test.skip(true, 'User has no groups yet')
    return true
  }
  return false
}

// ─── Regression: Auth guard ────────────────────────────────────────────────────

test.describe('PROJ-8 Regression — Auth guard', () => {
  test('AC-GUARD: Unauthenticated user visiting /groups is redirected to /login', async ({ page }) => {
    await page.goto('/groups')
    await page.waitForURL(/\/login/, { timeout: 5000 })
    expect(page.url()).toContain('/login')
  })
})

// ─── Profil-Sheet öffnen ──────────────────────────────────────────────────────

test.describe('AC-PROFILE-OPEN: Profil-Sheet öffnen', () => {
  test.skip(!hasCredentials, 'Requires TEST_USER_EMAIL + TEST_USER_PASSWORD env vars')

  test.beforeEach(async ({ page }) => {
    await loginAs(page, TEST_EMAIL, TEST_PASSWORD)
  })

  test('AC-OPEN-1: Tapping avatar opens ProfileSheet with two tabs (Profil + Album)', async ({ page }) => {
    if (skipIfOnboarding(page)) return
    await openProfileSheet(page)
    await expect(page.getByRole('tab', { name: 'Profil' })).toBeVisible({ timeout: 3000 })
    // PROJ-17: Der frühere „Archiv"-Tab heißt jetzt „Album".
    await expect(page.getByRole('tab', { name: 'Album' })).toBeVisible({ timeout: 3000 })
    await expect(page.getByRole('tab', { name: 'Archiv' })).toHaveCount(0)
  })

  test('AC-OPEN-2: Profil tab is active by default when sheet opens', async ({ page }) => {
    if (skipIfOnboarding(page)) return
    await openProfileSheet(page)
    const profilTab = page.getByRole('tab', { name: 'Profil' })
    await expect(profilTab).toHaveAttribute('data-state', 'active')
  })

  test('AC-OPEN-3: Wurzelebene listet die Konto- und Verbindungs-Einträge', async ({ page }) => {
    if (skipIfOnboarding(page)) return
    await openProfileSheet(page)
    for (const label of [
      'Profil-Infos',
      'Benachrichtigungen',
      'Darstellung',
      'Meine Badges',
      'Google Kalender',
      'Blockierte Zeiträume',
    ]) {
      await expect(
        page.getByRole('button', { name: label, exact: true }),
        `Eintrag „${label}" fehlt in der Settings-Liste`,
      ).toBeVisible({ timeout: 3000 })
    }
  })

  test('AC-OPEN-4: Unterseite öffnet sich und der Zurück-Pfeil führt zur Wurzel', async ({ page }) => {
    if (skipIfOnboarding(page)) return
    await openProfileSheet(page)
    await openSubview(page, 'Darstellung')
    // Auf der Unterseite ist die Wurzel-Liste nicht mehr sichtbar.
    await expect(page.getByRole('button', { name: 'Meine Badges', exact: true })).toHaveCount(0)
    await backToRoot(page)
    await expect(page.getByRole('button', { name: 'Meine Badges', exact: true })).toBeVisible()
  })
})

// ─── Profilbild & Anzeigename ─────────────────────────────────────────────────

test.describe('AC-PROFILE-EDIT: Anzeigename bearbeiten', () => {
  test.skip(!hasCredentials, 'Requires TEST_USER_EMAIL + TEST_USER_PASSWORD env vars')

  test.beforeEach(async ({ page }) => {
    await loginAs(page, TEST_EMAIL, TEST_PASSWORD)
  })

  test('AC-NAME-1: Unterseite „Profil-Infos" zeigt Avatar, Namen und Bearbeiten-Button', async ({ page }) => {
    if (skipIfOnboarding(page)) return
    await openProfileSheet(page)
    await openSubview(page, 'Profil-Infos')
    await expect(page.getByRole('button', { name: 'Profilbild ändern' })).toBeVisible({ timeout: 3000 })
    await expect(page.getByRole('button', { name: 'Namen bearbeiten' })).toBeVisible({ timeout: 3000 })
  })

  test('AC-NAME-2: Empty display name shows validation error and does not save', async ({ page }) => {
    if (skipIfOnboarding(page)) return
    await openProfileSheet(page)
    await openSubview(page, 'Profil-Infos')
    await page.getByRole('button', { name: 'Namen bearbeiten' }).click()
    const nameInput = page.getByPlaceholder('Anzeigename')
    await expect(nameInput).toBeVisible({ timeout: 3000 })
    await nameInput.clear()
    await nameInput.press('Enter')
    await expect(page.getByText('Name darf nicht leer sein')).toBeVisible({ timeout: 3000 })
  })

  test('AC-NAME-3: Clicking avatar button opens native file picker (input type=file is present)', async ({ page }) => {
    if (skipIfOnboarding(page)) return
    await openProfileSheet(page)
    await openSubview(page, 'Profil-Infos')
    const fileInput = page.locator('input[type="file"][accept*="image"]')
    await expect(fileInput).toHaveCount(1, { timeout: 3000 })
  })
})

// ─── Google Kalender ──────────────────────────────────────────────────────────

test.describe('AC-CALENDAR: Google Kalender verbinden', () => {
  test.skip(!hasCredentials, 'Requires TEST_USER_EMAIL + TEST_USER_PASSWORD env vars')

  test.beforeEach(async ({ page }) => {
    await loginAs(page, TEST_EMAIL, TEST_PASSWORD)
  })

  test('AC-CAL-1: Unterseite „Google Kalender" ist über die Verbindungs-Gruppe erreichbar', async ({ page }) => {
    if (skipIfOnboarding(page)) return
    await openProfileSheet(page)
    await openSubview(page, 'Google Kalender')
  })

  test('AC-CAL-2: "Google Kalender verbinden" button is visible when no calendar is connected', async ({ page }) => {
    if (skipIfOnboarding(page)) return
    await openProfileSheet(page)
    await openSubview(page, 'Google Kalender')
    const connectBtn = page.getByRole('button', { name: /Google Kalender verbinden/i })
    const isConnected = (await page.getByText(/^Verbunden$/i).count()) > 0
    if (isConnected) { test.skip(true, 'Calendar already connected; disconnect first to test this AC'); return }
    await expect(connectBtn).toBeVisible({ timeout: 3000 })
  })
})

// ─── Manuelle Blockierungen ───────────────────────────────────────────────────

test.describe('AC-BLOCKS: Manuelle Blockierungen', () => {
  test.skip(!hasCredentials, 'Requires TEST_USER_EMAIL + TEST_USER_PASSWORD env vars')

  test.beforeEach(async ({ page }) => {
    await loginAs(page, TEST_EMAIL, TEST_PASSWORD)
  })

  /** Öffnet direkt die Blockierungs-Unterseite. */
  async function openBlocks(page: Page) {
    await openProfileSheet(page)
    await openSubview(page, 'Blockierte Zeiträume')
  }

  test('AC-BLOCK-1: Unterseite „Blockierte Zeiträume" zeigt den Hinzufügen-Einstieg', async ({ page }) => {
    if (skipIfOnboarding(page)) return
    await openBlocks(page)
    await expect(page.getByText('Blockierung hinzufügen')).toBeVisible({ timeout: 3000 })
  })

  test('AC-BLOCK-2: Empty state message shown when no blocks exist', async ({ page }) => {
    if (skipIfOnboarding(page)) return
    await openBlocks(page)
    const emptyState = page.getByText(/Noch keine Blockierungen/i)
    const blockRows = page.locator('[aria-label="Blockierung löschen"]')

    // Erst auf einen der beiden Endzustände warten — sonst wird der noch
    // ladende Skeleton als „unerwarteter Zustand" gelesen und der Test skippt.
    await expect(emptyState.or(blockRows.first()).first()).toBeVisible({ timeout: 5000 })

    if ((await emptyState.count()) > 0) {
      await expect(emptyState).toBeVisible()
    } else {
      await expect(blockRows.first()).toBeVisible()
    }
    await expect(page.getByText('Blockierung hinzufügen')).toBeVisible({ timeout: 3000 })
  })

  test('AC-BLOCK-3: "Blockierung hinzufügen" opens form with Von and Bis fields', async ({ page }) => {
    if (skipIfOnboarding(page)) return
    await openBlocks(page)
    await page.getByText('Blockierung hinzufügen').click()
    await expect(page.locator('input[type="date"]').first()).toBeVisible({ timeout: 3000 })
  })

  test('AC-BLOCK-4: End date before start date shows validation error', async ({ page }) => {
    if (skipIfOnboarding(page)) return
    await openBlocks(page)
    await page.getByText('Blockierung hinzufügen').click()
    const dateInputs = page.locator('input[type="date"]')
    await expect(dateInputs.first()).toBeVisible({ timeout: 3000 })
    await dateInputs.nth(0).fill('2026-12-10')
    await dateInputs.nth(1).fill('2026-12-05')
    await page.getByRole('button', { name: 'Hinzufügen' }).click()
    await expect(page.getByText(/Enddatum muss nach dem Startdatum/i)).toBeVisible({ timeout: 3000 })
  })

  test('AC-BLOCK-5: Leaving "Bis" empty and saving creates a single-day block', async ({ page }) => {
    if (skipIfOnboarding(page)) return
    await openBlocks(page)
    await page.getByText('Blockierung hinzufügen').click()
    const dateInputs = page.locator('input[type="date"]')
    await expect(dateInputs.first()).toBeVisible({ timeout: 3000 })
    await dateInputs.nth(0).fill('2026-12-31')
    await page.getByRole('button', { name: 'Hinzufügen' }).click()
    const toast = page.getByText('Blockierung hinzugefügt')
    const blockItem = page.getByText(/31\.12\.2026/)
    await expect(toast.or(blockItem).first()).toBeVisible({ timeout: 5000 })

    // Aufräumen: Ohne das sammelt jeder Lauf eine weitere 31.12.-Blockierung im
    // QA-Account an und verfälscht AC-BLOCK-2 (Empty-State) beim nächsten Mal.
    // Der Datumstext steht im <span>; dessen Elternelement ist die Zeile, die
    // auch den Löschen-Button trägt.
    const row = page.getByText(/31\.12\.2026/).first().locator('..')
    await row.getByLabel('Blockierung löschen').click()
    const dialog = page.getByRole('alertdialog')
    await expect(dialog).toBeVisible({ timeout: 3000 })
    await dialog.getByRole('button', { name: 'Löschen', exact: true }).click()
    await expect(page.getByText(/31\.12\.2026/)).toHaveCount(0, { timeout: 5000 })
  })

  test('AC-BLOCK-6: Existing block shows delete button; tapping opens confirm dialog', async ({ page }) => {
    if (skipIfOnboarding(page)) return
    await openBlocks(page)

    // Legt bei Bedarf eine eigene Blockierung an, statt auf Altbestand zu hoffen.
    // Vorher hing der Test an Datenmüll früherer Läufe und skippte auf einem
    // aufgeräumten Account dauerhaft.
    const deleteButtons = page.locator('[aria-label="Blockierung löschen"]')
    let seeded = false
    if ((await deleteButtons.count()) === 0) {
      await page.getByText('Blockierung hinzufügen').click()
      const dateInputs = page.locator('input[type="date"]')
      await expect(dateInputs.first()).toBeVisible({ timeout: 3000 })
      await dateInputs.nth(0).fill('2026-11-30')
      await page.getByRole('button', { name: 'Hinzufügen' }).click()
      await expect(deleteButtons.first()).toBeVisible({ timeout: 5000 })
      seeded = true
    }

    await deleteButtons.first().click()
    const dialog = page.getByRole('alertdialog')
    await expect(dialog).toBeVisible({ timeout: 3000 })
    await expect(page.getByText('Blockierung löschen?')).toBeVisible({ timeout: 2000 })

    if (seeded) {
      // Selbst angelegte Blockierung über denselben Dialog wieder entfernen.
      await dialog.getByRole('button', { name: 'Löschen', exact: true }).click()
      await expect(page.getByText(/30\.11\.2026/)).toHaveCount(0, { timeout: 5000 })
    } else {
      await dialog.getByRole('button', { name: 'Abbrechen' }).click()
    }
  })
})

// ─── Album-Tab (ehemals Archiv, PROJ-17) ──────────────────────────────────────

test.describe('AC-ALBUM: Album-Tab', () => {
  test.skip(!hasCredentials, 'Requires TEST_USER_EMAIL + TEST_USER_PASSWORD env vars')

  test.beforeEach(async ({ page }) => {
    await loginAs(page, TEST_EMAIL, TEST_PASSWORD)
  })

  async function openAlbum(page: Page) {
    await openProfileSheet(page)
    await page.getByRole('tab', { name: 'Album' }).click()
    await page.waitForTimeout(600)
  }

  test('AC-ALBUM-1: Switching to "Album" tab shows either memory cards or empty state', async ({ page }) => {
    if (skipIfOnboarding(page)) return
    await openAlbum(page)
    const hasCards = (await page.getByTestId('memory-card').count()) > 0
    const hasEmptyState = (await page.getByText(/Noch keine Erinnerungen/i).count()) > 0
    expect(hasCards || hasEmptyState).toBe(true)
  })

  test('AC-ALBUM-2: Album empty state text appears when no completed activities exist', async ({ page }) => {
    if (skipIfOnboarding(page)) return
    await openAlbum(page)
    const hasCards = (await page.getByTestId('memory-card').count()) > 0
    if (hasCards) { test.skip(true, 'Album has memory cards; empty-state test not applicable'); return }
    await expect(page.getByText(/Schließt eure erste Aktivität ab/i)).toBeVisible({ timeout: 3000 })
  })
})

// ─── Logout ───────────────────────────────────────────────────────────────────

test.describe('AC-LOGOUT: Logout Confirmation', () => {
  test.skip(!hasCredentials, 'Requires TEST_USER_EMAIL + TEST_USER_PASSWORD env vars')

  test.beforeEach(async ({ page }) => {
    await loginAs(page, TEST_EMAIL, TEST_PASSWORD)
  })

  test('AC-LOGOUT-1: Clicking "Ausloggen" opens confirmation dialog', async ({ page }) => {
    if (skipIfOnboarding(page)) return
    await openProfileSheet(page)
    await page.getByRole('button', { name: 'Ausloggen' }).click()
    await expect(page.getByRole('alertdialog')).toBeVisible({ timeout: 3000 })
    await expect(page.getByText('Ausloggen?')).toBeVisible({ timeout: 2000 })
  })

  test('AC-LOGOUT-2: Cancelling logout dialog keeps user on /groups', async ({ page }) => {
    if (skipIfOnboarding(page)) return
    await openProfileSheet(page)
    await page.getByRole('button', { name: 'Ausloggen' }).click()
    await expect(page.getByRole('alertdialog')).toBeVisible({ timeout: 3000 })
    await page.getByRole('button', { name: 'Abbrechen' }).click()
    await expect(page.getByRole('alertdialog')).toHaveCount(0)
    expect(page.url()).toContain('/groups')
  })

  test('AC-LOGOUT-3: Confirming logout redirects to /login', async ({ page }) => {
    if (skipIfOnboarding(page)) return
    await openProfileSheet(page)
    await page.getByRole('button', { name: 'Ausloggen' }).click()
    const dialog = page.getByRole('alertdialog')
    await expect(dialog).toBeVisible({ timeout: 3000 })
    await dialog.getByRole('button', { name: 'Ausloggen' }).click()
    await page.waitForURL(/\/login/, { timeout: 8000 })
    expect(page.url()).toContain('/login')
  })
})

// ─── Google OAuth Callback ────────────────────────────────────────────────────

test.describe('AC-OAUTH: Google Calendar OAuth Callback Page', () => {
  test('AC-OAUTH-1: /auth/google-calendar/callback without params shows error state', async ({ page }) => {
    await page.goto('/auth/google-calendar/callback')
    await expect(page.getByText('Verbindung fehlgeschlagen')).toBeVisible({ timeout: 5000 })
    await expect(page.getByRole('link', { name: 'Zurück zur App' })).toBeVisible({ timeout: 2000 })
  })

  test('AC-OAUTH-2: /auth/google-calendar/callback with error=access_denied shows error', async ({ page }) => {
    await page.goto('/auth/google-calendar/callback?error=access_denied')
    await expect(page.getByText('Verbindung fehlgeschlagen')).toBeVisible({ timeout: 5000 })
  })
})

// ─── Responsive Layout ────────────────────────────────────────────────────────

test.describe('AC-RESPONSIVE: Responsive layout', () => {
  test.skip(!hasCredentials, 'Requires TEST_USER_EMAIL + TEST_USER_PASSWORD env vars')

  for (const [label, size] of [
    ['375px (mobile)', { width: 375, height: 812 }],
    ['768px (tablet)', { width: 768, height: 1024 }],
  ] as const) {
    test(`AC-RESP: ProfileSheet renders correctly at ${label}`, async ({ page }) => {
      await page.setViewportSize(size)
      await loginAs(page, TEST_EMAIL, TEST_PASSWORD)
      if (skipIfOnboarding(page)) return
      await openProfileSheet(page)
      await expect(page.getByRole('tab', { name: 'Profil' })).toBeVisible({ timeout: 3000 })
      await expect(page.getByRole('tab', { name: 'Album' })).toBeVisible({ timeout: 3000 })
    })
  }
})
