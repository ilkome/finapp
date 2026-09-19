import type { BrowserContext, Page } from '@playwright/test'

import { devices, expect, test } from '@playwright/test'

import { openDemo } from './helpers'

const mobile = devices['iPhone 13']

async function bootstrapDemo(page: Page, context: BrowserContext) {
  await openDemo(page, context)
}

async function expectQuickViewReplaced(page: Page, context: BrowserContext, isMobile = false) {
  await bootstrapDemo(page, context)

  const categories = page.locator('[data-stat-categories-breakdown]').first()
  await expect(categories).toBeVisible({ timeout: 15_000 })
  await page.getByRole('button', { name: /View Settings|Настройки вида/ }).first().click()
  // The block's visibility lives inside its panel now, not on the row.
  const verticalRow = page.locator('[data-stat-config-row="vertical"]')
  await verticalRow.getByRole('button').click()
  const verticalToggle = page.getByRole('switch', { name: /Show block|Показывать блок/ })
  await expect(verticalToggle).toBeVisible()
  if (await verticalToggle.getAttribute('aria-checked') !== 'true')
    await verticalToggle.click()
  if (isMobile) {
    await page.keyboard.press('Escape')
    await page.keyboard.press('Escape')
  }
  else {
    await page.getByRole('button', { name: /Close|Закрыть/ }).click()
  }
  await expect(verticalToggle).toBeHidden()

  const quickViewTrigger = page.locator('[data-stat-category-quick-view]').first()
  await expect(quickViewTrigger).toBeVisible()
  await quickViewTrigger.click()

  const quickView = page.locator('[data-stat-trns-quick-view]')
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
    await expectQuickViewReplaced(page, context, true)
  })
})
