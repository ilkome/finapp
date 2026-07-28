import type { BrowserContext, Page } from '@playwright/test'

import { expect, test } from '@playwright/test'

const T = {
  expense: /^(Expense|Расход)$/,
  income: /^(Income|Доход)$/,
  startDemo: /demo|демо/i,
  summary: /^(Summary|Общее)$/,
}

async function bootstrapDemo(page: Page, context: BrowserContext) {
  await context.clearCookies()
  await page.goto('/login', { waitUntil: 'domcontentloaded' })
  await page.getByRole('button', { name: T.startDemo }).click()
  await page.waitForURL(/\/(dashboard|categories|wallets|stat)/, { timeout: 30_000 })
  await page.waitForTimeout(800)
}

test.describe('Stat / dashboard smoke', () => {
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

    // §3 Tab switching: click Expense, then Income, then back to Summary.
    // Dashboard may render two StatMenu instances (split view); .first() scopes to the first.
    const expenseTab = page.getByRole('tab', { name: T.expense }).first()
    const incomeTab = page.getByRole('tab', { name: T.income }).first()
    const summaryTab = page.getByRole('tab', { name: T.summary }).first()

    await expect(expenseTab).toBeVisible({ timeout: 5_000 })

    await expenseTab.click()
    // After switching, the stat root must still be present (no crash/unmount).
    await expect(statRoot).toBeVisible()

    await incomeTab.click()
    await expect(statRoot).toBeVisible()

    await summaryTab.click()
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
