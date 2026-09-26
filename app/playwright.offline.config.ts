import { defineConfig, devices } from '@playwright/test'

// Offline / sync scenarios against a production build and the local backend (Supabase via
// `supabase start`, PowerSync via docker compose). Local only, no CI job: the spec skips itself
// when the backend is down. Separate from playwright.config.ts because that config's webServer
// starts the dev server on 3050, which cannot run through the network proxy.
const port = 3080

export default defineConfig({
  // Chromium opens the local db on OPFS; `offline-idb` hides `navigator.userAgentData`, which sends
  // the app down the IndexedDB path that iOS and Firefox use (see the spec's beforeAll).
  projects: [
    { name: 'offline', use: { ...devices['Desktop Chrome'] } },
    { name: 'offline-idb', use: { ...devices['Desktop Chrome'] } },
  ],
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
  // Both projects drive the same backend and network proxy, so they must not overlap.
  workers: 1,
})
