// Runs repro.html in headless Chromium (from the app's @playwright/test) for each variant, at 1x and 4x CPU.
// Usage: node perf/nuxt-icon-543/run-desktop.mjs [runs]
import { createRequire } from 'node:module'
import path from 'node:path'
import process from 'node:process'

const require = createRequire(new URL('../../app/package.json', import.meta.url))
const { chromium } = require('@playwright/test')

const file = path.join(import.meta.dirname, 'repro.html')
const runs = Number(process.argv[2] || 3)

async function main() {
  const browser = await chromium.launch()
  const page = await browser.newPage()
  const cdp = await page.context().newCDPSession(page)
  for (const throttle of [1, 4]) {
    await cdp.send('Emulation.setCPUThrottlingRate', { rate: throttle })
    for (let run = 0; run < runs; run++) {
      for (const variant of ['none', 'property', 'adopted']) {
        await page.goto(`file://${file}?variant=${variant}`)
        await page.waitForFunction(() => window.__result, null, { timeout: 60000 })
        console.log(JSON.stringify({ chrome: browser.version(), throttle, ...(await page.evaluate(() => window.__result)) }))
      }
    }
  }
  await browser.close()
}

main()
