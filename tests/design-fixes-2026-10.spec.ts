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

function navLink(page: Page, name: string) {
  return page.getByRole('link', { name, exact: true }).locator('visible=true').first()
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

  test('Kommentar mit neuem Bild: Scrollen endet unterhalb des Kommentars', async ({ page }) => {
    test.setTimeout(45000)
    await page.setViewportSize(MOBILE)
    await openGroup(page)
    await openActivity(page, MOBILE.width)

    const text = `QA-Demo Bild ${Date.now()}`
    const png = await page.evaluate(() => {
      const canvas = document.createElement('canvas')
      canvas.width = 800
      canvas.height = 1000
      const context = canvas.getContext('2d')!
      context.fillStyle = '#1E4634'
      context.fillRect(0, 0, 800, 1000)
      return canvas.toDataURL('image/png').split(',')[1]
    })
    await page.locator('[role="dialog"] .ProseMirror').first().click()
    await page.keyboard.type(text)
    await page.locator('[role="dialog"] input[type="file"][accept="image/*"]').last().setInputFiles({
      name: 'qa-demo.png',
      mimeType: 'image/png',
      buffer: Buffer.from(png, 'base64'),
    })
    await expect(page.locator('[role="dialog"] .ProseMirror img')).toBeVisible({ timeout: 10000 })
    await page.keyboard.press('ControlOrMeta+Enter')

    const comment = page.locator('div.group').filter({ hasText: text })
    const image = comment.locator('img').last()
    await expect(image).toBeVisible({ timeout: 10000 })
    await expect.poll(() => image.evaluate((el: HTMLImageElement) => el.complete && el.naturalWidth > 0), { timeout: 10000 }).toBe(true)
    await page.waitForTimeout(1500)

    // Das Bildende muss oberhalb des Kommentarfelds liegen, nicht dahinter.
    const composerTop = await page.locator('[role="dialog"] .ProseMirror').first().evaluate((el) => el.getBoundingClientRect().top)
    const imageBottom = await image.evaluate((el) => el.getBoundingClientRect().bottom)
    expect(imageBottom).toBeLessThanOrEqual(composerTop)

    await comment.getByRole('button', { name: 'Kommentar löschen' }).click()
    await page.getByRole('alertdialog').getByRole('button', { name: 'Löschen' }).click()
    await expect(comment).toHaveCount(0, { timeout: 5000 })
  })

  test('P3: Plus-Button überlappt auf Mobil an keiner Scroll-Position eine Karte', async ({ page }) => {
    await page.setViewportSize({ width: 402, height: 600 })
    await openGroup(page)
    const button = page.getByRole('button', { name: 'Vorschlag hinzufügen' }).locator('visible=true')
    await expect(button).toBeVisible({ timeout: 10000 })
    const cards = page.locator('div.rounded-lg.cursor-pointer').locator('visible=true')
    await expect(cards.first()).toBeVisible({ timeout: 10000 })
    const list = page.locator('div.flex-1.overflow-y-auto').filter({ hasText: 'QA-Demo Bouldern am Freitag' }).first()

    for (const top of [0, 60, 150, 300, 0]) {
      await list.evaluate((el, value) => el.scrollTo(0, value), top)
      await page.waitForTimeout(250)
      // elementFromPoint berücksichtigt, dass gescrollte Karten abgeschnitten sind.
      const coveredCards = await page.evaluate(() => {
        const fab = [...document.querySelectorAll('button[aria-label="Vorschlag hinzufügen"]')]
          .map((el) => el.getBoundingClientRect()).find((r) => r.width > 0)!
        const points = [[0.5, 0.5], [0.1, 0.5], [0.9, 0.5], [0.5, 0.1], [0.5, 0.9]]
        return points.filter(([x, y]) => {
          const stack = document.elementsFromPoint(fab.left + fab.width * x, fab.top + fab.height * y)
          return stack.some((el) => el.matches('div.rounded-lg.cursor-pointer'))
        }).length
      })
      expect(coveredCards, `Scroll-Position ${top}`).toBe(0)
    }
  })

  test('Fokusring: Nach Mausbedienung zeigt kein Element im Dialog den Ring', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 874 })
    await openGroup(page)
    await openActivity(page, 1440)
    await expect(page.locator('[role="dialog"] :focus-visible, [role="dialog"]:focus-visible')).toHaveCount(0)
    const activeTag = await page.evaluate(() => document.activeElement?.getAttribute('role') ?? document.activeElement?.tagName)
    expect(activeTag).toBe('dialog')

    await page.getByRole('dialog').getByRole('button', { name: 'Schließen' }).click()
    await navLink(page, 'Vorschläge').click()
    await page.getByRole('button', { name: 'Vorschlag hinzufügen' }).locator('visible=true').click()
    const form = page.getByRole('dialog')
    await expect(form.locator(':focus-visible')).toHaveCount(0)
    await form.locator('input').first().fill('QA-Demo Entwurf')
    await form.getByRole('button', { name: 'Schließen' }).click()
    const confirm = page.getByRole('alertdialog')
    await expect(confirm).toBeVisible()
    await expect(page.locator('[role="alertdialog"] :focus-visible')).toHaveCount(0)
    await confirm.getByRole('button', { name: 'Weiter bearbeiten' }).click()
    await expect(confirm).toHaveCount(0)
  })

  test('Fokusring: Per Tastatur geöffnete Dialoge fokussieren wie bisher ein Element mit Ring', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 874 })
    await openGroup(page)
    const settings = page.getByRole('button', { name: 'Gruppen-Einstellungen öffnen' })
    await expect(settings).toBeEnabled({ timeout: 10000 })
    await settings.focus()
    await page.keyboard.press('Enter')
    await expect(page.getByRole('dialog').first()).toBeVisible({ timeout: 5000 })
    await expect(page.locator('[role="dialog"] button:focus-visible')).toHaveCount(1)
    await page.keyboard.press('Tab')
    await expect(page.locator('[role="dialog"] :focus-visible')).toHaveCount(1)
    await page.keyboard.press('Escape')
    await expect(page.getByRole('dialog')).toHaveCount(0)
  })

  test('P4 + P5: Fuß zeigt das Jahr, Balken folgen der Slide-Farbe, X hat feste Fläche', async ({ page }) => {
    await page.setViewportSize(MOBILE)
    await openGroup(page)
    await page.getByRole('button', { name: 'Gruppen-Einstellungen öffnen' }).click()
    await page.getByRole('button', { name: /Rückblick 2025/ }).click()

    const viewer = page.getByRole('dialog', { name: 'Mellon Rückblick 2025' })
    const footer = viewer.getByText('MELLON RÜCKBLICK · 2025', { exact: true })
    await expect(footer.first()).toBeVisible({ timeout: 10000 })
    // Der Teilen-Button darf den Fuß nicht verdecken.
    const footerBox = (await footer.first().boundingBox())!
    const shareBox = (await viewer.getByRole('button', { name: 'Teilen' }).boundingBox())!
    expect(footerBox.y + footerBox.height).toBeLessThanOrEqual(shareBox.y)

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
