import type { WalletId, WalletItemComputed, WalletsCurrencyFiltered, WalletsGroupedBy, WalletViewTypes } from '~/components/wallets/types'

export function filterWalletsByCurrency(
  wallets: Record<WalletId, WalletItemComputed>,
  groupedBy: WalletsGroupedBy,
  currencyFilter: WalletsCurrencyFiltered,
): WalletId[] {
  const ids = Object.keys(wallets)
  if (groupedBy === 'currency' || currencyFilter === 'all')
    return ids
  return ids.filter(id => wallets[id]?.currency === currencyFilter)
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

    if (viewType === 'isArchived')
      return wallet.isArchived

    const archivedFilter = showArchived || !wallet.isArchived

    switch (viewType) {
      case 'isWithdrawal': return wallet.isWithdrawal && archivedFilter
      case 'isExcludeInTotal': return wallet.isExcludeInTotal && archivedFilter
      case 'isAvailable': return (wallet.type === 'credit' || wallet.isWithdrawal) && archivedFilter
      case 'total': return archivedFilter
      default: return wallet.type === viewType && archivedFilter
    }
  })
}
