import type { TrnId, TrnItem, TrnsViewType } from '~/components/trns/types'

import { TrnType } from '~/components/trns/types'

type TypeCounts = { adjustment: number, expense: number, income: number, transfer: number }

export function matchesTrnViewType(trn: TrnItem | undefined, filterBy: TrnsViewType | 'all'): boolean {
  if (filterBy === 'all')
    return !!trn
  if (filterBy === 'adjustment')
    return trn?.categoryId === 'adjustment'
  if (filterBy === 'transfer')
    return trn?.categoryId === 'transfer'
  if (filterBy === 'expense')
    return trn?.categoryId !== 'transfer' && trn?.type === TrnType.Expense
  return trn?.categoryId !== 'transfer' && trn?.type === TrnType.Income
}

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
    if (!matchesTrnViewType(items?.[id], filterBy))
      return false
    if (filterBy === 'expense' || filterBy === 'income')
      return items?.[id]?.type === selectedType
    return true
  })
}
