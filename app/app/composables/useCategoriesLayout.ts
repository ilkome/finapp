import { useStorage } from '@vueuse/core'

export type CategoriesLayout = 'columns' | 'list'

// One layout for every category list (the categories page and the transaction form sheet).
export function useCategoriesLayout() {
  return useStorage<CategoriesLayout>('finapp.categoriesLayout', 'columns', localStorage, { mergeDefaults: true })
}
