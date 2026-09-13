import type { BrowserContext, Page } from '@playwright/test'

import { expect, test } from '@playwright/test'

import { openDemo } from './helpers'

// ContextMenuMy mounts on the dashboard, so production-only bootstrap and
// reka-ui provide/inject regressions surface without additional interaction.
const INJECT_ERROR = /ContextMenuRootContext|must be used within `ContextMenuRoot`/
const NUXT_BOOTSTRAP_ERROR = /NUXT_E1005|hooks\.hookOnce is not a function/

async function bootstrapDemo(page: Page, context: BrowserContext) {
  await openDemo(page, context)
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
