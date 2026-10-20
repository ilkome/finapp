import { useStorage } from '@vueuse/core'

import type { CategoryId } from '~/components/categories/types'
import type { WalletId } from '~/components/wallets/types'

import { LAYOUT_STORAGE_KEYS } from '~/components/layout/constants'

export function useSidebarListsVisibility() {
  return {
    categories: useStorage(LAYOUT_STORAGE_KEYS.showSidebarCategories, true),
    wallets: useStorage(LAYOUT_STORAGE_KEYS.showSidebarWallets, true),
  }
}

// Empty means automatic: recent wallets, favorite and recent categories. Order is the sidebar order.
export function useSidebarWalletIds() {
  return useStorage<WalletId[]>(LAYOUT_STORAGE_KEYS.sidebarWalletIds, [])
}

export function useSidebarCategoryIds() {
  return useStorage<CategoryId[]>(LAYOUT_STORAGE_KEYS.sidebarCategoryIds, [])
}
