import type { ComputedRef } from 'vue'

import { useStorage } from '@vueuse/core'

import type { CategoryId } from '~/components/categories/types'

type CategoryState = { show: boolean }
type CategoriesState = Record<CategoryId, CategoryState>

export function useCategoriesExpanded(
  storageKey: string,
  currentIds: ComputedRef<CategoryId[]>,
) {
  const expandedState = useStorage<CategoriesState>(
    `categoriesOpened:${storageKey}`,
    {} as CategoriesState,
  )

  const isAllExpanded = computed(() =>
    currentIds.value.length > 0
    && currentIds.value.every(id => expandedState.value[id]?.show),
  )
  const isAnyExpanded = computed(() =>
    currentIds.value.some(id => expandedState.value[id]?.show),
  )

  const folderIcon = computed(() => {
    if (isAllExpanded.value)
      return 'lucide:folder-open'
    if (isAnyExpanded.value)
      return 'lucide:folder-open-dot'
    return 'lucide:folder'
  })

  function toggleAll() {
    const newShow = !isAnyExpanded.value
    for (const id of currentIds.value)
      expandedState.value[id] = { show: newShow }
  }

  function toggle(id: CategoryId) {
    expandedState.value[id] = { show: !expandedState.value[id]?.show }
  }

  function isExpanded(id: CategoryId) {
    return expandedState.value[id]?.show ?? false
  }

  return {
    folderIcon,
    isAllExpanded,
    isAnyExpanded,
    isExpanded,
    toggle,
    toggleAll,
  }
}
