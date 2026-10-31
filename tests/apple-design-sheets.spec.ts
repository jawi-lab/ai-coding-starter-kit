import { test, expect, type Page } from '@playwright/test'

const EMAIL = process.env.TEST_USER_EMAIL
const PASSWORD = process.env.TEST_USER_PASSWORD

test.use({ viewport: { width: 375, height: 812 } })

async function loginAs(page: Page, email: string, password: string) {
  await page.goto('/login', { waitUntil: 'networkidle' })
  await page.getByLabel('E-Mail').fill(email)
  await page.getByLabel('Passwort').fill(password)
  await page.getByRole('button', { name: 'Einloggen', exact: true }).click()
  await page.waitForURL(/\/(groups|onboarding)/, { timeout: 10000 })
}

async function openProfileSheet(page: Page) {
  await page.getByRole('button', { name: 'Profil' }).click()
  const dialog = page.getByRole('dialog')
  await dialog.waitFor()
  await page.waitForTimeout(500)
  const box = await dialog.locator('button.cursor-grab').boundingBox()
  if (!box) throw new Error('Griff nicht gefunden')
  return { dialog, x: box.x + box.width / 2, y: box.y + box.height / 2 }
}

function translateY(page: Page) {
  return page.getByRole('dialog').evaluate(
    (el) => new DOMMatrixReadOnly(getComputedStyle(el).transform).m42
  )
}

test.describe('Sheets — Griff und Geste', () => {
  test.skip(!EMAIL || !PASSWORD, 'TEST_USER_EMAIL/TEST_USER_PASSWORD nicht gesetzt')
  test.skip(({ browserName }) => browserName !== 'chromium', 'Maus-Geste nur auf Chromium')

  test.beforeEach(async ({ page }) => {
    await loginAs(page, EMAIL!, PASSWORD!)
  })

  test('das Sheet folgt dem Griff 1:1 und federt nach langsamem Ziehen zurück', async ({ page }) => {
    const { dialog, x, y } = await openProfileSheet(page)
    await page.mouse.move(x, y)
    await page.mouse.down()
    await page.mouse.move(x, y + 120, { steps: 5 })
    expect(await translateY(page)).toBeCloseTo(120, 0)
    await page.waitForTimeout(250)
    await page.mouse.up()
    await page.waitForTimeout(600)
    await expect(dialog).toBeVisible()
    expect(await translateY(page)).toBe(0)
  })

  test('nach oben ziehen stößt auf Widerstand', async ({ page }) => {
    const { x, y } = await openProfileSheet(page)
    await page.mouse.move(x, y)
    await page.mouse.down()
    await page.mouse.move(x, y - 200, { steps: 5 })
    const offset = await translateY(page)
    expect(offset).toBeLessThan(0)
    expect(offset).toBeGreaterThan(-200)
    await page.mouse.up()
  })

  test('schnelles Wischen nach unten schließt das Sheet', async ({ page }) => {
    const { dialog, x, y } = await openProfileSheet(page)
    await page.mouse.move(x, y)
    await page.mouse.down()
    await page.mouse.move(x, y + 200, { steps: 3 })
    await page.mouse.up()
    await expect(dialog).toBeHidden()
  })

  test('Tippen auf den Griff schließt das Sheet', async ({ page }) => {
    const { dialog, x, y } = await openProfileSheet(page)
    await page.mouse.click(x, y)
    await expect(dialog).toBeHidden()
  })

  test('auf Desktop gibt es keinen Griff und der Dialog bleibt zentriert', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.getByText('Profil & Archiv').first().click()
    const dialog = page.getByRole('dialog')
    await dialog.waitFor()
    const box = await dialog.boundingBox()
    expect(Math.round(box!.x + box!.width / 2)).toBe(720)
    await expect(dialog.locator('button.cursor-grab')).toBeHidden()
  })
})
