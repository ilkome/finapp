import { useStorage } from '@vueuse/core'

const MENU_LABEL_VISIBILITY_KEY = 'finapp.isShowMenuLabels'

export function useMenuLabelVisibility() {
  return useStorage(MENU_LABEL_VISIBILITY_KEY, true)
}
