import { expect, test } from '@playwright/test'

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
