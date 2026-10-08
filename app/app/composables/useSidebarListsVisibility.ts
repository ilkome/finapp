import { useStorage } from '@vueuse/core'

export function useSidebarListsVisibility() {
  return useStorage('finapp.isShowSidebarLists', true)
}
