import { defineConfig, devices } from '@playwright/test'
import process from 'node:process'

export default defineConfig({
  projects: [
    {
      name: 'demo',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  reporter: [['html', { open: 'never' }], ['list']],
  retries: 0,
  testDir: './tests/e2e',
  // The reka-ui inject smoke test only means something against a production
  // build; it runs via playwright.prod.config.ts, not this dev-server config.
  testIgnore: /context-menu-smoke\.spec\.ts/,
  use: {
    baseURL: 'http://localhost:3050',
    // Snapshots must not depend on where they were recorded: the frozen clock in openDemo()
    // is only reproducible with a fixed zone, and the UI language must match the stored trees.
    locale: 'ru-RU',
    screenshot: 'only-on-failure',
    timezoneId: 'Europe/Moscow',
    trace: 'retain-on-failure',
    video: 'retain-on-failure',
  },
  webServer: {
    // Disable Nuxt devtools so its toolbar doesn't intercept clicks on
    // bottom-anchored buttons (Apply / Save) during E2E.
    command: 'NUXT_DEVTOOLS_ENABLED=false pnpm dev:local',
    reuseExistingServer: !process.env.CI,
    stderr: 'pipe',
    stdout: 'ignore',
    timeout: 120_000,
    url: 'http://localhost:3050',
  },
})
