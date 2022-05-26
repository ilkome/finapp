import { getCategoriesIds } from '~/components/categories/getCategories'
import { getTrnsIds } from '~/components/trns/getTrns'

export default function useTrns() {
  const { $store } = useNuxtApp()

  const allTrnsIdsWithFilter = computed(() => {
    const categoriesItems = computed(() => $store.state.categories.items)
    const trnsItems = computed(() => $store.state.trns.items)
    const storeFilter = computed(() => $store.state.filter)

    // TODO: move it to a separate function getFilterParams
    const categoriesIds = storeFilter.value.catsIds.length > 0
      ? getCategoriesIds(storeFilter.value.catsIds, categoriesItems.value)
      : null
    const walletsIds = storeFilter.value.walletsIds.length > 0
      ? storeFilter.value.walletsIds
      : null

    return getTrnsIds({
      categoriesIds,
      walletsIds,
      trnsItems: trnsItems.value,
    })
  })

  return {
    allTrnsIdsWithFilter,
  }
}
