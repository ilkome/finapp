import type { BrowserContext, Page } from '@playwright/test'

import { expect, test } from '@playwright/test'
import { readFileSync } from 'node:fs'
import process from 'node:process'

// Runs via playwright.offline.config.ts against the prod build served by
// scripts/e2e-offline-server.mjs, whose TCP proxy stands between the app and the local backend.
// The scenarios build on each other (queued write -> refused sign-out -> drain -> ...), so they
// run serially in one browser context.

const SUPABASE = 'http://127.0.0.1:54321'
const PROXY_CONTROL = 'http://127.0.0.1:8199'
const E2E_EMAIL = 'e2e@finapp.local'
// supabase/seed.sql sets `finapp-e2e`; override when the local user has another password.
const E2E_PASSWORD = process.env.E2E_PASSWORD ?? 'finapp-e2e'

const ANON_KEY = readFileSync(new URL('../../.env.local', import.meta.url), 'utf8')
  .match(/^VITE_SUPABASE_ANON_KEY=(.+)$/m)?.[1]
  ?.trim() ?? ''

type Session = Record<string, unknown> & { access_token: string, user: { id: string } }

const T = {
  addTransaction: /Add transaction|Создать транзакцию/,
  discarded: /from the previous account were discarded|предыдущего аккаунта/,
  logout: /^(Logout|Выйти из аккаунта)$/,
  menu: /^(Menu|Меню)$/,
  pending: /1 change\(s\) not synced|Не синхронизировано: 1/,
  sessionLost: /Sign in again to upload them|Войдите снова/,
  signOutRefused: /not synced yet|Ещё не синхронизировано изменений/,
}

async function backendUp(): Promise<boolean> {
  try {
    const [sb, ps] = await Promise.all([
      fetch(`${SUPABASE}/auth/v1/health`),
      fetch('http://127.0.0.1:8080/probes/liveness'),
    ])
    return sb.ok && ps.ok
  }
  catch {
    return false
  }
}

async function auth(path: string, body: Record<string, string>): Promise<Session> {
  const res = await fetch(`${SUPABASE}/auth/v1/${path}`, {
    body: JSON.stringify(body),
    headers: { 'apikey': ANON_KEY, 'content-type': 'application/json' },
    method: 'POST',
  })
  if (!res.ok)
    throw new Error(`${path} failed: ${res.status} ${await res.text()}`)
  return await res.json() as Session
}

const login = (email: string, password: string) => auth('token?grant_type=password', { email, password })
const signUp = (email: string, password: string) => auth('signup', { email, password })

/** Seed the persisted supabase-js session the app reads on boot (the local PKCE flow has no UI). */
async function injectSession(page: Page, session: Session) {
  await page.goto('/login')
  await page.evaluate((s) => {
    localStorage.setItem('finapp.auth', JSON.stringify(s))
    // A leftover demo cookie on localhost is shared across ports and silently starts demo mode.
    document.cookie = 'finapp.isDemo=; max-age=0; path=/'
  }, session)
}

async function countServerTrns(session: Session): Promise<number> {
  const res = await fetch(`${SUPABASE}/rest/v1/trns?select=id`, {
    headers: { apikey: ANON_KEY, authorization: `Bearer ${session.access_token}` },
  })
  return (await res.json() as unknown[]).length
}

const proxy = (state: 'hang' | 'off' | 'on') => fetch(`${PROXY_CONTROL}/${state}`)

async function addTransaction(page: Page, amount: string) {
  await page.locator('aside').getByText(T.addTransaction, { exact: true }).click()
  const input = page.locator('input[inputmode="tel"]').first()
  await input.fill(amount)
  await input.press('Enter')
}

// Nuxt UI mirrors every toast into an aria-live region, so match the visible copy only.
const toast = (page: Page, text: RegExp) => page.locator('[data-slot="description"]').getByText(text)

const openSidebarMenu = (page: Page) => page.locator('aside').getByRole('button', { name: T.menu }).click()

test.describe.configure({ mode: 'serial' })

test.describe('offline and sync', () => {
  let context: BrowserContext
  let page: Page
  let e2e: Session
  let serverTrnsBefore = 0

  const walletLink = () => page.locator('a[href^="/wallets/"]').first()
  const syncDot = () => page.getByTestId('sync-issue-dot')

  test.beforeAll(async ({ browser }) => {
    test.skip(!(await backendUp()), 'local Supabase + PowerSync are down')
    await proxy('on')
    e2e = await login(E2E_EMAIL, E2E_PASSWORD)
    context = await browser.newContext({ locale: 'en-US', viewport: { height: 900, width: 1280 } })
    page = await context.newPage()
  })

  test.afterAll(async () => {
    await proxy('on')
    await context?.close()
  })

  test('first sync lands in local SQLite and the service worker precaches the shell', async () => {
    await injectSession(page, e2e)
    await page.goto('/dashboard')
    await expect(walletLink()).toBeVisible({ timeout: 60_000 })
    await expect(syncDot()).toBeHidden({ timeout: 60_000 })

    // Workbox precaches during install, which completes before `ready` resolves.
    await page.evaluate(() => navigator.serviceWorker.ready)
    expect((await page.evaluate(() => caches.keys())).length).toBeGreaterThan(0)
  })

  test('an offline write stays queued and the menu shows the unsynced state', async () => {
    serverTrnsBefore = await countServerTrns(e2e)
    await proxy('off')
    await addTransaction(page, '123')

    await expect(syncDot()).toBeVisible({ timeout: 20_000 })
    await openSidebarMenu(page)
    await expect(page.getByText(T.pending)).toBeVisible()
    expect(await countServerTrns(e2e)).toBe(serverTrnsBefore)
  })

  test('sign-out is refused while a write is queued', async () => {
    await page.getByRole('button', { name: T.logout }).click()
    await expect(toast(page, T.signOutRefused)).toBeVisible({ timeout: 20_000 })
    await expect(page).toHaveURL(/dashboard/)
    await expect(walletLink()).toBeVisible()
    await page.keyboard.press('Escape')
  })

  test('a fully offline reload still shows local data', async () => {
    await context.setOffline(true)
    await page.reload()
    await expect(walletLink()).toBeVisible({ timeout: 30_000 })
    await expect(syncDot()).toBeVisible({ timeout: 20_000 })
    await context.setOffline(false)
  })

  test('reconnecting drains the queue to the server', async () => {
    await proxy('on')
    await expect(syncDot()).toBeHidden({ timeout: 90_000 })
    await expect.poll(() => countServerTrns(e2e), { timeout: 30_000 }).toBe(serverTrnsBefore + 1)
  })

  test('a revoked session on cold start pauses sync and keeps the queued write', async () => {
    await proxy('off')
    await addTransaction(page, '77')
    await expect(syncDot()).toBeVisible({ timeout: 20_000 })

    // Expired access token + a refresh token the server rejects = the session was revoked elsewhere.
    await page.evaluate(() => {
      const s = JSON.parse(localStorage.getItem('finapp.auth')!)
      s.expires_at = Math.floor(Date.now() / 1000) - 3600
      s.refresh_token = 'revoked'
      localStorage.setItem('finapp.auth', JSON.stringify(s))
    })
    await proxy('on')
    await page.goto('/dashboard')

    await expect(toast(page, T.sessionLost)).toBeVisible({ timeout: 30_000 })
    // Local data stays on screen; only syncing stops.
    await expect(walletLink()).toBeVisible()
    // Paused, not wiped: the owner marker survives so a same-user re-auth drains the queue.
    expect(await page.evaluate(() => localStorage.getItem('finapp.psDbOwnerUid'))).toBe(e2e.user.id)
  })

  test('a different user signing in wipes the local db and reports the discarded write', async () => {
    const other = await signUp(`e2e-other-${Date.now()}@finapp.local`, E2E_PASSWORD)
    await injectSession(page, other)
    await page.goto('/dashboard')

    await expect(toast(page, T.discarded)).toBeVisible({ timeout: 30_000 })
    await expect.poll(() => page.evaluate(() => localStorage.getItem('finapp.psDbOwnerUid')), { timeout: 30_000 }).toBe(other.user.id)
  })

  test('online sign-out with an empty queue clears the device', async () => {
    e2e = await login(E2E_EMAIL, E2E_PASSWORD)
    await injectSession(page, e2e)
    await page.goto('/dashboard')
    await expect(walletLink()).toBeVisible({ timeout: 60_000 })
    // The owner marker is written once the boot connect finished (after wiping the other user).
    await expect.poll(() => page.evaluate(() => localStorage.getItem('finapp.psDbOwnerUid')), { timeout: 30_000 }).toBe(e2e.user.id)
    await expect(syncDot()).toBeHidden({ timeout: 60_000 })

    await openSidebarMenu(page)
    await page.getByRole('button', { name: T.logout }).click()

    await expect(page).toHaveURL(/\/login/, { timeout: 30_000 })
    expect(await page.evaluate(() => [localStorage.getItem('finapp.auth'), localStorage.getItem('finapp.psDbOwnerUid')])).toEqual([null, null])
  })
})
