import type { BrowserContext, Locator, Page } from '@playwright/test'

import { expect, test } from '@playwright/test'

const startDemo = /demo|демо/i
const transactionWallet = /Debit card|Credit card|Cash|Savings|Dollar account/
const addTransaction = /^(Add transaction|Добавить операцию)$/
const deleteTransaction = /Delete transaction\?|Удалить операцию\?/
const deleteAction = /^(Delete|Удалить)$/

type Geometry = {
  documentHeight: number
  feedTop: number
  rowTop: number
  scrollTop: number
}

async function bootstrapDemo(page: Page, context: BrowserContext) {
  await context.clearCookies()
  await page.goto('/login', { waitUntil: 'domcontentloaded' })
  await page.getByRole('button', { name: startDemo }).click()
  await page.waitForURL(/\/(dashboard|categories|wallets|stat)/, { timeout: 30_000 })
  await page.waitForTimeout(800)
  await page.goto('/dashboard', { waitUntil: 'domcontentloaded' })
  await expect(page.locator('.stat-trns-virtual')).toBeVisible({ timeout: 15_000 })
}

async function findVisibleTransaction(page: Page): Promise<Locator> {
  const rows = page.locator('.stat-trns-virtual > [data-index]')
  const viewportHeight = page.viewportSize()?.height ?? 800
  const stickyBottom = await page.locator('[data-stat-sticky-summary]').evaluate((element) => {
    const rect = element.getBoundingClientRect()
    return rect.top <= 50 ? rect.bottom : 160
  })
  for (let index = 0; index < await rows.count(); index++) {
    const row = rows.nth(index)
    const target = row.locator('.uiElement.interactive').first()
    if (await target.count() === 0)
      continue
    const box = await target.boundingBox()
    if (!box || box.y < stickyBottom + 8 || box.y + box.height > viewportHeight - 60)
      continue
    if (!transactionWallet.test(await row.textContent() ?? ''))
      continue
    const receivesPointer = await target.evaluate((element, point) => {
      const hit = document.elementFromPoint(point.x, point.y)
      return !!hit && element.contains(hit)
    }, { x: box.x + box.width / 2, y: box.y + box.height / 2 })
    if (!receivesPointer)
      continue

    return row
  }
  throw new Error('No visible transaction row was available for a physical click')
}

async function physicalClick(page: Page, row: Locator) {
  const box = await row.locator('.uiElement.interactive').first().boundingBox()
  if (!box)
    throw new Error('The transaction row became unavailable before the physical click')
  await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2)
}

async function geometry(page: Page, row: Locator): Promise<Geometry> {
  return page.evaluate(element => ({
    documentHeight: document.scrollingElement?.scrollHeight ?? 0,
    feedTop: document.querySelector('.stat-trns-virtual')?.getBoundingClientRect().top ?? 0,
    rowTop: element.getBoundingClientRect().top,
    scrollTop: document.scrollingElement?.scrollTop ?? 0,
  }), await row.elementHandle())
}

function expectStableGeometry(before: Geometry, after: Geometry) {
  expect(after.scrollTop).toBeCloseTo(before.scrollTop, 0)
  expect(after.feedTop).toBeCloseTo(before.feedTop, 0)
  expect(after.rowTop).toBeCloseTo(before.rowTop, 0)
  expect(after.documentHeight).toBeCloseTo(before.documentHeight, 0)
}

test.describe('Statistics measured virtual feed', () => {
  test('uses the shared virtual and sticky host on category and wallet pages', async ({ context, page }) => {
    await page.setViewportSize({ height: 900, width: 1440 })
    await bootstrapDemo(page, context)

    for (const path of [
      '/categories/demo_cat_food',
      '/categories/demo_cat_food_groceries',
      '/wallets/demo_w_debit_rub',
    ]) {
      await page.goto(path, { waitUntil: 'domcontentloaded' })

      const feed = page.locator('.stat-trns-virtual')
      const feedState = feed.locator('..')
      const summary = page.locator('[data-stat-sticky-summary]')
      await expect(feed).toBeVisible({ timeout: 15_000 })
      await expect(feedState).toHaveAttribute('data-stat-listener-count', '11')
      expect(await feed.locator(':scope > [data-index]').count()).toBeLessThanOrEqual(120)
      expect(await summary.evaluate(element => getComputedStyle(element).position)).toBe('sticky')

      const initialScrollTop = await page.evaluate(() => document.scrollingElement?.scrollTop ?? 0)
      await page.mouse.wheel(0, 900)
      await expect.poll(() => page.evaluate(() => document.scrollingElement?.scrollTop ?? 0)).toBeGreaterThan(initialScrollTop)
      expect(await feed.locator(':scope > [data-index]').count()).toBeLessThanOrEqual(120)
    }
  })

  test('mounts only active report contexts and balances viewport resources', async ({ context, page }) => {
    await page.setViewportSize({ height: 900, width: 1440 })
    await bootstrapDemo(page, context)

    const report = page.locator('[data-stat-report-context-count]')
    const feedState = page.locator('.stat-trns-virtual').locator('..')
    await expect(report).toHaveAttribute('data-stat-report-context-count', '1')
    await expect(feedState).toHaveAttribute('data-stat-listener-count', '11')

    for (const name of [/^Expense$/, /^Income$/]) {
      await page.getByRole('button', { name }).first().click()
      await expect(report).toHaveAttribute('data-stat-report-context-count', '1')
    }

    await page.getByRole('button', { name: /^Split$/ }).first().click()
    await expect(report).toHaveAttribute('data-stat-report-context-count', '2')
    await page.getByRole('button', { name: /^Summary$/ }).first().click()
    await expect(report).toHaveAttribute('data-stat-report-context-count', '1')
    await expect(feedState).toHaveAttribute('data-stat-listener-count', '11')
    expect(Number(await feedState.getAttribute('data-stat-observer-count'))).toBeLessThanOrEqual(2)
  })

  for (const viewport of [
    { height: 844, width: 390 },
    { height: 800, width: 768 },
    { height: 800, width: 1024 },
    { height: 900, width: 1440 },
  ]) {
    test(`keeps summary geometry stable across period transitions at ${viewport.width}x${viewport.height}`, async ({ context, page }) => {
      await page.setViewportSize(viewport)
      await bootstrapDemo(page, context)

      const feed = page.locator('.stat-trns-virtual')
      const feedState = feed.locator('..')
      const summary = page.locator('[data-stat-sticky-summary]')
      const initialOffset = Number(await feedState.getAttribute('data-stat-active-offset'))
      const initialSummaryHeight = await summary.evaluate(element => element.getBoundingClientRect().height)

      let activeOffset = initialOffset
      for (let attempt = 0; attempt < 30 && activeOffset === initialOffset; attempt++) {
        await page.mouse.wheel(0, 240)
        await page.waitForTimeout(50)
        activeOffset = Number(await feedState.getAttribute('data-stat-active-offset'))
      }

      expect(activeOffset).toBeGreaterThan(initialOffset)
      const transitionCount = Number(await feedState.getAttribute('data-stat-active-transition-count'))
      const loadCount = Number(await feedState.getAttribute('data-stat-load-count'))
      await page.waitForTimeout(400)

      expect(await summary.evaluate(element => element.getBoundingClientRect().height)).toBeCloseTo(initialSummaryHeight, 0)
      expect(Number(await feedState.getAttribute('data-stat-active-offset'))).toBe(activeOffset)
      expect(Number(await feedState.getAttribute('data-stat-active-transition-count'))).toBe(transitionCount)
      expect(Number(await feedState.getAttribute('data-stat-load-count'))).toBe(loadCount)

      for (let attempt = 0; attempt < 30 && activeOffset !== initialOffset; attempt++) {
        await page.mouse.wheel(0, -120)
        await page.waitForTimeout(50)
        activeOffset = Number(await feedState.getAttribute('data-stat-active-offset'))
      }

      expect(activeOffset).toBe(initialOffset)
      expect(Number(await feedState.getAttribute('data-stat-active-transition-count'))).toBe(transitionCount + 1)
    })
  }

  test('loads only while scrolling forward and preserves desktop scroll through editor reflow', async ({ context, page }) => {
    await page.setViewportSize({ height: 800, width: 1024 })
    await bootstrapDemo(page, context)

    const feed = page.locator('.stat-trns-virtual')
    await page.mouse.wheel(0, 1600)
    await expect.poll(async () => Number(await feed.locator('..').getAttribute('data-stat-load-count'))).toBeGreaterThan(0)
    await expect(page.getByRole('heading', { name: /Previous transactions|Предыдущие транзакции/ })).toHaveCount(1)

    const loadCount = Number(await feed.locator('..').getAttribute('data-stat-load-count'))
    const heightBeforeBackwardScroll = await page.evaluate(() => document.scrollingElement?.scrollHeight ?? 0)
    await page.mouse.wheel(0, -900)
    await page.waitForTimeout(400)
    expect(Number(await feed.locator('..').getAttribute('data-stat-load-count'))).toBe(loadCount)
    expect(await page.evaluate(() => document.scrollingElement?.scrollHeight ?? 0)).toBe(heightBeforeBackwardScroll)
    expect(await feed.locator(':scope > [data-index]').count()).toBeLessThanOrEqual(120)

    await page.mouse.wheel(0, 900)
    const row = await findVisibleTransaction(page)
    const beforeOpen = await geometry(page, row)
    await physicalClick(page, row)
    await expect(page.locator('.trnForm')).toBeVisible({ timeout: 15_000 })
    await page.waitForTimeout(400)
    const opened = await geometry(page, row)
    expect(opened.scrollTop).toBeCloseTo(beforeOpen.scrollTop, 0)
    await expect(row).toBeInViewport()

    await page.keyboard.press('Escape')
    await expect(page.locator('.trnForm')).toBeHidden()
    await page.waitForTimeout(400)
    expectStableGeometry(beforeOpen, await geometry(page, row))

    const loadedOffsetsBeforeFilter = JSON.parse(await feed.locator('..').getAttribute('data-stat-loaded-offsets') ?? '[]') as number[]
    const searchedThroughBeforeFilter = await feed.locator('..').getAttribute('data-stat-searched-through-offset')
    await page.mouse.wheel(0, -10_000)
    const descriptionFilter = page.getByText(/Only with description|Только с описанием/, { exact: true }).locator('..')
    const filterBox = await descriptionFilter.boundingBox()
    if (!filterBox)
      throw new Error('The description filter was not physically visible')
    await page.mouse.click(filterBox.x + filterBox.width / 2, filterBox.y + filterBox.height / 2)
    await page.waitForTimeout(300)

    const loadedOffsetsAfterFilter = JSON.parse(await feed.locator('..').getAttribute('data-stat-loaded-offsets') ?? '[]') as number[]
    expect(loadedOffsetsAfterFilter).toEqual(expect.arrayContaining(loadedOffsetsBeforeFilter))
    expect(await feed.locator('..').getAttribute('data-stat-searched-through-offset')).toBe(searchedThroughBeforeFilter)
  })

  test('keeps mobile scroll and row position through physical open and browser Back', async ({ context, page }) => {
    await page.setViewportSize({ height: 844, width: 390 })
    await bootstrapDemo(page, context)
    await page.mouse.wheel(0, 1500)
    await page.waitForTimeout(300)

    const row = await findVisibleTransaction(page)
    const beforeOpen = await geometry(page, row)
    await physicalClick(page, row)
    await expect(page.locator('.trnForm')).toBeVisible({ timeout: 15_000 })
    await page.waitForTimeout(400)
    const opened = await geometry(page, row)
    expectStableGeometry(beforeOpen, opened)

    await page.goBack()
    await expect(page.locator('.trnForm')).toBeHidden()
    expectStableGeometry(opened, await geometry(page, row))
  })

  test('rebuilds the feed index once for create and delete', async ({ context, page }) => {
    await page.setViewportSize({ height: 800, width: 1024 })
    await bootstrapDemo(page, context)

    const feedState = page.locator('.stat-trns-virtual').locator('..')
    const buildCount = async () => Number(await feedState.getAttribute('data-stat-index-build-count'))
    const rowBuildCount = async () => Number(await feedState.getAttribute('data-stat-row-build-count'))
    const buildCountBeforeCreate = await buildCount()
    const rowBuildCountBeforeCreate = await rowBuildCount()

    await page.getByText(addTransaction, { exact: true }).click()
    const form = page.locator('.trnForm')
    await expect(form).toBeVisible()
    await form.locator('input[inputmode="tel"]').first().fill('9876543')
    await form.locator('[class*="bg-primary/50"]').click()

    const transactionRow = page.locator('.stat-trns-virtual > [data-index]').filter({ hasText: '9 876 543' })
    const createdAmount = transactionRow.getByText('9 876 543', { exact: true })
    await expect(createdAmount).toBeVisible()
    await expect.poll(buildCount).toBe(buildCountBeforeCreate + 1)
    await expect.poll(rowBuildCount).toBe(rowBuildCountBeforeCreate + 1)
    expect(Number(await feedState.getAttribute('data-stat-index-build-duration'))).toBeLessThan(50)

    await page.keyboard.press('Escape')
    await expect(form).toBeHidden()
    await page.waitForTimeout(400)
    await transactionRow.locator('.uiElement.interactive').click({ button: 'right' })
    const deleteMenuItem = page.getByRole('menuitem', { name: deleteAction })
    await expect(deleteMenuItem).toBeVisible()
    await deleteMenuItem.dispatchEvent('click')
    await page.getByRole('dialog', { name: deleteTransaction }).getByRole('button', { name: deleteAction }).click()

    await expect(createdAmount).toHaveCount(0)
    await expect.poll(buildCount).toBe(buildCountBeforeCreate + 2)
    await expect.poll(rowBuildCount).toBe(rowBuildCountBeforeCreate + 2)
    expect(Number(await feedState.getAttribute('data-stat-index-build-duration'))).toBeLessThan(50)
  })
})
