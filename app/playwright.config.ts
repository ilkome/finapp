import { defineConfig, devices } from '@playwright/test'
import { existsSync } from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

const dirname = path.dirname(fileURLToPath(import.meta.url))
const authFile = path.join(dirname, 'tests', 'e2e', '.auth', 'user.json')
const hasAuth = existsSync(authFile)

export default defineConfig({
  projects: [
    {
      name: 'demo',
      testIgnore: [/auth\.setup\.ts$/, /-real\.spec\.ts$/],
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'auth-setup',
      testMatch: /auth\.setup\.ts$/,
      use: {
        ...devices['Desktop Chrome'],
        channel: 'chrome',
        launchOptions: {
          args: ['--disable-blink-features=AutomationControlled'],
          ignoreDefaultArgs: ['--enable-automation'],
        },
      },
    },
    {
      name: 'real',
      testMatch: /-real\.spec\.ts$/,
      use: {
        ...devices['Desktop Chrome'],
        channel: 'chrome',
        launchOptions: {
          args: ['--disable-blink-features=AutomationControlled'],
          ignoreDefaultArgs: ['--enable-automation'],
        },
        ...(hasAuth ? { storageState: authFile } : {}),
      },
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
