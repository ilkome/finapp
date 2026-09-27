import { z } from 'zod/v4'

import type { Categories, CategoryId, CategoryItem } from '~/components/categories/types'

const LOAN_CATEGORY_IDS = new Set(['loanInterest', 'loanFine'])

export function isLoanCategoryId(id?: CategoryId | null): boolean {
  return !!id && LOAN_CATEGORY_IDS.has(id)
}

/**
 * Reserved ids are synthetic categories injected by the store, never real rows: always root,
 * never deleted, never parents. Only name, color and icon are editable, through per-user
 * overrides. 'loanInterest'/'loanFine' are reserved but not system: they are ordinary
 * expenses and count in statistics.
 */
const RESERVED_CATEGORY_IDS = new Set(['transfer', 'adjustment', ...LOAN_CATEGORY_IDS])

export function isReservedCategoryId(id?: CategoryId | null): boolean {
  return !!id && RESERVED_CATEGORY_IDS.has(id)
}

const categoryOverrideSchema = z.object({
  color: z.string().optional().catch(undefined),
  icon: z.string().trim().min(1).optional().catch(undefined),
  name: z.string().trim().min(1).optional().catch(undefined),
})

export type CategoryOverride = z.infer<typeof categoryOverrideSchema>
export type CategoryOverrides = Partial<Record<CategoryId, CategoryOverride>>

/** Tolerant read of the stored map (JSON text from SQLite or an object): bad entries are dropped, never thrown. */
export function parseCategoryOverrides(raw: unknown): CategoryOverrides {
  let value = raw
  if (typeof raw === 'string') {
    try {
      value = JSON.parse(raw)
    }
    catch {
      return {}
    }
  }
  if (!value || typeof value !== 'object' || Array.isArray(value))
    return {}

  const result: CategoryOverrides = {}
  for (const [id, entry] of Object.entries(value)) {
    if (!isReservedCategoryId(id))
      continue
    const parsed = categoryOverrideSchema.safeParse(entry)
    if (parsed.success)
      result[id] = parsed.data
  }
  return result
}

/** The reserved categories as the user sees them: localized defaults with their overrides on top. */
export function applyCategoryOverrides(
  defaults: Record<CategoryId, CategoryItem>,
  overrides: CategoryOverrides,
): Record<CategoryId, CategoryItem> {
  const result: Record<CategoryId, CategoryItem> = {}
  for (const [id, base] of Object.entries(defaults)) {
    const override = overrides[id]
    const item = { ...base }
    if (override?.name)
      item.name = override.name
    if (override?.color !== undefined)
      item.color = override.color
    if (override?.icon)
      item.icon = override.icon
    result[id] = item
  }
  return result
}

/**
 * Only the fields that differ from the default. A name equal to the localized default is not
 * stored, so it keeps following the app language.
 */
export function toCategoryOverride(values: CategoryItem, base: CategoryItem): CategoryOverride | undefined {
  const override: CategoryOverride = {}
  const name = values.name.trim()
  if (name && name !== base.name)
    override.name = name
  if (values.color !== base.color)
    override.color = values.color
  if (values.icon && values.icon !== base.icon)
    override.icon = values.icon
  return Object.keys(override).length ? override : undefined
}

/**
 * System categories are synthetic (not real user rows): 'transfer' holds wallet
 * transfers, 'adjustment' holds balance corrections. Their transactions are kept
 * out of category lists, quick selectors and statistics; they surface only in the
 * transactions list under their own tabs.
 */
export function isSystemCategoryId(id?: CategoryId | null): boolean {
  return id === 'transfer' || id === 'adjustment'
}

export function getTransactibleCategoriesIds(items: Categories, ids?: CategoryId[]) {
  if (!items)
    return []

  const childrenMap = new Map<CategoryId, CategoryId[]>()
  for (const id of Object.keys(items)) {
    const parentId = items[id]?.parentId
    if (parentId) {
      const pid = String(parentId)
      if (!childrenMap.has(pid))
        childrenMap.set(pid, [])
      childrenMap.get(pid)!.push(id)
    }
  }

  const seen = new Set<CategoryId>()
  const result: CategoryId[] = []

  for (const id of ids ?? Object.keys(items)) {
    const category = items[id]
    const children = childrenMap.get(id)
    if (category?.parentId === 0 && children?.length) {
      for (const childId of children) {
        if (!seen.has(childId)) {
          seen.add(childId)
          result.push(childId)
        }
      }
    }
    else if (!seen.has(id)) {
      seen.add(id)
      result.push(id)
    }
  }

  return result
}

/**
 * All descendant category ids of `categoryId` (children, grandchildren, ...), excluding itself.
 * Aggregates a parent category's subtree. Builds a parent->children map once,
 * then walks it iteratively so a deep or (defensively) cyclic tree can't recurse unbounded.
 */
export function getDescendantIds(items: Categories, categoryId: CategoryId): CategoryId[] {
  if (!items)
    return []

  const childrenMap = new Map<CategoryId, CategoryId[]>()
  for (const id of Object.keys(items)) {
    const parentId = items[id]?.parentId
    if (parentId) {
      const pid = String(parentId)
      if (!childrenMap.has(pid))
        childrenMap.set(pid, [])
      childrenMap.get(pid)!.push(id)
    }
  }

  const result: CategoryId[] = []
  const seen = new Set<CategoryId>()
  const stack = [...(childrenMap.get(String(categoryId)) ?? [])]
  while (stack.length) {
    const id = stack.pop()!
    if (seen.has(id))
      continue
    seen.add(id)
    result.push(id)
    const kids = childrenMap.get(String(id))
    if (kids)
      stack.push(...kids)
  }

  return result
}

/** `categoryId` plus all its descendants. */
export function getCategorySubtreeIds(items: Categories, categoryId: CategoryId): CategoryId[] {
  return [categoryId, ...getDescendantIds(items, categoryId)]
}

export function getParentCategoryIdOrReturnSame(items: Categories, categoryId: CategoryId): CategoryId {
  const category = items[categoryId]
  if (!category || category.parentId === 0)
    return categoryId
  return category.parentId ?? categoryId
}

export function getParentCategoryIdOrUndefined(items: Categories, categoryId: CategoryId): CategoryId | undefined {
  const category = items[categoryId]
  return category?.parentId === 0 ? undefined : category?.parentId
}

export function compareCategoriesByParentAndName(a: CategoryItem, b: CategoryItem, items: Categories): number {
  const parentNameA = items[a.parentId]?.name ?? ''
  const parentNameB = items[b.parentId]?.name ?? ''
  return parentNameA.localeCompare(parentNameB) || a.name.localeCompare(b.name)
}

/** Reserved categories always sort after the user's own. */
export function compareCategoryIds(idA: CategoryId, idB: CategoryId, items: Categories): number {
  const catA = items[idA]
  const catB = items[idB]
  if (!catA || !catB)
    return 0
  return Number(isReservedCategoryId(idA)) - Number(isReservedCategoryId(idB))
    || compareCategoriesByParentAndName(catA, catB, items)
}

export function computeChildrenDiff(prev: CategoryId[], next: CategoryId[]): { added: CategoryId[], removed: CategoryId[] } {
  const prevSet = new Set(prev)
  const nextSet = new Set(next)
  return {
    added: next.filter(id => !prevSet.has(id)),
    removed: prev.filter(id => !nextSet.has(id)),
  }
}
