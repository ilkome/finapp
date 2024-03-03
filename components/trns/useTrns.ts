import { useFilter } from '~/components/filter/useFilter'
import { getTrnsIds } from '~/components/trns/getTrns'
import { getTransactibleCategoriesIds } from '~/components/categories/getCategories'
import { useCategoriesStore } from '~/components/categories/useCategories'
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

  return {
    allTrnsIdsWithFilter,
  }
}
