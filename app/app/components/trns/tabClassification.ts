import type { TrnId, TrnItem, TrnsViewType } from '~/components/trns/types'

import { TrnType } from '~/components/trns/types'

type TypeCounts = { adjustment: number, expense: number, income: number, transfer: number }

export function getTypeCounts(trnsIds: TrnId[], items: Record<TrnId, TrnItem> | null | undefined): TypeCounts {
  const counts: TypeCounts = { adjustment: 0, expense: 0, income: 0, transfer: 0 }
  for (const id of trnsIds) {
    const trn = items?.[id]
    if (!trn)
      continue
    if (trn.categoryId === 'adjustment') {
      counts.adjustment++
      continue
    }
    if (trn.categoryId === 'transfer') {
      counts.transfer++
      continue
    }
    if (trn.type === TrnType.Expense)
      counts.expense++
    else if (trn.type === TrnType.Income)
      counts.income++
  }
  return counts
}

export function getFilteredByTypeIds(
  trnsIds: TrnId[],
  items: Record<TrnId, TrnItem> | null | undefined,
  filterBy: TrnsViewType | 'all',
  selectedType: TrnType | undefined,
): TrnId[] {
  if (filterBy === 'all')
    return trnsIds ?? []

  return (trnsIds ?? []).filter((id) => {
    const trn = items?.[id]
    if (filterBy === 'adjustment')
      return trn?.categoryId === 'adjustment'
    if (filterBy === 'transfer')
      return trn?.categoryId === 'transfer'
    return trn?.categoryId !== 'transfer' && trn?.type === selectedType
  })
}
