import type { MaybeRefOrGetter } from 'vue'

import type { CategoryWithData } from '~/components/stat/types'

import { useCategoriesStore } from '~/components/categories/useCategoriesStore'
import { useCurrenciesStore } from '~/components/currencies/useCurrenciesStore'
import { buildStatCategoryRows } from '~/components/stat/categories/rows'
import { useCategoryQuickAdd } from '~/components/stat/categories/useCategoryQuickAdd'

/** Everything a category section needs to feed a pure list view. */
export function useStatCategoryRows(items: MaybeRefOrGetter<CategoryWithData[]>) {
  const categoriesStore = useCategoriesStore()
  const currenciesStore = useCurrenciesStore()
  const { openFormForCategory } = useCategoryQuickAdd()
  const rows = computed(() => buildStatCategoryRows(toValue(items), categoriesStore.getWithParent))

  return { currencyCode: computed(() => currenciesStore.base), openFormForCategory, rows }
}
