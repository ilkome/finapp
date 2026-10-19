import type { WalletId, WalletItemComputed, WalletsCurrencyFiltered, WalletsGroupedBy, WalletViewTypes } from '~/components/wallets/types'

import { groupingPrimary } from '~/components/wallets/grouping'
import { isCreditProduct } from '~/components/wallets/types'

export function filterWalletsByCurrency(
  wallets: Record<WalletId, WalletItemComputed>,
  groupedBy: WalletsGroupedBy,
  currencyFilter: WalletsCurrencyFiltered,
): WalletId[] {
  const ids = Object.keys(wallets)
  if (groupingPrimary(groupedBy) === 'currency' || currencyFilter === 'all')
    return ids
  return ids.filter(id => wallets[id]?.currencyCode === currencyFilter)
}

export function filterWalletsByViewType(
  walletIds: WalletId[],
  wallets: Record<WalletId, WalletItemComputed>,
  viewType: WalletViewTypes | 'total',
  showArchived = false,
): WalletId[] {
  return walletIds.filter((id) => {
    const wallet = wallets[id]
    if (!wallet)
      return false

    // The flag rows list every wallet in their sum, archived or not.
    if (viewType === 'isArchived')
      return wallet.isArchived
    if (viewType === 'isExcludedFromTotal')
      return wallet.isExcludedFromTotal

    const archivedFilter = showArchived || !wallet.isArchived

    switch (viewType) {
      case 'isWithdrawable': return wallet.isWithdrawable && !isCreditProduct(wallet.type) && archivedFilter
      case 'isAvailable': return (wallet.type === 'credit_card' || (wallet.isWithdrawable && !isCreditProduct(wallet.type))) && archivedFilter
      case 'isAvailableAll': return (isCreditProduct(wallet.type) || wallet.isWithdrawable) && archivedFilter
      case 'total': return archivedFilter
      default: return wallet.type === viewType && archivedFilter
    }
  })
}
