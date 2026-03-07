import type { CategoryId } from '~/components/categories/types'
import type { CategoryWithData } from '~/components/stat/types'
import type { TrnId } from '~/components/trns/types'

import { useAmount } from '~/components/amount/useAmount'
import { useCategoriesStore } from '~/components/categories/useCategoriesStore'
import { collectCategoriesByTrns, flattenCategoriesWithValues, groupCategoriesWithValues } from '~/components/stat/categories/collectAndGroup'
import { useTrnsStore } from '~/components/trns/useTrnsStore'

export function useStatCategories() {
  const categoriesStore = useCategoriesStore()
  const trnsStore = useTrnsStore()
  const { getTotalOfTrnsIds } = useAmount()

  const computeValue = (trnsIds: TrnId[]) => getTotalOfTrnsIds(trnsIds).sum

  function getCategoriesWithData(trnsIds: TrnId[], isGrouped?: boolean, preCategoriesIds?: CategoryId[]): CategoryWithData[] {
    const collected = collectCategoriesByTrns({
      categoriesItems: categoriesStore.items,
      preCategoriesIds,
      trnsIds,
      trnsItems: trnsStore.items ?? {},
    })

    return isGrouped
      ? groupCategoriesWithValues(collected, categoriesStore.items, computeValue)
      : flattenCategoriesWithValues(collected, computeValue)
  }

  return {
    getCategoriesWithData,
  }
}
