import { expect, test } from '@playwright/test'

import { DEMO_NOW, openDemo, stableAriaSnapshot } from './helpers'

// Guards the seeded generator + frozen clock that aria snapshots depend on: two fresh demo
// sessions must render the same tree, and "now" must be the pinned date, not the wall clock.
test('demo data and clock are reproducible', async ({ browser }) => {
  const trees: string[] = []

  for (let i = 0; i < 2; i++) {
    const context = await browser.newContext()
    const page = await context.newPage()
    await openDemo(page, context)

    // The clock runs from the pinned date, so "now" is within the boot time of it.
    expect(Math.abs(await page.evaluate(() => Date.now()) - DEMO_NOW.getTime())).toBeLessThan(60_000)

    await page.goto('/wallets', { waitUntil: 'domcontentloaded' })
    await expect(page.getByRole('main')).toBeVisible()
    trees.push(await stableAriaSnapshot(page.getByRole('main')))
    await context.close()
  }

  expect(trees[0]).toBe(trees[1])
  expect(trees[0]).toMatch(/\d/)
})
