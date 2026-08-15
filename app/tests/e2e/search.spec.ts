import { devices, expect, test } from '@playwright/test'

const T = {
  searchPrompt: /Search categories, wallets, transactions|Поиск категорий, кошельков, транзакций/,
  startDemo: /demo|демо/i,
}

test('search opens empty with a focused input', async ({ context, page }) => {
  await context.clearCookies()
  await page.goto('/login', { waitUntil: 'domcontentloaded' })
  await page.getByRole('button', { name: T.startDemo }).click()
  await page.waitForURL(/\/(dashboard|categories|wallets|stat)/, { timeout: 30_000 })

  await page.getByRole('button', { name: /^(Search|Поиск)$/ }).first().click()

  const palette = page.locator('[data-search-command-palette]')
  const input = palette.locator('input')

  await expect(input).toBeFocused()
  await expect(input).toHaveValue('')
  await expect(palette).toContainText(T.searchPrompt)

  await input.fill('Cards')
  await expect(palette).toContainText(/Categories|Категории/)

  await input.fill('a')
  const viewport = palette.locator('.scrollerBlock')
  await expect(viewport).toBeVisible()
  const scrollMetrics = await viewport.evaluate(el => ({
    clientHeight: el.clientHeight,
    scrollHeight: el.scrollHeight,
  }))
  expect(scrollMetrics.scrollHeight).toBeGreaterThan(scrollMetrics.clientHeight)
  await viewport.evaluate((el) => {
    el.scrollTop = el.scrollHeight
  })
  await expect.poll(() => viewport.evaluate(el => el.scrollTop)).toBeGreaterThan(0)

  const historyGroup = palette.getByRole('group').filter({ hasText: /History|История/ })
  const transaction = historyGroup.getByRole('option').first()
  await expect(transaction).toBeVisible()
  await transaction.click({ button: 'right' })
  const editMenuItem = page.getByRole('menuitem', { name: /Edit|Редактировать/ })
  await expect(editMenuItem).toBeVisible()
  await editMenuItem.dispatchEvent('click')
  await expect(page.locator('.trnForm')).toBeVisible()
})

test.describe('mobile search sheet', () => {
  const mobile = devices['iPhone 13']
  test.use({
    deviceScaleFactor: mobile.deviceScaleFactor,
    hasTouch: mobile.hasTouch,
    isMobile: mobile.isMobile,
    userAgent: mobile.userAgent,
    viewport: mobile.viewport,
  })

  test('expands on upward drag and closes from a transaction drag', async ({ context, page }) => {
    await context.clearCookies()
    await page.goto('/login', { waitUntil: 'domcontentloaded' })
    await page.getByRole('button', { name: T.startDemo }).click()
    await page.waitForURL(/\/(dashboard|categories|wallets|stat)/, { timeout: 30_000 })

    const bottomNavigation = page.locator('.fixed.bottom-0.left-0.z-20')
    await bottomNavigation.locator('.mx-auto > div').last().click()
    const menuSheet = page.locator('.drag').last()
    await menuSheet.getByText(/^(Search|Поиск)$/).click()

    const palette = page.locator('[data-search-command-palette]')
    const sheet = page.locator('.drag').filter({ has: palette })
    await expect(palette).toBeVisible()
    await expect.poll(async () => (await sheet.boundingBox())?.y ?? 0)
      .toBeGreaterThan(mobile.viewport.height * 0.5)

    await palette.locator('input').fill('Oil change')
    const viewport = palette.locator('.scrollerBlock')
    await expect.poll(async () => (await sheet.boundingBox())?.y ?? 0)
      .toBeGreaterThan(mobile.viewport.height * 0.5)

    const historyGroup = palette.getByRole('group').filter({ hasText: /History|История/ })
    const transaction = historyGroup.getByRole('option').first()
    const transactionContent = transaction.locator('div').first()
    const collapsedBox = await transactionContent.boundingBox()
    expect(collapsedBox).not.toBeNull()
    const collapsedClientX = collapsedBox!.x + collapsedBox!.width / 2
    const collapsedStartY = collapsedBox!.y + collapsedBox!.height / 2

    await transactionContent.dispatchEvent('touchstart', {
      touches: [{ clientX: collapsedClientX, clientY: collapsedStartY, identifier: 1 }],
    })
    await transactionContent.dispatchEvent('touchmove', {
      touches: [{ clientX: collapsedClientX, clientY: collapsedStartY - 120, identifier: 1 }],
    })
    await transactionContent.dispatchEvent('touchend', {
      changedTouches: [{ clientX: collapsedClientX, clientY: collapsedStartY - 120, identifier: 1 }],
      touches: [],
    })

    await expect.poll(async () => (await sheet.boundingBox())?.y ?? 1000).toBeLessThan(40)
    await viewport.evaluate((el) => {
      el.scrollTop = 0
    })

    const expandedBox = await transactionContent.boundingBox()
    expect(expandedBox).not.toBeNull()
    const expandedClientX = expandedBox!.x + expandedBox!.width / 2
    const expandedStartY = expandedBox!.y + expandedBox!.height / 2

    await transactionContent.dispatchEvent('touchstart', {
      touches: [{ clientX: expandedClientX, clientY: expandedStartY, identifier: 2 }],
    })
    await transactionContent.dispatchEvent('touchmove', {
      touches: [{ clientX: expandedClientX, clientY: expandedStartY + 120, identifier: 2 }],
    })
    await transactionContent.dispatchEvent('touchend', {
      changedTouches: [{ clientX: expandedClientX, clientY: expandedStartY + 120, identifier: 2 }],
      touches: [],
    })

    await expect(palette).toHaveCount(0)
  })
})
