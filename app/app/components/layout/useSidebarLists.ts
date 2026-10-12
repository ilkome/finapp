import { useStorage } from '@vueuse/core'

import type { CategoryId } from '~/components/categories/types'
import type { WalletId } from '~/components/wallets/types'

export function useSidebarListsVisibility() {
  return {
    categories: useStorage('finapp.isShowSidebarCategories', true),
    wallets: useStorage('finapp.isShowSidebarWallets', true),
  }
}

// Empty means automatic: recent wallets, favorite and recent categories. Order is the sidebar order.
export function useSidebarWalletIds() {
  return useStorage<WalletId[]>('finapp.sidebarWalletIds', [])
}

export function useSidebarCategoryIds() {
  return useStorage<CategoryId[]>('finapp.sidebarCategoryIds', [])
}
