import type { ComputedRef } from 'vue'

import { useStorage } from '@vueuse/core'

import type { Categories, CategoryId } from '~/components/categories/types'
import type { CategoryWithData } from '~/components/stat/types'

type CategoryState = { show: boolean }
type CategoriesState = Record<CategoryId, CategoryState>

function createInitialState(categories: Categories): CategoriesState {
  return Object.keys(categories).reduce((acc, id) => {
    acc[id] = { show: false }
    return acc
  }, {} as CategoriesState)
}

export function useCategoriesExpanded(
  storageKey: string,
  storeCategories: Categories,
  categoriesWithData: ComputedRef<CategoryWithData[]>,
) {
  const expandedState = useStorage<CategoriesState>(
    `statCategoriesOpened1${storageKey}`,
    createInitialState(storeCategories),
  )

  const currentState = computed(() =>
    categoriesWithData.value.reduce((acc, cat) => {
      acc[cat.id] = { show: expandedState.value[cat.id]?.show ?? false }
      return acc
    }, {} as CategoriesState),
  )

  const isAllExpanded = computed(() => Object.values(currentState.value).every(c => c.show))
  const isAnyExpanded = computed(() => Object.values(currentState.value).some(c => c.show))

  const folderIcon = computed(() => {
    if (isAllExpanded.value)
      return 'lucide:folder-open'
    if (isAnyExpanded.value)
      return 'lucide:folder-open-dot'
    return 'lucide:folder'
  })

  function toggleAll() {
    const newShow = !isAnyExpanded.value
    Object.keys(currentState.value).forEach((id) => {
      expandedState.value[id] = { show: newShow }
    })
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
