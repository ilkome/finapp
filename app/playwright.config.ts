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
  use: {
    baseURL: 'http://localhost:3050',
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
    video: 'retain-on-failure',
  },
  webServer: {
    // Disable Nuxt devtools so its toolbar doesn't intercept clicks on
    // bottom-anchored buttons (Apply / Save) during E2E.
    command: 'NUXT_DEVTOOLS_ENABLED=false pnpm dev',
    reuseExistingServer: !process.env.CI,
    stderr: 'pipe',
    stdout: 'ignore',
    timeout: 120_000,
    url: 'http://localhost:3050',
  },
})
