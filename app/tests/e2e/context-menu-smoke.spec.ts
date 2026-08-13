import type { BrowserContext, Page } from '@playwright/test'

import { expect, test } from '@playwright/test'

// Guards production-only bundling regressions. ContextMenuMy mounts on the
// dashboard, so both bootstrap and reka-ui provide/inject failures surface on
// load without additional interaction.
const INJECT_ERROR = /ContextMenuRootContext|must be used within `ContextMenuRoot`/
const NUXT_BOOTSTRAP_ERROR = /NUXT_E1005|hooks\.hookOnce is not a function/

async function bootstrapDemo(page: Page, context: BrowserContext) {
  await context.clearCookies()
  await page.goto('/login', { waitUntil: 'domcontentloaded' })
  await page.getByRole('button', { name: /demo|демо/i }).click()
  await page.waitForURL(/\/(dashboard|categories|wallets|stat)/, { timeout: 30_000 })
  await page.waitForTimeout(800)
}

test('production bundle mounts without bootstrap or reka-ui errors', async ({ context, page }) => {
  const errors: string[] = []
  page.on('console', (m) => {
    if (m.type() === 'error')
      errors.push(m.text())
  })
  page.on('pageerror', e => errors.push(e.message))

  await bootstrapDemo(page, context)
  await page.goto('/dashboard', { waitUntil: 'networkidle' })
  await page.waitForTimeout(1500)

  await expect(page).toHaveTitle(/Dashboard/)
  expect(errors.filter(e => NUXT_BOOTSTRAP_ERROR.test(e))).toEqual([])
  expect(errors.filter(e => INJECT_ERROR.test(e))).toEqual([])
})
