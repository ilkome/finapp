import { defineConfig, devices } from '@playwright/test'
import process from 'node:process'

// Runs e2e against a real production build. The reka-ui chunk-duplication
// inject regression only surfaces in the minified, code-split bundle - the
// default config serves `pnpm dev:local`, which can't reproduce it.
// Own port and never reuse: a dev server on the same port would be tested instead of the build.
const port = Number(process.env.E2E_PORT) || 3090

export default defineConfig({
  projects: [{ name: 'demo', use: { ...devices['Desktop Chrome'] } }],
  reporter: [['list']],
  retries: 0,
  testDir: './tests/e2e',
  testMatch: /context-menu-smoke\.spec\.ts/,
  use: {
    baseURL: `http://localhost:${port}`,
    trace: 'retain-on-failure',
  },
  webServer: {
    command: `pnpm build && PORT=${port} node scripts/serve-static.mjs`,
    reuseExistingServer: false,
    stderr: 'pipe',
    stdout: 'ignore',
    timeout: 300_000,
    url: `http://localhost:${port}`,
  },
})
