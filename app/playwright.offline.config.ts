import { defineConfig, devices } from '@playwright/test'

// Offline / sync scenarios against a production build and the local backend (Supabase via
// `supabase start`, PowerSync via docker compose). Local only, no CI job: the spec skips itself
// when the backend is down. Separate from playwright.config.ts because that config's webServer
// starts the dev server on 3050, which cannot run through the network proxy.
const port = 3080

export default defineConfig({
  projects: [{ name: 'offline', use: { ...devices['Desktop Chrome'] } }],
  reporter: [['list']],
  retries: 0,
  testDir: './tests/e2e',
  testMatch: /offline-sync\.spec\.ts/,
  timeout: 120_000,
  use: {
    baseURL: `http://localhost:${port}`,
    trace: 'retain-on-failure',
  },
  webServer: {
    command: 'node scripts/e2e-offline-server.mjs',
    reuseExistingServer: true,
    stderr: 'pipe',
    stdout: 'pipe',
    timeout: 600_000,
    url: `http://localhost:${port}`,
  },
})
