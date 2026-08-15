import type { BrowserContext, Page } from '@playwright/test'

import { devices, expect, test } from '@playwright/test'

const mobile = devices['iPhone 13']

async function bootstrapDemo(page: Page, context: BrowserContext) {
  await context.clearCookies()
  await page.goto('/login', { waitUntil: 'domcontentloaded' })
  await page.getByRole('button', { name: /demo|демо/i }).click()
  await page.waitForURL(/\/(dashboard|categories|wallets|stat)/, { timeout: 30_000 })
  await page.waitForTimeout(800)
}

async function expectQuickViewReplaced(page: Page, context: BrowserContext) {
  await bootstrapDemo(page, context)

  const categories = page.locator('[data-stat-categories-breakdown]').first()
  await expect(categories).toBeVisible({ timeout: 15_000 })
  await categories.locator('.uiElement.interactive').first().click()

  const quickView = page.locator('.drag').filter({ hasText: /Transactions|Транзакции/ }).last()
  await expect(quickView).toBeVisible()

  const transaction = quickView.locator('.uiElement.interactive').first()
  await transaction.click({ button: 'right' })
  const edit = page.getByRole('menuitem', { name: /Edit|Редактировать/ })
  await expect(edit).toBeVisible()
  await edit.dispatchEvent('click')

  await expect(quickView).toHaveCount(0)
  await expect(page.locator('.trnForm')).toBeVisible()
}

test('replaces a category transaction sheet with the desktop edit form', async ({ context, page }) => {
  await expectQuickViewReplaced(page, context)
})

test.describe('mobile category quick view', () => {
  test.use({
    deviceScaleFactor: mobile.deviceScaleFactor,
    hasTouch: mobile.hasTouch,
    isMobile: mobile.isMobile,
    userAgent: mobile.userAgent,
    viewport: mobile.viewport,
  })

  test('replaces a category transaction sheet with the mobile edit form', async ({ context, page }) => {
    await expectQuickViewReplaced(page, context)
  })
})
