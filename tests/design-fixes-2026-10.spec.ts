import { test, expect, type Page } from '@playwright/test'

// Prüft die Fixes aus der Vorher-Nachher-Prüfung vom 2026-10-31 (P1, P3, P4, P5,
// Kommentar löschen). Braucht TEST_USER_EMAIL + TEST_USER_PASSWORD und ein Konto
// mit den „QA-Demo"-Daten. Ausführen mit --project=chromium --workers=1.

const TEST_EMAIL = process.env.TEST_USER_EMAIL ?? ''
const TEST_PASSWORD = process.env.TEST_USER_PASSWORD ?? ''
const hasCredentials = Boolean(TEST_EMAIL && TEST_PASSWORD)

const ACTIVITY = 'QA-Demo Hüttenwochenende'
const MOBILE = { width: 402, height: 874 }

async function openGroup(page: Page) {
  await page.goto('/login')
  await page.getByLabel('E-Mail').fill(TEST_EMAIL)
  await page.getByLabel('Passwort').fill(TEST_PASSWORD)
  await page.getByRole('button', { name: 'Einloggen', exact: true }).click()
  await page.waitForURL(/\/groups/, { timeout: 15000 })
  const card = page.getByRole('button', { name: /Mitglied(er)? · / }).first()
  await card.waitFor({ state: 'visible', timeout: 10000 })
  await card.click()
  await page.waitForURL(/\/groups\/view\/?\?id=/, { timeout: 10000 })
}

async function openActivity(page: Page, width: number) {
  await page.getByRole('link', { name: 'Board' }).or(page.getByRole('button', { name: 'Board' })).first().click()
  if (width < 768) await page.getByText('In Planung', { exact: true }).first().click()
  await page.getByText(ACTIVITY, { exact: true }).first().click()
  await expect(page.getByRole('heading', { name: 'Kommentare' }).first()).toBeAttached({ timeout: 10000 })
  // Das frühere Auto-Scrollen startete erst nach dem Laden der Kommentare.
  await expect(page.getByText('Die Hütte ist reserviert', { exact: false }).first()).toBeAttached({ timeout: 10000 })
  await page.waitForTimeout(1200)
}

function maxScrollTop(page: Page) {
  return page.evaluate(() =>
    Math.max(...Array.from(document.querySelectorAll('[role="dialog"], [role="dialog"] *')).map((el) => el.scrollTop))
  )
}

test.describe('Design-Fixes 2026-10', () => {
  test.skip(!hasCredentials, 'Requires TEST_USER_EMAIL + TEST_USER_PASSWORD env vars')

  for (const width of [402, 768, 1440]) {
    test(`P1: Detail bleibt beim Öffnen oben (${width}px)`, async ({ page }) => {
      await page.setViewportSize({ width, height: 874 })
      await openGroup(page)
      await openActivity(page, width)
      expect(await maxScrollTop(page)).toBe(0)
    })
  }

  test('P1 + Löschen: Neuer Kommentar wird sichtbar, gelöschter verschwindet sofort', async ({ page }) => {
    await page.setViewportSize(MOBILE)
    await openGroup(page)
    await openActivity(page, MOBILE.width)

    const text = `QA-Demo E2E ${Date.now()}`
    await page.locator('[role="dialog"] .ProseMirror').first().click()
    await page.keyboard.type(text)
    await page.keyboard.press('ControlOrMeta+Enter')

    const comment = page.getByText(text, { exact: true })
    await expect(comment).toBeInViewport({ timeout: 10000 })

    const row = page.locator('div.group').filter({ hasText: text })
    await row.getByRole('button', { name: 'Kommentar löschen' }).click()
    await page.getByRole('alertdialog').getByRole('button', { name: 'Löschen' }).click()
    await expect(comment).toHaveCount(0, { timeout: 5000 })
  })

  test('P3: Plus-Button weicht beim Runterscrollen aus und kommt zurück', async ({ page }) => {
    await page.setViewportSize({ width: 402, height: 600 })
    await openGroup(page)

    const button = page.getByRole('button', { name: 'Vorschlag hinzufügen' }).last()
    await expect(button).toBeVisible({ timeout: 10000 })
    const wrapper = button.locator('xpath=..')
    const list = page.locator('div.flex-1.overflow-y-auto').filter({ hasText: 'QA-Demo Bouldern am Freitag' }).first()
    const scrollTo = (top: number) => list.evaluate((el, value) => el.scrollTo(0, value), top)

    await scrollTo(300)
    await expect(wrapper).toHaveAttribute('inert')
    await scrollTo(150)
    await expect(wrapper).not.toHaveAttribute('inert')

    // Filter verkürzt die Liste: Der Button darf nicht versteckt bleiben.
    await scrollTo(300)
    await expect(wrapper).toHaveAttribute('inert')
    await page.getByRole('button', { name: 'Längerer Zeitraum', exact: true }).click()
    await expect(wrapper).not.toHaveAttribute('inert')
  })

  test('P4 + P5: Fuß zeigt das Jahr, Balken folgen der Slide-Farbe, X hat feste Fläche', async ({ page }) => {
    await page.setViewportSize(MOBILE)
    await openGroup(page)
    await page.getByRole('button', { name: 'Gruppen-Einstellungen öffnen' }).click()
    await page.getByRole('button', { name: /Rückblick 2025/ }).click()

    const viewer = page.getByRole('dialog', { name: 'Mellon Rückblick 2025' })
    const footer = viewer.getByText('MELLON RÜCKBLICK · 2025', { exact: true })
    await expect(footer.first()).toBeVisible({ timeout: 10000 })

    await viewer.getByRole('button', { name: 'Nächste Slide' }).click()
    await expect(footer.first()).toBeVisible()
    await expect(viewer.getByText('Gemeinsam abgeschlossen').first()).toBeVisible()

    const fill = viewer.locator('.h-\\[3px\\] > div').first()
    await expect(fill).toHaveCSS('background-color', 'rgb(34, 30, 25)')

    const close = viewer.getByRole('button', { name: 'Rückblick schließen' })
    await expect(close).toHaveCSS('background-color', 'rgba(0, 0, 0, 0.55)')
    await expect(close).toHaveCSS('backdrop-filter', 'none')
  })
})
