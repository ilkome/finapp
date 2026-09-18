import type { BrowserContext, Page } from '@playwright/test'

import { expect, test } from '@playwright/test'

import { openDemo } from './helpers'

// The summary tiles are the type filter: pressing one narrows the report to that type.
const T = {
  expense: /^(Spending|Траты)/,
  income: /^(Income|Доходы)/,
}

async function bootstrapDemo(page: Page, context: BrowserContext) {
  await openDemo(page, context)
}

test.describe('Stat / dashboard smoke', () => {
  test('filters by type from the summary tiles and keeps the page period', async ({ context, page }) => {
    await bootstrapDemo(page, context)
    await page.goto('/dashboard', { waitUntil: 'domcontentloaded' })

    const dateRange = page.locator('[data-stat-date-range]').first()
    const expenseTile = page.getByRole('button', { name: T.expense }).first()
    const incomeTile = page.getByRole('button', { name: T.income }).first()
    await expect(expenseTile).toHaveAttribute('aria-pressed', 'false')

    await expenseTile.click()
    await expect(expenseTile).toHaveAttribute('aria-pressed', 'true')

    const initialPeriod = (await dateRange.textContent())?.trim()
    await dateRange.click()
    await page.getByRole('button', { name: /^(Month|Месяц)$/ }).first().click()
    const monthPeriod = (await dateRange.textContent())?.trim()
    expect(monthPeriod).not.toBe(initialPeriod)

    // The period belongs to the page, not to the type filter.
    await incomeTile.click()
    await expect(incomeTile).toHaveAttribute('aria-pressed', 'true')
    await expect(expenseTile).toHaveAttribute('aria-pressed', 'false')
    await expect(dateRange).toHaveText(monthPeriod!)

    await incomeTile.click()
    await expect(incomeTile).toHaveAttribute('aria-pressed', 'false')
    await expect(dateRange).toHaveText(monthPeriod!)
  })

  test('page loads with no errors, chart renders, tabs switch cleanly', async ({ context, page }) => {
    const consoleErrors: string[] = []
    const pageErrors: string[] = []

    page.on('console', (msg) => {
      if (msg.type() === 'error')
        consoleErrors.push(msg.text())
    })
    page.on('pageerror', e => pageErrors.push(e.message))

    await bootstrapDemo(page, context)

    // Navigate to the stat/dashboard page.
    await page.goto('/dashboard', { waitUntil: 'domcontentloaded' })

    // Wait for the stat report area to appear (the @container/stat div is the root of StatReport).
    const statRoot = page.locator('.\\@container\\/stat').first()
    await expect(statRoot).toBeVisible({ timeout: 15_000 })

    // §2 Chart renders: echarts uses SVGRenderer, so it mounts an <svg> element.
    // Give the idle-mount delay (useIdleMount) up to 10s to resolve.
    const chartSvg = statRoot.locator('svg').first()
    await expect(chartSvg).toBeVisible({ timeout: 10_000 })

    // §3 Type switching: Expense, then Income, then back to everything.
    const expenseTile = page.getByRole('button', { name: T.expense }).first()
    const incomeTile = page.getByRole('button', { name: T.income }).first()

    await expect(expenseTile).toBeVisible({ timeout: 5_000 })

    await expenseTile.click()
    // After switching, the stat root must still be present (no crash/unmount).
    await expect(statRoot).toBeVisible()

    await incomeTile.click()
    await expect(statRoot).toBeVisible()

    await incomeTile.click()
    await expect(incomeTile).toHaveAttribute('aria-pressed', 'false')
    await expect(statRoot).toBeVisible()

    // §1 No uncaught errors (primary goal - catches the "Cannot read properties of undefined" class).
    expect(pageErrors, `page errors: ${pageErrors.join('; ')}`).toEqual([])
    // Console errors from echarts/third-party can be noisy; only fail on app errors.
    // Filter out known benign echarts/browser noise and fail only on real app errors.
    const appErrors = consoleErrors.filter(e =>
      !e.includes('ResizeObserver') && !e.includes('echarts'),
    )
    expect(appErrors, `console errors: ${appErrors.join('; ')}`).toEqual([])
  })
})
