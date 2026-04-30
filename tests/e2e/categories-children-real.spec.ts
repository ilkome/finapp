import type { Page } from '@playwright/test'

import { expect, test } from '@playwright/test'
import { existsSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const dirname = path.dirname(fileURLToPath(import.meta.url))

const T = {
  apply: /^(Apply|Применить)$/,
  cancel: /^(Cancel|Отмена|Отменить)$/,
  childCategories: /^(Child categories|Дочерние категории)$/,
  // LayoutConfirmModal uses base.delete for the destructive action
  confirm: /^(Delete|Удалить)$/,
  parentCategory: /^(Parent category|Родительская категория)$/,
  save: /^(Save|Сохранить)$/,
  search: /(Search categories|Поиск категорий)/i,
  selectedAny: /(\d+ selected|Выбрано:?\s*\d+)/i,
}

const authFile = path.join(dirname, '.auth', 'user.json')

function uniqueName(suffix: string) {
  const stamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)
  return `E2E_${suffix}_${stamp}_${Math.random().toString(36).slice(2, 5)}`
}

async function waitForCategoryFormReady(page: Page) {
  // Form is ready when the Save button appears (always present once the form mounts)
  await page.getByRole('button', { name: T.save }).first().waitFor({
    state: 'visible',
    timeout: 30_000,
  })
}

async function openChildrenModal(page: Page) {
  const row = page.getByText(T.childCategories).first()
  await expect(row).toBeVisible({ timeout: 10_000 })
  await row.click()
  await expect(page.locator('button[aria-pressed]').first()).toBeVisible({ timeout: 10_000 })
}

function candidateRows(page: Page) {
  return page.locator('button[aria-pressed]')
}

async function getCandidateName(row: ReturnType<Page['locator']>) {
  // Each candidate row has nested divs: [checkbox, icon, [name, currently-in]].
  // Grab the first .truncate (the name) only.
  const nameEl = row.locator('div.truncate').first()
  const text = (await nameEl.textContent()) ?? ''
  return text.trim()
}

async function selectFirstNCandidates(page: Page, n: number): Promise<string[]> {
  const rows = candidateRows(page)
  const total = await rows.count()
  const picked: string[] = []
  for (let i = 0; i < Math.min(n, total); i++) {
    const row = rows.nth(i)
    const name = await getCandidateName(row)
    await row.click()
    picked.push(name)
  }
  return picked
}

async function applyModal(page: Page) {
  // Bottom-anchored buttons sometimes get covered by the Nuxt devtools toolbar
  // in the headed dev server. Force-click bypasses the actionability check.
  await page.getByRole('button', { name: T.apply }).click({ force: true })
}

async function saveCategory(page: Page) {
  await page.getByRole('button', { name: T.save }).click({ force: true })
}

/**
 * Create a fresh parent on /categories/new with N existing categories chosen as children.
 * Returns the parent name, child names, and the freshly assigned Convex id (from URL).
 */
async function createParentWithChildren(page: Page, suffix: string, childCount = 2) {
  const name = uniqueName(suffix)
  await page.goto('/categories/new')
  await waitForCategoryFormReady(page)
  await openChildrenModal(page)
  const children = await selectFirstNCandidates(page, childCount)
  await applyModal(page)

  await page.getByRole('textbox').first().fill(name)
  await saveCategory(page)
  // After save, New.vue redirects to /categories/{id}. Wait for the post-redirect URL.
  await page.waitForURL((url) => {
    const m = url.pathname.match(/\/categories\/([^/]+)$/)
    return !!m && m[1] !== 'new'
  }, { timeout: 15_000 })
  const url = page.url()
  const id = url.split('/').pop()!
  expect(id).toBeTruthy()
  expect(id).not.toBe('new')
  // setChildren mutation runs asynchronously after create resolves.
  await page.waitForTimeout(2500)
  return { children, id, name }
}

async function gotoEdit(page: Page, parentId: string) {
  await page.goto(`/categories/${parentId}/edit`, { waitUntil: 'domcontentloaded' })
  await page.getByRole('button', { name: T.save }).first().waitFor({
    state: 'visible',
    timeout: 30_000,
  })
}

async function selectedNamesInModal(page: Page): Promise<string[]> {
  const rows = candidateRows(page)
  const total = await rows.count()
  const out: string[] = []
  for (let i = 0; i < total; i++) {
    const row = rows.nth(i)
    if (await row.getAttribute('aria-pressed') === 'true')
      out.push(await getCandidateName(row))
  }
  return out
}

test.describe.configure({ timeout: 120_000 })

test.describe('Categories children — real backend', () => {
  test.use({ actionTimeout: 15_000, navigationTimeout: 30_000 })

  test.beforeEach(async ({ context, page }) => {
    if (!existsSync(authFile))
      test.skip(true, `Run 'pnpm test:e2e:auth' first to save real-user auth state.`)
    // Hide Nuxt devtools toolbar/frame — it intercepts clicks on bottom-anchored
    // buttons (Apply / Save) inside bottom sheets.
    await context.addInitScript(() => {
      const css = `
        nuxt-devtools-frame,
        nuxt-devtools-anchor,
        nuxt-devtools-container,
        #nuxt-devtools-container,
        [data-v-inspector-ignore="true"] { display: none !important; pointer-events: none !important; }
      `
      const apply = () => {
        if (!document.head)
          return
        const id = '__e2e_hide_devtools__'
        if (document.getElementById(id))
          return
        const style = document.createElement('style')
        style.id = id
        style.textContent = css
        document.head.appendChild(style)
      }
      apply()
      new MutationObserver(apply).observe(document.documentElement, { childList: true, subtree: true })
    })
    await page.context()
  })

  test('creates new parent with two children', async ({ page }) => {
    const { children, id, name } = await createParentWithChildren(page, 'create', 2)
    expect(children).toHaveLength(2)
    expect(id).toBeTruthy()
    // After save we land on /categories/{id} (detail page). The detail page
    // lists the parent's children. Verify they appear there directly.
    for (const child of children)
      await expect(page.getByText(child).first()).toBeVisible({ timeout: 10_000 })
    // Page title reflects the parent's name
    expect(await page.title()).toContain(name)
  })

  test('edit: adds another child to existing parent', async ({ page }) => {
    const { children, id } = await createParentWithChildren(page, 'add', 2)

    await gotoEdit(page, id)
    await openChildrenModal(page)

    // Pick first non-pressed candidate that's not already a child
    const rows = candidateRows(page)
    const total = await rows.count()
    let added = ''
    for (let i = 0; i < total; i++) {
      const row = rows.nth(i)
      if (await row.getAttribute('aria-pressed') === 'true')
        continue
      const candidateName = await getCandidateName(row)
      if (children.includes(candidateName))
        continue
      await row.click()
      added = candidateName
      break
    }
    expect(added, 'No additional candidate available to add').not.toBe('')

    await applyModal(page)
    await saveCategory(page)
    await page.waitForURL((url) => {
      const m = url.pathname.match(/\/categories\/([^/]+)$/)
      return !!m && m[1] !== 'new'
    }, { timeout: 15_000 })
    await page.waitForTimeout(2500)

    // Reopen edit, verify the new child is now selected
    await gotoEdit(page, id)
    await openChildrenModal(page)
    const selected = await selectedNamesInModal(page)
    expect(selected).toContain(added)
    for (const original of children)
      expect(selected).toContain(original)
  })

  test('edit: removes single child without confirm dialog', async ({ page }) => {
    const { children, id } = await createParentWithChildren(page, 'remove1', 2)

    await gotoEdit(page, id)
    await openChildrenModal(page)

    const rows = candidateRows(page)
    const total = await rows.count()
    let removed = ''
    for (let i = 0; i < total; i++) {
      const row = rows.nth(i)
      if (await row.getAttribute('aria-pressed') !== 'true')
        continue
      removed = await getCandidateName(row)
      await row.click()
      break
    }
    expect(removed, 'No selected child to remove').not.toBe('')

    // Single removal should NOT trigger the confirm dialog
    await applyModal(page)
    await expect(page.getByRole('button', { name: T.confirm })).toHaveCount(0)

    await saveCategory(page)
    await page.waitForURL((url) => {
      const m = url.pathname.match(/\/categories\/([^/]+)$/)
      return !!m && m[1] !== 'new'
    }, { timeout: 15_000 })
    await page.waitForTimeout(2500)

    await gotoEdit(page, id)
    await openChildrenModal(page)
    const selected = await selectedNamesInModal(page)
    expect(selected).not.toContain(removed)
    const stillThere = children.find(c => c !== removed)
    if (stillThere)
      expect(selected).toContain(stillThere)
  })

  test('edit: removing two children opens confirm dialog and applies on confirm', async ({ page }) => {
    const { children, id } = await createParentWithChildren(page, 'confirm', 2)

    await gotoEdit(page, id)
    await openChildrenModal(page)

    // Uncheck all selected (≥2)
    const rows = candidateRows(page)
    const total = await rows.count()
    let unchecked = 0
    for (let i = 0; i < total; i++) {
      const row = rows.nth(i)
      if (await row.getAttribute('aria-pressed') !== 'true')
        continue
      await row.click()
      unchecked++
    }
    expect(unchecked).toBeGreaterThanOrEqual(2)

    await applyModal(page)

    const confirmBtn = page.getByRole('button', { name: T.confirm }).first()
    await expect(confirmBtn).toBeVisible({ timeout: 5_000 })
    await confirmBtn.click()

    await saveCategory(page)
    await page.waitForURL((url) => {
      const m = url.pathname.match(/\/categories\/([^/]+)$/)
      return !!m && m[1] !== 'new'
    }, { timeout: 15_000 })
    await page.waitForTimeout(2500)

    await gotoEdit(page, id)
    // After full removal there may be no children candidates / no row at all.
    if (await page.getByText(T.childCategories).count() > 0) {
      await openChildrenModal(page)
      const selected = await selectedNamesInModal(page)
      for (const original of children)
        expect(selected).not.toContain(original)
    }
  })

  test('edit: cancelling confirm dialog reverts removal', async ({ page }) => {
    const { children, id } = await createParentWithChildren(page, 'cancelConfirm', 2)

    await gotoEdit(page, id)
    await openChildrenModal(page)

    // Uncheck all selected (≥2 → triggers confirm)
    const rows = candidateRows(page)
    const total = await rows.count()
    for (let i = 0; i < total; i++) {
      const row = rows.nth(i)
      if (await row.getAttribute('aria-pressed') === 'true')
        await row.click()
    }

    await applyModal(page)

    const cancelBtn = page.getByRole('button', { name: T.cancel }).first()
    await expect(cancelBtn).toBeVisible({ timeout: 5_000 })
    await cancelBtn.click()

    // Children modal stays open; selection should revert to the original set.
    await page.waitForTimeout(500)
    const selected = await selectedNamesInModal(page)
    for (const original of children)
      expect(selected).toContain(original)
  })

  test('children modal search filters candidate list', async ({ page }) => {
    await page.goto('/categories/new')
    await waitForCategoryFormReady(page)
    await openChildrenModal(page)

    const rows = candidateRows(page)
    const totalBefore = await rows.count()
    expect(totalBefore).toBeGreaterThan(0)

    const firstName = await getCandidateName(rows.nth(0))
    expect(firstName).not.toBe('')
    const queryStem = firstName.slice(0, Math.min(3, firstName.length)).toLowerCase()

    await page.getByPlaceholder(T.search).fill(queryStem)
    await page.waitForTimeout(300)

    const totalAfter = await candidateRows(page).count()
    expect(totalAfter).toBeGreaterThan(0)
    expect(totalAfter).toBeLessThanOrEqual(totalBefore)

    for (let i = 0; i < totalAfter; i++) {
      const row = candidateRows(page).nth(i)
      const haystack = ((await row.textContent()) ?? '').toLowerCase()
      expect(haystack).toContain(queryStem)
    }
  })

  test('children modal search shows no-matches state', async ({ page }) => {
    await page.goto('/categories/new')
    await waitForCategoryFormReady(page)
    await openChildrenModal(page)

    await page.getByPlaceholder(T.search).fill('zzzzzzz_no_such_category')
    await page.waitForTimeout(300)

    expect(await candidateRows(page).count()).toBe(0)
  })

  test('selecting a parent on /new hides Child categories row', async ({ page }) => {
    await page.goto('/categories/new')
    await waitForCategoryFormReady(page)
    await expect(page.getByText(T.childCategories).first()).toBeVisible()

    await page.getByText(T.parentCategory).first().click()
    // Bottom sheet shows "Without parent" chip + parent candidates list.
    // Click the first non-"Without parent" link inside the open sheet.
    const sheet = page.locator('.bottomSheetContent').last()
    const candidateLinks = sheet.locator('a, [role="link"]')
    const count = await candidateLinks.count()
    expect(count).toBeGreaterThan(0)
    await candidateLinks.first().click()

    await expect(page.getByText(T.childCategories)).toHaveCount(0)
  })
})
