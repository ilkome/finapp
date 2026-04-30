import type { BrowserContext, Page } from '@playwright/test'

import { expect, test } from '@playwright/test'

const T = {
  apply: /^(Apply|Применить)$/,
  availableRoots: /Available root categories|Свободные корневые/,
  categoriesNav: /^(Categories|Категории)$/,
  childCategories: /^(Child categories|Дочерние категории)$/,
  fromAnotherParent: /Move from another parent|Переместить из другого родителя/,
  newCategoryHeading: /^(New category|Добавление категории|Создание категории)/,
  noChildren: /^(No children|Нет детей)$/,
  parentCategory: /^(Parent category|Родительская категория)$/,
  save: /^(Save|Сохранить)$/,
  selectedTwo: /(2 selected|Выбрано:?\s*2)/i,
  startDemo: /demo|демо/i,
  withoutParent: /^(Without parent|Без родителя)$/,
}

const PARENT_NAME = 'E2E Test Parent'

async function bootstrapDemo(page: Page, context: BrowserContext) {
  await context.clearCookies()
  await page.goto('/login', { waitUntil: 'domcontentloaded' })
  await page.getByRole('button', { name: T.startDemo }).click()
  await page.waitForURL(/\/(dashboard|categories|wallets|stat)/, { timeout: 30_000 })
  // Demo store hydrates synchronously, but debouncedPersist (300ms) flushes
  // localforage with a slight delay. Wait so that hard reloads (page.goto)
  // can re-hydrate the store from cache.
  await page.waitForTimeout(800)
}

async function openNewCategory(page: Page) {
  // Use SPA navigation: click "Categories" in sidebar, then "+" / "New" link.
  // Falls back to direct goto if sidebar links aren't reachable.
  await page.goto('/categories/new', { waitUntil: 'domcontentloaded' })
  // Form needs hydrated store; wait for either Parent or Children row to appear
  await Promise.race([
    page.getByText(T.parentCategory).first().waitFor({ state: 'visible', timeout: 15_000 }),
    page.getByText(T.childCategories).first().waitFor({ state: 'visible', timeout: 15_000 }),
  ]).catch(() => null)
}

test.describe('Categories children selector on /new', () => {
  test.beforeEach(async ({ context, page }) => {
    await bootstrapDemo(page, context)
  })

  test('Child categories row is visible for new category', async ({ page }) => {
    await openNewCategory(page)
    await expect(page.getByText(T.childCategories).first()).toBeVisible()
    await expect(page.getByText(T.noChildren).first()).toBeVisible()
  })

  test('opens modal with two candidate groups', async ({ page }) => {
    await openNewCategory(page)
    await page.getByText(T.childCategories).first().click()
    await expect(page.getByText(T.availableRoots).first()).toBeVisible()
    await expect(page.getByText(T.fromAnotherParent).first()).toBeVisible()
  })

  test('selects two children, saves and shows them under the new parent', async ({ page }) => {
    await openNewCategory(page)

    await page.getByText(T.childCategories).first().click()

    const candidates = page.locator('button[aria-pressed]')
    await expect(candidates.first()).toBeVisible()
    await candidates.nth(0).click()
    await candidates.nth(1).click()
    await expect(page.getByText(T.selectedTwo).first()).toBeVisible()

    const firstChildName = ((await candidates.nth(0).textContent()) ?? '').split('\n')[0]?.trim() ?? ''
    const secondChildName = ((await candidates.nth(1).textContent()) ?? '').split('\n')[0]?.trim() ?? ''
    expect(firstChildName).not.toBe('')
    expect(secondChildName).not.toBe('')

    await page.getByRole('button', { name: T.apply }).click()

    await expect(page.getByText(T.selectedTwo).first()).toBeVisible()
    await expect(page.getByText(T.parentCategory)).toHaveCount(0)

    await page.getByRole('textbox').first().fill(PARENT_NAME)
    await page.getByRole('button', { name: T.save }).click()
    // After save, New.vue redirects to the parent's detail page /categories/{id}.
    await page.waitForURL((url) => {
      const m = url.pathname.match(/\/categories\/([^/]+)$/)
      return !!m && m[1] !== 'new'
    }, { timeout: 10_000 })
    await page.waitForTimeout(600)

    // Verify the chosen children are listed under the new parent on the detail page.
    await expect(page.getByText(firstChildName).first()).toBeVisible()
    await expect(page.getByText(secondChildName).first()).toBeVisible()
  })

  test('hides Child categories row when a parent is selected', async ({ page }) => {
    await openNewCategory(page)
    await expect(page.getByText(T.childCategories).first()).toBeVisible()

    await page.getByText(T.parentCategory).first().click()

    // Demo seeds always include "Entertainment" as a root with children but no own trns,
    // so it appears in categoriesForBeParent. Click it inside the bottom sheet.
    const sheet = page.locator('.bottomSheetContent').last()
    const target = sheet.getByText(/^(Entertainment|Развлечения)$/).first()
    // Selecting a parent closes the sheet automatically (onParentSelect → close()).
    await target.click()

    await expect(page.getByText(T.childCategories)).toHaveCount(0)
  })
})
