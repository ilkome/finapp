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
})
