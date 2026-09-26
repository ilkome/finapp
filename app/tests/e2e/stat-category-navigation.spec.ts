import type { BrowserContext, Page } from '@playwright/test'

import { expect, test } from '@playwright/test'

import { openDemo } from './helpers'

const T = {
  descriptionFilter: /^(Only with description|Только с описанием)$/,
}

async function bootstrapDemo(page: Page, context: BrowserContext) {
  await openDemo(page, context)
  await page.goto('/dashboard', { waitUntil: 'domcontentloaded' })
  await expect(page.locator('[data-stat-date-range]').first()).toBeVisible({ timeout: 15_000 })
}

// Grouping is a setting of the categories list block: "by parent" shows every parent as a row.
async function groupByParent(page: Page) {
  await page.getByRole('button', { name: /View Settings|Настройки вида/ }).first().click()
  await page.locator('[data-stat-config-row="catsList"]').getByRole('button').click()
  const grouping = page.getByRole('combobox', { name: /^(Grouping|Группировка)$/ })
  await grouping.click()
  await page.getByRole('option', { name: /^(By parent|По родителю)$/ }).click()
  await page.getByRole('button', { name: /^(Close|Закрыть)$/ }).click()
}

test.describe('Statistics category navigation', () => {
  test('opens a leaf with inherited state and restores the cached dashboard', async ({ context, page }) => {
    await bootstrapDemo(page, context)

    const parent = page.locator('[data-stat-category-id="demo_cat_food"]').first()
    const child = page.locator('[data-stat-category-id="demo_cat_food_groceries"]').first()
    if (!(await parent.isVisible()))
      await groupByParent(page)
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

    // The built-in view shows period arrows only on wide content, so change the period through the picker.
    await page.locator('[data-stat-date-range]').first().click()
    await page.getByRole('button', { name: /^(Month|Месяц)$/ }).first().click()
    await expect(page.locator('[data-stat-date-range]').first()).not.toHaveText(dashboardPeriod!.trim())

    await page.goBack()
    await expect(page).toHaveURL(/\/dashboard/)
    await expect(page.locator('[data-stat-date-range]').first()).toHaveText(dashboardPeriod!.trim())
    await expect.poll(() => page.evaluate(() => document.scrollingElement?.scrollTop ?? window.scrollY)).toBe(dashboardScrollTop)
  })

  test('opens a parent from its amount and keeps direct category state separate', async ({ context, page }) => {
    await bootstrapDemo(page, context)

    // A year of transport holds both described (fuel) and bare (transit) transactions, which is
    // what makes the description filter appear on the category page.
    await page.locator('[data-stat-date-range]').first().click()
    await page.getByRole('button', { name: /^(Year|Год)$/ }).first().click()

    const parent = page.locator('[data-stat-category-id="demo_cat_transport"]').first()
    if (!(await parent.isVisible()))
      await groupByParent(page)
    await expect(parent).toBeVisible()
    await parent.locator('[data-stat-category-amount]').click()
    await expect(page).toHaveURL(/\/categories\/demo_cat_transport\?.*statSnapshot=/)

    const descriptionFilter = page.getByText(T.descriptionFilter).first()
    await expect(descriptionFilter).toBeVisible()
    await descriptionFilter.click()
    // The chip cloud only focuses a child in place; the list row is what opens its page.
    const fuel = page.locator('[data-stat-category-id="demo_cat_transport_fuel"]').first()
    if (!(await fuel.isVisible()))
      await page.locator('[data-stat-category-id="demo_cat_transport"]').first().click()
    await expect(fuel).toBeVisible()
    const fuelBox = await fuel.boundingBox()
    expect(fuelBox).not.toBeNull()
    await page.mouse.click(fuelBox!.x + fuelBox!.width / 3, fuelBox!.y + fuelBox!.height / 2)
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
