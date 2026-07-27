import type { CategoryId } from '~/components/categories/types'
import type { TrnId } from '~/components/trns/types'

import { useTrnsStore } from '~/components/trns/useTrnsStore'

// Modal state: 'quickView' shows snapshot trnsIds, 'fullTrns' shows reactive selectedAndFilteredTrnsIds
export function useTrnsQuickView(selectedAndFilteredTrnsIds: ComputedRef<TrnId[]>) {
  const trnsStore = useTrnsStore()

  const modalSource = ref<'fullTrns' | 'quickView' | null>(null)
  const quickViewTrnsIds = ref<TrnId[]>([])
  const modalTrnsIds = computed(() => {
    if (modalSource.value === 'quickView')
      return quickViewTrnsIds.value
    if (modalSource.value === 'fullTrns')
      return selectedAndFilteredTrnsIds.value
    return []
  })

  function closeModal() {
    modalSource.value = null
    quickViewTrnsIds.value = []
  }

  function openQuickViewForCategory(categoryId: CategoryId) {
    quickViewTrnsIds.value = trnsStore.getStoreTrnsIds({
      categoriesIds: [categoryId],
      sort: true,
      trnsIds: selectedAndFilteredTrnsIds.value,
    })
    modalSource.value = 'quickView'
  }

  function openFullTrns() {
    modalSource.value = 'fullTrns'
  }

  return {
    closeModal,
    modalSource,
    modalTrnsIds,
    openFullTrns,
    openQuickViewForCategory,
  }
}
