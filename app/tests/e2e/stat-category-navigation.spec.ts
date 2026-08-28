import type { BrowserContext, Page } from '@playwright/test'

import { expect, test } from '@playwright/test'

const T = {
  descriptionFilter: /^(Only with description|Только с описанием)$/,
  grouping: /^(Toggle grouping|Группировка)$/,
  previous: /^(Previous|Назад)$/,
  startDemo: /demo|демо/i,
}

async function bootstrapDemo(page: Page, context: BrowserContext) {
  await context.clearCookies()
  await page.goto('/login', { waitUntil: 'domcontentloaded' })
  await page.getByRole('button', { name: T.startDemo }).click()
  await page.waitForURL(/\/(dashboard|categories|wallets|stat)/, { timeout: 30_000 })
  await page.waitForTimeout(800)
  await page.goto('/dashboard', { waitUntil: 'domcontentloaded' })
  await expect(page.locator('[data-stat-date-range]').first()).toBeVisible({ timeout: 15_000 })
}

test.describe('Statistics category navigation', () => {
  test('opens a leaf with inherited state and restores the cached dashboard', async ({ context, page }) => {
    await bootstrapDemo(page, context)

    const parent = page.locator('[data-stat-category-id="demo_cat_food"]').first()
    const child = page.locator('[data-stat-category-id="demo_cat_food_groceries"]').first()
    if (!(await parent.isVisible()))
      await page.getByRole('button', { name: T.grouping }).first().click()
    await expect(parent).toBeVisible()
    await parent.click()
    await expect(page).toHaveURL(/\/dashboard/)
    await expect(child).toBeVisible()

    const dashboardPeriod = await page.locator('[data-stat-date-range]').first().textContent()
    await page.mouse.wheel(0, 240)
    const childBox = await child.boundingBox()
    expect(childBox).not.toBeNull()
    const dashboardScrollTop = await page.evaluate(() => document.scrollingElement?.scrollTop ?? window.scrollY)
    await page.mouse.click(childBox!.x + childBox!.width / 3, childBox!.y + childBox!.height / 2)

    await expect(page).toHaveURL(/\/categories\/demo_cat_food_groceries\?.*statSnapshot=/)
    await expect(page.locator('[data-stat-date-range]').first()).toHaveText(dashboardPeriod!.trim())

    await page.getByRole('button', { name: T.previous }).nth(1).click()
    await expect(page.locator('[data-stat-date-range]').first()).not.toHaveText(dashboardPeriod!.trim())

    await page.goBack()
    await expect(page).toHaveURL(/\/dashboard/)
    await expect(page.locator('[data-stat-date-range]').first()).toHaveText(dashboardPeriod!.trim())
    await expect.poll(() => page.evaluate(() => document.scrollingElement?.scrollTop ?? window.scrollY)).toBe(dashboardScrollTop)
  })

  test('opens a parent from its amount and keeps direct category state separate', async ({ context, page }) => {
    await bootstrapDemo(page, context)

    const parent = page.locator('[data-stat-category-id="demo_cat_transport"]').first()
    if (!(await parent.isVisible()))
      await page.getByRole('button', { name: T.grouping }).first().click()
    await expect(parent).toBeVisible()
    await parent.locator('[data-stat-category-amount]').click()
    await expect(page).toHaveURL(/\/categories\/demo_cat_transport\?.*statSnapshot=/)

    const descriptionFilter = page.getByText(T.descriptionFilter).first()
    await expect(descriptionFilter).toBeVisible()
    await descriptionFilter.click()
    await page.getByText('Fuel', { exact: true }).first().click()
    await expect(page).toHaveURL(/\/categories\/demo_cat_transport_fuel\?.*statSnapshot=/)
    const snapshotId = new URL(page.url()).searchParams.get('statSnapshot')
    const inheritedDescriptionFilter = await page.evaluate((id) => {
      const value = sessionStorage.getItem(`finapp.statNavigation.${id}`)
      return value ? JSON.parse(value).trns.isShowWithDesc : false
    }, snapshotId)
    expect(inheritedDescriptionFilter).toBe(true)

    await page.goto('/categories/demo_cat_food_groceries', { waitUntil: 'domcontentloaded' })
    await expect(page).toHaveURL(/\/categories\/demo_cat_food_groceries$/)
    const originalCategoryPeriod = await page.locator('[data-stat-date-range]').first().textContent()
    await page.locator('[data-stat-date-range]').first().click()
    await page.getByRole('button', { name: /^(Month|Месяц)$/ }).first().click()
    const changedCategoryPeriod = await page.locator('[data-stat-date-range]').first().textContent()
    expect(changedCategoryPeriod).not.toBe(originalCategoryPeriod)

    await page.goto('/categories', { waitUntil: 'domcontentloaded' })
    await page.goto('/categories/demo_cat_food_groceries', { waitUntil: 'domcontentloaded' })
    await expect(page.locator('[data-stat-date-range]').first()).toHaveText(changedCategoryPeriod!.trim())
  })
})
