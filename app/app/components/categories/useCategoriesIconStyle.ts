import { useStorage } from '@vueuse/core'

/**
 * Global icon style for category rows: round (colored circle) or square (plain colored icon).
 * One setting shared by the categories page and every category-selection sheet - configured
 * from the categories page, mirroring the equivalent stat page option.
 */
export function useCategoriesIconStyle() {
  return useStorage<boolean>('finapp.categoriesIsRoundIcon', true, localStorage, {
    mergeDefaults: true,
  })
}
