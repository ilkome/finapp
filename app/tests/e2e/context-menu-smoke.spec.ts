import type { BrowserContext, Page } from '@playwright/test'

import { expect, test } from '@playwright/test'

// Guards against the reka-ui dual-version regression: two copies make
// provide/inject fail with "Injection Symbol(ContextMenuRootContext) not found"
// in the bundle. ContextMenuMy mounts on the dashboard (trn rows), so the error
// surfaces on load - no interaction needed to catch it.
const INJECT_ERROR = /ContextMenuRootContext|must be used within `ContextMenuRoot`/

async function bootstrapDemo(page: Page, context: BrowserContext) {
  await context.clearCookies()
  await page.goto('/login', { waitUntil: 'domcontentloaded' })
  await page.getByRole('button', { name: /demo|демо/i }).click()
  await page.waitForURL(/\/(dashboard|categories|wallets|stat)/, { timeout: 30_000 })
  await page.waitForTimeout(800)
}

test('app mounts context menus without a reka-ui inject error', async ({ context, page }) => {
  const errors: string[] = []
  page.on('console', (m) => {
    if (m.type() === 'error')
      errors.push(m.text())
  })
  page.on('pageerror', e => errors.push(e.message))

  await bootstrapDemo(page, context)
  await page.goto('/dashboard', { waitUntil: 'networkidle' })
  await page.waitForTimeout(1500)

  expect(errors.filter(e => INJECT_ERROR.test(e))).toEqual([])
})
