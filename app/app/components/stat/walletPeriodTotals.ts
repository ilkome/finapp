import type { CategoryId } from '~/components/categories/types'
import type { TrnId, Trns } from '~/components/trns/types'
import type { WalletId } from '~/components/wallets/types'

import { sortCategoriesByAmount } from '~/components/stat/categories/collectAndGroup'

export function getWalletPeriodTotals(options: {
  excludedCategoryIds?: ReadonlySet<CategoryId>
  trnsIds: readonly TrnId[]
  trnsItems: Trns
}): Partial<Record<WalletId, number>> {
  const totals: Partial<Record<WalletId, number>> = {}

  for (const id of options.trnsIds) {
    const trn = options.trnsItems[id]
    if (!trn?.categoryId || options.excludedCategoryIds?.has(trn.categoryId))
      continue

    if (trn.type === 'expense' && trn.fromWalletId)
      totals[trn.fromWalletId] = (totals[trn.fromWalletId] ?? 0) - (trn.fromAmount ?? 0)
    else if (trn.type === 'income' && trn.toWalletId)
      totals[trn.toWalletId] = (totals[trn.toWalletId] ?? 0) + (trn.toAmount ?? 0)
  }

  return totals
}

export function sortWalletIdsByPeriodTotal(
  walletIds: readonly WalletId[],
  totals: Partial<Record<WalletId, number>>,
): WalletId[] {
  return walletIds
    .map(id => ({ id, value: totals[id] ?? 0 }))
    .sort(sortCategoriesByAmount)
    .map(item => item.id)
}
