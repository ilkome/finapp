import type { CategoryId, CategoryItem } from '~/components/categories/types'
import type { FilterExtras } from '~/components/filter/extras'
import type { useFilter } from '~/components/filter/useFilter'
import type { WalletId, WalletItemComputed } from '~/components/wallets/types'

export type FilterProvider = ReturnType<typeof useFilter>

/** One active-filter chip, plain data: the view renders it, the container decides what removal means. */
export type FilterChip = { key: string, tooltip: string } & (
  | { category: CategoryItem, categoryId: CategoryId, kind: 'category' }
  | { icon: string, kind: 'extra', label: string, patch: Partial<FilterExtras> }
  | { kind: 'wallet', wallet: WalletItemComputed, walletId: WalletId }
)
