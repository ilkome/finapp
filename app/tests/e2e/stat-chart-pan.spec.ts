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

test('chart drag changes the shared rolling range by one interval', async ({ context, page }) => {
  await bootstrapDemo(page, context)

  const chart = page.locator('[data-stat-chart-pan-offset]').first()
  await expect(chart).toBeVisible({ timeout: 15_000 })
  await expect(chart).toHaveAttribute('data-stat-chart-pan-offset', '0')
  const box = await chart.boundingBox()
  expect(box).not.toBeNull()

  await page.mouse.move(box!.x + (box!.width * 0.4), box!.y + (box!.height * 0.5))
  await page.mouse.down()
  await page.mouse.move(box!.x + (box!.width * 0.4) + 72, box!.y + (box!.height * 0.5), { steps: 3 })
  await page.mouse.up()

  await expect(chart).toHaveAttribute('data-stat-chart-pan-offset', '1')
})
