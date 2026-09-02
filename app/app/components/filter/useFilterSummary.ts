import type { CategoryId } from '~/components/categories/types'

import { useCategoriesStore } from '~/components/categories/useCategoriesStore'
import { filterKey } from '~/components/filter/injectionKeys'

/**
 * Human summary of the active stat filter, plus the rolled-up category list it
 * counts. A parent whose every child is selected collapses to one entry, so
 * "all children of X" reads as one category, not N - shared with the chip view.
 */
export function useFilterSummary() {
  const { t } = useI18n()
  const filter = inject(filterKey)!
  const categoriesStore = useCategoriesStore()

  const displayCategoryIds = computed<CategoryId[]>(() => {
    const selected = new Set(filter.categoriesIds.value)
    if (!selected.size)
      return []

    const consumed = new Set<CategoryId>()
    const result: CategoryId[] = []

    for (const rootId of categoriesStore.categoriesRootIds) {
      const children = categoriesStore.getChildrenIds(rootId)
      if (children.length && children.every(id => selected.has(id))) {
        result.push(rootId)
        children.forEach(id => consumed.add(id))
      }
    }

    for (const id of filter.categoriesIds.value) {
      if (!consumed.has(id))
        result.push(id)
    }

    return result
  })

  const summaryText = computed(() => {
    const walletsCount = filter.canFilterWallets ? filter.walletsIds.value.length : 0
    const categoriesCount = filter.canFilterCategories ? displayCategoryIds.value.length : 0

    const capitalize = (text: string) => text.charAt(0).toUpperCase() + text.slice(1)

    if (!filter.canFilterCategories) {
      return capitalize(walletsCount
        ? t('base.filterWalletsWord', walletsCount)
        : t('base.filterAllWallets'))
    }

    if (!filter.canFilterWallets) {
      return capitalize(categoriesCount
        ? t('base.filterCategoriesWord', categoriesCount)
        : t('base.filterAllCategories'))
    }

    if (!walletsCount && !categoriesCount)
      return t('base.filterSummaryAll')

    const wallets = walletsCount
      ? t('base.filterWalletsWord', walletsCount)
      : t('base.filterAllWallets')
    const categories = categoriesCount
      ? t('base.filterCategoriesWord', categoriesCount)
      : t('base.filterAllCategories')

    const text = t('base.filterSummary', { categories, wallets })
    return capitalize(text)
  })

  return { displayCategoryIds, summaryText }
}
