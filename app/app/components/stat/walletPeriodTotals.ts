import type { CategoryId } from '~/components/categories/types'
import type { TrnId, Trns } from '~/components/trns/types'
import type { WalletId } from '~/components/wallets/types'

import { isSystemCategoryId } from '~/components/categories/utils'
import { sortCategoriesByAmount } from '~/components/stat/categories/collectAndGroup'
import { TrnType } from '~/components/trns/types'

export function getWalletPeriodTotals(options: {
  excludedCategoryIds?: ReadonlySet<CategoryId>
  trnsIds: readonly TrnId[]
  trnsItems: Trns
}): Partial<Record<WalletId, number>> {
  const totals: Partial<Record<WalletId, number>> = {}

  for (const id of options.trnsIds) {
    const trn = options.trnsItems[id]
    if (!trn || trn.type === TrnType.Transfer || isSystemCategoryId(trn.categoryId))
      continue
    if (options.excludedCategoryIds?.has(trn.categoryId))
      continue

    const amount = trn.type === TrnType.Income ? trn.amount : -trn.amount
    totals[trn.walletId] = (totals[trn.walletId] ?? 0) + amount
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
