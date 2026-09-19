import type { BrowserContext, Locator, Page } from '@playwright/test'

import { expect } from '@playwright/test'

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
  // A running clock, not a fixed one: Vue drops a bubbling event on ancestors whose listener
  // was attached at the same `Date.now()` as the event, so a frozen clock breaks every nested
  // `@click` (a bottom sheet trigger, for one).
  await page.clock.install({ time: now })
  await page.goto('/login', { waitUntil: 'domcontentloaded' })
  await page.getByRole('button', { name: /demo|демо/i }).click()
  await page.waitForURL(/\/(dashboard|categories|wallets|stat)/, { timeout: 30_000 })
  // Demo store hydrates synchronously, but debouncedPersist (300ms) flushes localforage with a
  // slight delay. Wait so that hard reloads (page.goto) can re-hydrate the store from cache.
  await page.waitForTimeout(800)
}

/** The aria snapshot once two consecutive reads agree: stores hydrate after the page is visible. */
export async function stableAriaSnapshot(locator: Locator) {
  let previous = ''
  await expect.poll(async () => {
    const current = await locator.ariaSnapshot()
    const isStable = current === previous
    previous = current
    return isStable
  }, { intervals: [300], timeout: 15_000 }).toBe(true)
  return previous
}
