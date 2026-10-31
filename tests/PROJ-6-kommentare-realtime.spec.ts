import { test, expect, type Browser, type Page } from '@playwright/test'

// Zwei Mitglieder derselben Testgruppe in getrennten Browser-Kontexten. Braucht
// zusätzlich TEST_USER2_EMAIL + TEST_USER2_PASSWORD. Das zweite Konto ist kein Admin.
const USER_1 = { email: process.env.TEST_USER_EMAIL ?? '', password: process.env.TEST_USER_PASSWORD ?? '' }
const USER_2 = { email: process.env.TEST_USER2_EMAIL ?? '', password: process.env.TEST_USER2_PASSWORD ?? '' }

const ACTIVITY = 'QA-Demo Hüttenwochenende'

async function openActivityAs(browser: Browser, user: { email: string; password: string }) {
  const context = await browser.newContext({ viewport: { width: 1280, height: 874 } })
  const page = await context.newPage()
  await page.goto('/login')
  await page.getByLabel('E-Mail').fill(user.email)
  await page.getByLabel('Passwort').fill(user.password)
  await page.getByRole('button', { name: 'Einloggen', exact: true }).click()
  await page.waitForURL(/\/groups/, { timeout: 15000 })
  await page.getByRole('button', { name: /Mitglied(er)? · / }).first().click()
  await page.waitForURL(/\/groups\/view\/?\?id=/, { timeout: 10000 })
  await page.getByRole('link', { name: 'Board', exact: true }).locator('visible=true').first().click()
  await page.getByText(ACTIVITY, { exact: true }).locator('visible=true').first().click()
  await expect(page.getByRole('heading', { name: 'Kommentare' }).first()).toBeAttached({ timeout: 10000 })
  // Das Abo steht erst kurz nach dem Laden.
  await page.waitForTimeout(2000)
  return page
}

async function postComment(page: Page, text: string) {
  await page.locator('[role="dialog"] .ProseMirror').first().click()
  await page.keyboard.type(text)
  await page.keyboard.press('ControlOrMeta+Enter')
  await expect(page.getByText(text, { exact: true })).toBeVisible({ timeout: 10000 })
}

async function deleteComment(page: Page, text: string) {
  const row = page.locator('div.group').filter({ hasText: text })
  await row.hover()
  await row.getByRole('button', { name: 'Kommentar löschen' }).click()
  await page.getByRole('alertdialog').getByRole('button', { name: 'Löschen' }).click()
}

test.describe('PROJ-6 Kommentare mit zwei Mitgliedern', () => {
  test.skip(
    !USER_1.email || !USER_2.email,
    'Requires TEST_USER_EMAIL, TEST_USER_PASSWORD, TEST_USER2_EMAIL, TEST_USER2_PASSWORD'
  )

  test('Neue und gelöschte Kommentare erscheinen beim anderen Mitglied ohne Neuladen', async ({ browser }) => {
    test.setTimeout(60000)
    const admin = await openActivityAs(browser, USER_1)
    const member = await openActivityAs(browser, USER_2)
    const text = `QA-Demo Realtime ${Date.now()}`

    await postComment(member, text)
    await expect(admin.getByText(text, { exact: true })).toBeVisible({ timeout: 10000 })

    await deleteComment(member, text)
    await expect(member.getByText(text, { exact: true })).toHaveCount(0, { timeout: 5000 })
    await expect(admin.getByText(text, { exact: true })).toHaveCount(0, { timeout: 10000 })
  })

  test('Fremde Kommentare: Mitglied sieht kein Löschen, RLS verweigert es, die Liste bleibt', async ({ browser }) => {
    test.setTimeout(60000)
    const admin = await openActivityAs(browser, USER_1)
    const member = await openActivityAs(browser, USER_2)
    const text = `QA-Demo Fremd ${Date.now()}`

    await postComment(admin, text)
    await expect(member.getByText(text, { exact: true })).toBeVisible({ timeout: 10000 })
    const memberRow = member.locator('div.group').filter({ hasText: text })
    await expect(memberRow.getByRole('button', { name: 'Kommentar löschen' })).toHaveCount(0)

    // Die Oberfläche bietet es nicht an, also den Antwort-Fall direkt nachstellen:
    // Der Server liefert 0 Zeilen, die Anzeige darf den Kommentar nicht entfernen.
    await admin.route('**/rest/v1/activity_comments*', async (route) => {
      if (route.request().method() === 'DELETE') {
        await route.fulfill({ status: 200, contentType: 'application/json', body: '[]' })
      } else {
        await route.continue()
      }
    })
    await deleteComment(admin, text)
    await expect(admin.getByText('Kommentar konnte nicht gelöscht werden')).toBeVisible({ timeout: 5000 })
    await expect(admin.getByText(text, { exact: true })).toBeVisible()

    await admin.unroute('**/rest/v1/activity_comments*')
    await deleteComment(admin, text)
    await expect(admin.getByText(text, { exact: true })).toHaveCount(0, { timeout: 5000 })
    await expect(member.getByText(text, { exact: true })).toHaveCount(0, { timeout: 10000 })
  })
})
