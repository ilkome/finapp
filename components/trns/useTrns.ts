import type { TrnsGetterProps } from '~/components/trns/types'
import { getTransactibleCategoriesIds } from '~/components/categories/getCategories'
import { getTrnsIds } from '~/components/trns/getTrns'
import { useCategoriesStore } from '~/components/categories/useCategories'
import { useFilter } from '~/components/filter/useFilter'
import { useTrnsStore } from '~/components/trns/useTrnsStore'

export default function useTrns() {
  const filterStore = useFilter()
  const categoriesStore = useCategoriesStore()
  const trnsStore = useTrnsStore()

  const allTrnsIdsWithFilter = computed(() => {
    const categoriesIds = filterStore.catsIds.length > 0
      ? getTransactibleCategoriesIds(filterStore.catsIds, categoriesStore.items)
      : false
    const walletsIds = filterStore.walletsIds.length > 0
      ? filterStore.walletsIds
      : false

    return getTrnsIds({
      categoriesIds,
      walletsIds,
      trnsItems: trnsStore.items,
    })
  })

  function getStoreTrnsIds(props: Omit<TrnsGetterProps, 'trnsItems'>) {
    return getTrnsIds({
      ...props,
      trnsItems: trnsStore.items,
    })
  }

  return {
    allTrnsIdsWithFilter,
    getStoreTrnsIds,
  }
}
