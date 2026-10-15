import { useStorage } from '@vueuse/core'

/** The categories page and the selection sheets (transaction form, filters) keep their own view settings. */
export type CategoriesViewScope = 'form' | 'page'

export function useCategoriesViewSettings(scope: CategoriesViewScope = 'page') {
  const key = (name: string) => scope === 'page' ? `finapp.${name}` : `finapp.${name}.${scope}`
  const childrenView = useStorage<'grid' | 'list'>(key('categoriesView'), 'list', localStorage, { mergeDefaults: true })
  const backgroundType = useStorage<'category' | 'none' | 'standard'>(key('categoriesBackgroundType'), 'standard', localStorage, { mergeDefaults: true })
  // The "none" option is gone; a device that saved it falls back to the default.
  if (backgroundType.value === 'none')
    backgroundType.value = 'standard'

  return {
    backgroundType,
    childrenView,
    isRoundIcon: useStorage<boolean>(key('categoriesIsRoundIcon'), false, localStorage, { mergeDefaults: true }),
    isShowChildrenCount: useStorage<boolean>(key('categoriesShowChildrenCount'), true, localStorage, { mergeDefaults: true }),
  }
}
