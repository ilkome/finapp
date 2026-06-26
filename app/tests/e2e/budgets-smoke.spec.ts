import type { BrowserContext, Page } from '@playwright/test'

import { expect, test } from '@playwright/test'

// Core budget lifecycle smoke (demo mode): create -> per-period override -> move money -> archive,
// plus the recurrences page render. Guards the Page/Item/Form/sheet rebuilds (M0-M5).
const T = {
  addBudget: /^(Add budget|Добавить бюджет)$/,
  addRecurring: /Add recurring|Добавить повторение/,
  amountPlaceholder: /Amount per|Сумма на/i,
  archive: /^(Archive|В архив)$/,
  archived: /^(Archived|Архив)/,
  assigned: /Assigned|Назначено/i,
  moveAction: /Move money|Переместить/,
  save: /^(Save|Сохранить)$/,
  selectCategory: /Select category|Выбрать категорию/,
  startDemo: /demo|демо/i,
  whole: /Whole|Вся|Весь/i,
}

async function bootstrapDemo(page: Page, context: BrowserContext) {
  await context.clearCookies()
  await page.goto('/login', { waitUntil: 'domcontentloaded' })
  await page.getByRole('button', { name: T.startDemo }).click()
  await page.waitForURL(/\/(dashboard|categories|wallets|stat)/, { timeout: 30_000 })
  await page.waitForTimeout(800)
}

// Pick a category in the budget form. Parents reveal a "Whole «X»" button; leaves select on click.
async function pickCategory(page: Page, name: RegExp) {
  await page.getByText(T.selectCategory).click()
  const sheet = page.locator('.bottomSheetContent').last()
  await sheet.getByText(name).first().click()
  await page.getByRole('button', { name: T.whole }).first().click({ timeout: 1500 }).catch(() => {})
}

async function createBudget(page: Page, category: RegExp, amount: string) {
  await page.getByRole('button', { name: T.addBudget }).first().click()
  await pickCategory(page, category)
  await page.getByPlaceholder(T.amountPlaceholder).fill(amount)
  await page.getByRole('button', { name: T.save }).click()
  await page.waitForTimeout(400)
}

test.describe('Budgets & recurrences smoke', () => {
  test('create -> override assigned -> move money -> archive', async ({ context, page }) => {
    const errors: string[] = []
    page.on('pageerror', e => errors.push(e.message))

    await bootstrapDemo(page, context)
    await page.goto('/budgets', { waitUntil: 'domcontentloaded' })
    await expect(page.getByRole('button', { name: T.addBudget }).first()).toBeVisible({ timeout: 15_000 })

    // Two expense budgets: a destination (Food, overspends in demo) and a source (Entertainment).
    await createBudget(page, /^(Food|Еда)$/, '500')
    await expect(page.getByText(/^(Food|Еда)$/).first()).toBeVisible()
    await createBudget(page, /^(Entertainment|Развлечения)$/, '1000')

    const foodRow = page.locator('.bg-elevated.interactive').filter({ hasText: /Food|Еда/ }).first()

    // Per-period override: tap "Assigned", set a distinctive amount, save; the row reflects it.
    await page.getByRole('button', { name: T.assigned }).first().click()
    await page.locator('input[inputmode=decimal]').first().fill('777')
    await page.getByRole('button', { name: T.save }).first().click()
    await expect(foodRow).toContainText(/777/)

    // Move money: open the destination's menu, fill an amount in the sheet, confirm.
    await foodRow.click({ button: 'right' })
    await page.getByRole('menuitem', { name: T.moveAction }).click()
    const sheet = page.locator('.bottomSheetContent').last()
    await sheet.getByRole('spinbutton').first().fill('100')
    await sheet.getByRole('button', { name: T.moveAction }).click()
    await page.waitForTimeout(400)

    // Archive: the budget leaves the active list and joins the Archived group.
    await foodRow.click({ button: 'right' })
    await page.getByRole('menuitem', { name: T.archive }).click()
    await expect(page.getByText(T.archived).first()).toBeVisible()

    expect(errors).toEqual([])
  })

  test('recurrences page mounts with its create affordance', async ({ context, page }) => {
    const errors: string[] = []
    page.on('pageerror', e => errors.push(e.message))

    await bootstrapDemo(page, context)
    await page.goto('/recurrences', { waitUntil: 'domcontentloaded' })

    // The rebuilt page mounts cleanly; demo seeds no recurrences, so the empty state + CTA show.
    // (The populated Upcoming timeline is exercised in the real-backend/manual verification.)
    await expect(page.getByRole('button', { name: T.addRecurring }).first()).toBeVisible({ timeout: 15_000 })
    await expect(page.getByText(/No recurring transactions yet|Пока нет регулярных операций/).first()).toBeVisible()

    expect(errors).toEqual([])
  })
})
