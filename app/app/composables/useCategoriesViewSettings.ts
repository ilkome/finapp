import { useStorage } from '@vueuse/core'

import { useCategoriesIconStyle } from '~/components/categories/useCategoriesIconStyle'
import { useCategoriesLayout } from '~/composables/useCategoriesLayout'

// How category lists look, shared by the categories page and every category-selection sheet.
export function useCategoriesViewSettings() {
  const childrenView = useStorage<'grid' | 'list'>('finapp.categoriesView', 'list', localStorage, { mergeDefaults: true })
  const backgroundType = useStorage<'category' | 'none' | 'standard'>('finapp.categoriesBackgroundType', 'standard', localStorage, { mergeDefaults: true })
  // The "none" option is gone; a device that saved it falls back to the default.
  if (backgroundType.value === 'none')
    backgroundType.value = 'standard'
  const isShowChildrenCount = useStorage<boolean>('finapp.categoriesShowChildrenCount', true, localStorage, { mergeDefaults: true })

  return {
    backgroundType,
    childrenView,
    isRoundIcon: useCategoriesIconStyle(),
    isShowChildrenCount,
    layout: useCategoriesLayout(),
  }
}
