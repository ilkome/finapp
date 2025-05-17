import type { Categories, CategoryId, CategoryItem } from '~/components/categories/types'

import { random } from '~/assets/js/emo'
import icons from '~/assets/js/icons'
import { colorsArray } from '~/components/color/colors'

export function getTransactibleCategoriesIds(items: Categories, ids?: CategoryId[]) {
  return (ids ?? Object.keys(items ?? [])).reduce((acc, id) => {
    const category = items?.[id]
    if (category?.parentId === 0 && category?.childIds?.length) {
      acc.push(...category.childIds.filter(childId => !acc.includes(childId)))
    }
    else if (!acc.includes(id)) {
      acc.push(id)
    }
    return acc
  }, [] as CategoryId[])
}

export function getTransferCategoriesIds(items: Categories): CategoryId[] {
  const names = ['перевод', 'transfer']
  return [
    ...Object.keys(items ?? {})
      .filter(id => names.includes(`${items[id]?.name}`.toLowerCase())),
  ]
}

export function getParentCategory(items: Categories, parentId: CategoryId | 0): CategoryItem | false {
  if (parentId === 0)
    return false

  return items[parentId] ?? false
}

export function getParentCategoryIdOrReturnSame(items: Categories, categoryId: CategoryId): CategoryId {
  const category = items[categoryId]
  if (!category || category.parentId === 0)
    return categoryId
  return category.parentId ?? categoryId
}

export function getParentCategoryId2(items: Categories, categoryId: CategoryId): CategoryId | undefined {
  const category = items[categoryId]
  return category?.parentId === 0 ? undefined : category?.parentId
}

export function compareCategoriesByParentAndName(a: CategoryItem, b: CategoryItem, items: Categories): number {
  const parentNameA = items[a.parentId]?.name || ''
  const parentNameB = items[b.parentId]?.name || ''
  return parentNameA.localeCompare(parentNameB) || a.name.localeCompare(b.name)
}

export function getPreparedFormData(values?: any): CategoryItem {
  return {
    color: values?.color ?? random(colorsArray),
    icon: values?.icon ?? random(random(icons)),
    name: values?.name ?? '',
    order: values?.order ?? 1,
    parentId: values?.parentId ?? 0,
    showInLastUsed: values?.showInLastUsed ?? true,
    showInQuickSelector: values?.showInQuickSelector ?? false,
  }
}
