import type { ComputedRef } from 'vue'

import { useStorage } from '@vueuse/core'

import type { CategoryId } from '~/components/categories/types'

type CategoryState = { show: boolean }
type CategoriesState = Record<CategoryId, CategoryState>

export function useCategoriesExpanded(
  storageKey: string,
  currentIds: ComputedRef<CategoryId[]>,
  options: { persistDefault?: boolean } = {},
) {
  const expandedState = useStorage<CategoriesState>(
    `categoriesOpened:${storageKey}`,
    {} as CategoriesState,
  )
  const defaultExpanded = options.persistDefault
    ? useStorage(`categoriesOpenedDefault:${storageKey}`, false)
    : ref(false)

  function isExpanded(id: CategoryId) {
    return expandedState.value[id]?.show ?? defaultExpanded.value
  }

  const isAllExpanded = computed(() =>
    currentIds.value.length > 0
    && currentIds.value.every(isExpanded),
  )
  const isAnyExpanded = computed(() =>
    currentIds.value.some(isExpanded),
  )

  const folderIcon = computed(() => {
    if (isAllExpanded.value)
      return 'lucide:folder-open'
    if (isAnyExpanded.value)
      return 'lucide:folder-open-dot'
    return 'lucide:folder'
  })

  function toggleAll() {
    if (options.persistDefault) {
      const show = !isAllExpanded.value
      expandedState.value = {}
      defaultExpanded.value = show
      return
    }

    const show = !isAnyExpanded.value
    for (const id of currentIds.value)
      expandedState.value[id] = { show }
  }

  function toggle(id: CategoryId) {
    expandedState.value[id] = { show: !isExpanded(id) }
  }

  function reset(show = false) {
    expandedState.value = {}
    defaultExpanded.value = show
  }

  return {
    defaultExpanded,
    folderIcon,
    isAllExpanded,
    isAnyExpanded,
    isExpanded,
    reset,
    toggle,
    toggleAll,
  }
}
