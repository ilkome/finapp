import { test as setup } from '@playwright/test'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

const dirname = path.dirname(fileURLToPath(import.meta.url))
const authFile = path.join(dirname, '.auth', 'user.json')

setup('authenticate', async ({ context, page }) => {
  setup.setTimeout(5 * 60_000)

  // Mask common automation tells before any page script runs.
  // Combined with launchOptions (no --enable-automation) this gets through Google's
  // basic "browser is not secure" check.
  await context.addInitScript(() => {
    Object.defineProperty(navigator, 'webdriver', { get: () => undefined })
    Object.defineProperty(navigator, 'languages', { get: () => ['en-US', 'en'] })
    Object.defineProperty(navigator, 'plugins', { get: () => [1, 2, 3, 4, 5] })
  })

  console.log(
    '\n=== Auth setup ===\n'
    + 'A browser window will open. Sign in with your real Google account.\n'
    + `The session will be saved to ${path.relative(process.cwd(), authFile)} once you reach the app.\n`,
  )

  await page.goto('/login')
  await page.waitForURL(/\/(dashboard|categories|wallets|stat|settings)/, {
    timeout: 5 * 60_000,
  })
  await page.context().storageState({ path: authFile })

  console.log(`Saved auth state to ${authFile}`)
})
