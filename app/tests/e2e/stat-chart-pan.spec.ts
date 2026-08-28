import type { BrowserContext, Page } from '@playwright/test'

import { expect, test } from '@playwright/test'

const startDemo = /demo|демо/i

async function bootstrapDemo(page: Page, context: BrowserContext) {
  await context.clearCookies()
  await page.goto('/login', { waitUntil: 'domcontentloaded' })
  await page.getByRole('button', { name: startDemo }).click()
  await page.waitForURL(/\/(dashboard|categories|wallets|stat)/, { timeout: 30_000 })
  await page.waitForTimeout(800)
  await page.goto('/dashboard', { waitUntil: 'domcontentloaded' })
}

test('native chart drag previews continuously and commits one bounded window', async ({ context, page }) => {
  await bootstrapDemo(page, context)

  const chart = page.locator('[data-stat-chart-pan-offset]').first()
  await expect(chart).toBeVisible({ timeout: 15_000 })
  await expect(chart).toHaveAttribute('data-stat-chart-pan-offset', '0')
  await expect(chart).toHaveAttribute('data-stat-chart-commit-count', '0')
  const visibleCount = Number(await chart.getAttribute('data-stat-chart-visible-count'))
  const initialStart = await chart.getAttribute('data-stat-chart-start-value')
  const initialBufferSize = Number(await chart.getAttribute('data-stat-chart-buffer-size'))
  expect(visibleCount).toBeGreaterThan(1)
  expect(initialBufferSize).toBeLessThanOrEqual(visibleCount * 3)
  const box = await chart.boundingBox()
  expect(box).not.toBeNull()

  await page.mouse.move(box!.x + (box!.width * 0.4), box!.y + (box!.height * 0.5))
  await page.mouse.down()
  await page.mouse.move(box!.x + (box!.width * 0.96), box!.y + (box!.height * 0.5), { steps: 12 })
  await expect(chart).not.toHaveAttribute('data-stat-chart-start-value', initialStart!)
  await expect(chart).toHaveAttribute('data-stat-chart-pan-offset', '0')
  await expect.poll(async () => Number(await chart.getAttribute('data-stat-chart-buffer-size'))).toBeGreaterThan(initialBufferSize)
  expect(Number(await chart.getAttribute('data-stat-chart-buffer-size'))).toBeLessThanOrEqual(visibleCount * 4)
  await page.mouse.up()

  await expect.poll(async () => Number(await chart.getAttribute('data-stat-chart-pan-offset'))).toBeGreaterThan(0)
  await expect(chart).toHaveAttribute('data-stat-chart-commit-count', '1')
  await expect(chart).toHaveAttribute('data-stat-chart-visible-count', String(visibleCount))
  await expect.poll(async () => Number(await chart.getAttribute('data-stat-chart-buffer-size'))).toBeLessThanOrEqual(visibleCount * 3)

  const offsetAfterDrag = Number(await chart.getAttribute('data-stat-chart-pan-offset'))
  const scrollBeforeWheel = await page.evaluate(() => window.scrollY)
  await page.mouse.wheel(0, 80)
  await page.waitForTimeout(250)
  await expect(chart).toHaveAttribute('data-stat-chart-pan-offset', String(offsetAfterDrag))
  await expect(chart).toHaveAttribute('data-stat-chart-commit-count', '1')
  await expect.poll(async () => page.evaluate(() => window.scrollY)).toBeGreaterThan(scrollBeforeWheel)

  await chart.focus()
  await page.keyboard.press('ArrowRight')
  await expect(chart).toHaveAttribute('data-stat-chart-pan-offset', String(offsetAfterDrag - 1))
  await expect(chart).toHaveAttribute('data-stat-chart-commit-count', '2')

  await page.keyboard.down('Shift')
  await page.mouse.wheel(0, -80)
  await page.keyboard.up('Shift')
  await expect(chart).toHaveAttribute('data-stat-chart-pan-offset', String(offsetAfterDrag))
  await expect(chart).toHaveAttribute('data-stat-chart-commit-count', '3')
})

test('chart tooltip stays visible and omits empty series', async ({ context, page }) => {
  await bootstrapDemo(page, context)

  const chart = page.locator('[data-stat-chart-pan-offset]').first()
  await expect(chart).toBeVisible({ timeout: 15_000 })
  const chartBox = await chart.boundingBox()
  expect(chartBox).not.toBeNull()

  await page.mouse.move(chartBox!.x + chartBox!.width - 48, chartBox!.y + 75)
  const tooltip = page.locator('[data-stat-chart-tooltip]').first()
  await expect(tooltip).toBeVisible()
  const tooltipBox = await tooltip.boundingBox()
  expect(tooltipBox).not.toBeNull()
  expect(tooltipBox!.x).toBeGreaterThanOrEqual(0)
  expect(tooltipBox!.y).toBeGreaterThanOrEqual(chartBox!.y)
  expect(tooltipBox!.x + tooltipBox!.width).toBeLessThanOrEqual(await page.evaluate(() => window.innerWidth))
  expect(tooltipBox!.y + tooltipBox!.height).toBeLessThanOrEqual(await page.evaluate(() => window.innerHeight))

  const values = await tooltip.locator('[data-stat-chart-tooltip-value]').evaluateAll(elements =>
    elements.map(element => Number(element.getAttribute('data-stat-chart-tooltip-value'))),
  )
  expect(values.length).toBeGreaterThan(0)
  expect(values.every(value => Number.isFinite(value) && value !== 0)).toBe(true)
})
