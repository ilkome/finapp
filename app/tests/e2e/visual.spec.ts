import type { BrowserContext, Page } from '@playwright/test'

import { expect, test } from '@playwright/test'

import { openDemo } from './helpers'

// Viewport-only shots on a tall viewport: a fullPage capture resizes the window mid-shot and
// ECharts redraws into an empty SVG. The project viewport is sized so a stat page fits.
const T = {
  configMenu: /^(View Settings|Настройки вида)$/,
  pageLayout: /^(Page layout|Вид страницы)$/,
  pageLayoutSplit: /^(Split|Раздельный)$/,
}

async function openStat(page: Page, context: BrowserContext, route: string) {
  await openDemo(page, context)
  await page.goto(route, { waitUntil: 'domcontentloaded' })
  await expect(page.locator('[data-stat-date-range]').first()).toBeVisible({ timeout: 15_000 })
  // The chart mounts lazily and may sit below the fold on a phone, so only wait for it to exist.
  await page.locator('.\\@container\\/stat svg').first().waitFor({ state: 'attached', timeout: 15_000 }).catch(() => {})
  // Let deferred blocks (idle mounts, sparkline widths, the async stat view) settle before the shot.
  await page.waitForTimeout(1200)
}

// Stat config is owned by the active stat view (async store), which overwrites localStorage on
// load, so layout changes go through the config modal like a user would make them.
async function selectPageLayoutSplit(page: Page) {
  await page.getByRole('button', { name: T.configMenu }).first().click()
  await page.getByRole('combobox', { name: T.pageLayout }).click()
  await page.getByRole('option', { name: T.pageLayoutSplit }).click()
  await page.keyboard.press('Escape')
  await expect(page.locator('[data-stat-page-layout="split"]')).toBeVisible()
  // ECharts re-mounts both split charts; wait until the second one has drawn its series.
  const incomeChart = page.locator('[data-stat-chart-section] svg').nth(1)
  await expect.poll(() => incomeChart.locator('path').count(), { timeout: 15_000 }).toBeGreaterThan(0)
  await page.waitForTimeout(800)
}

test.describe('stat visual regression', () => {
  test('dashboard combined', async ({ context, page }) => {
    await openStat(page, context, '/dashboard')
    await expect(page).toHaveScreenshot('dashboard-combined.png')
  })

  test('dashboard split page', async ({ context, page }) => {
    await openStat(page, context, '/dashboard')
    await selectPageLayoutSplit(page)
    await expect(page).toHaveScreenshot('dashboard-split-page.png')
  })

  test('dashboard mobile', async ({ context, page }) => {
    await page.setViewportSize({ height: 844, width: 390 })
    await openStat(page, context, '/dashboard')
    await expect(page).toHaveScreenshot('dashboard-mobile.png')
  })

  test('wallet page', async ({ context, page }) => {
    await openStat(page, context, '/wallets/demo_w_debit_rub')
    await expect(page).toHaveScreenshot('wallet-page.png')
  })

  test('category page', async ({ context, page }) => {
    await openStat(page, context, '/categories/demo_cat_food')
    await expect(page).toHaveScreenshot('category-page.png')
  })

  test('filter panel', async ({ context, page }) => {
    await openStat(page, context, '/dashboard')
    await page.getByText(/^(All wallets and categories|Все кошельки и категории)$/).first().click()
    await expect(page.getByRole('button', { name: /^(Apply|Применить)$/ })).toBeVisible()
    await page.waitForTimeout(400)
    await expect(page).toHaveScreenshot('filter-panel.png')
  })
})
