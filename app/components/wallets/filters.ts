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
): WalletId[] {
  return walletIds.filter((id) => {
    const wallet = wallets[id]
    if (!wallet)
      return false

    switch (viewType) {
      case 'isWithdrawal': return wallet.isWithdrawal && !wallet.isArchived
      case 'isExcludeInTotal': return wallet.isExcludeInTotal && !wallet.isArchived
      case 'isArchived': return wallet.isArchived
      case 'isAvailable': return (wallet.type === 'credit' || wallet.isWithdrawal) && !wallet.isArchived
      case 'total': return !wallet.isArchived
      default: return wallet.type === viewType && !wallet.isArchived
    }
  })
}
