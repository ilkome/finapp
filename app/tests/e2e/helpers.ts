import type { BrowserContext, Page } from '@playwright/test'

export const DEMO_SEED = 42
// Mid-month weekday, so "this month" / "this week" periods have data on both sides.
export const DEMO_NOW = new Date('2026-09-11T10:00:00')

/**
 * Sign in to the demo with reproducible data: the generator reads `__finappDemoSeed` and the
 * browser clock is frozen, so amounts, dates and "current period" are identical on every run.
 */
export async function openDemo(page: Page, context: BrowserContext, { now = DEMO_NOW, seed = DEMO_SEED } = {}) {
  await context.clearCookies()
  await page.addInitScript((value) => {
    (window as { __finappDemoSeed?: number }).__finappDemoSeed = value
  }, seed)
  await page.clock.setFixedTime(now)
  await page.goto('/login', { waitUntil: 'domcontentloaded' })
  await page.getByRole('button', { name: /demo|демо/i }).click()
  await page.waitForURL(/\/(dashboard|categories|wallets|stat)/, { timeout: 30_000 })
  // Demo store hydrates synchronously, but debouncedPersist (300ms) flushes localforage with a
  // slight delay. Wait so that hard reloads (page.goto) can re-hydrate the store from cache.
  await page.waitForTimeout(800)
}
