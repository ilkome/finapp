import { expect, test as setup } from '@playwright/test'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

const dirname = path.dirname(fileURLToPath(import.meta.url))
const authFile = path.join(dirname, '.auth', 'user.json')

// Defaults match the fixed user created by `pnpm test:e2e:db:seed`
// (scripts/seed-e2e-user.mjs). Local-dev only. Override via env if needed.
const email = process.env.E2E_USER_EMAIL ?? 'e2e@finapp.local'
const password = process.env.E2E_USER_PASSWORD ?? 'e2e-finapp-test-pw'

setup('authenticate', async ({ page }) => {
  setup.setTimeout(5 * 60_000)

  const appUrl = /\/(dashboard|categories|wallets|stat|settings)/

  if (email && password) {
    // Automated. Retry the whole goto -> fill -> submit because a cold dev server
    // can full-reload mid-flight (Vite re-optimizes deps like motion-v on first
    // visit and pushes a reload), which interrupts navigation or wipes the form.
    // Once the deps are bundled a retry lands cleanly. type-based selectors are
    // i18n-agnostic.
    await expect(async () => {
      await page.goto('/login', { waitUntil: 'domcontentloaded' })
      await page.locator('input[type="email"]').fill(email)
      await page.locator('input[type="password"]').fill(password)
      await page.locator('button[type="submit"]').click()
      await page.waitForURL(appUrl, { timeout: 15_000 })
    }).toPass({ timeout: 4 * 60_000 })
  }
  else {
    // Manual fallback: no credentials provided - sign in by hand in the window.
    console.log(
      '\n=== Auth setup ===\n'
      + 'A browser window will open. Sign in with your Supabase email and password.\n'
      + `The session will be saved to ${path.relative(process.cwd(), authFile)} once you reach the app.\n`,
    )
    await page.goto('/login')
    await page.waitForURL(appUrl, { timeout: 5 * 60_000 })
  }

  await page.context().storageState({ path: authFile })

  console.log(`Saved auth state to ${authFile}`)
})
