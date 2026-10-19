import type { TrnId, TrnItem, TrnsViewType, TrnType } from '~/components/trns/types'

type TypeCounts = Record<TrnType, number>

export function matchesTrnViewType(trn: TrnItem | undefined, filterBy: TrnsViewType | 'all'): boolean {
  return !!trn && (filterBy === 'all' || trn.type === filterBy)
}

export function getTypeCounts(trnsIds: TrnId[], items: Record<TrnId, TrnItem> | null | undefined): TypeCounts {
  const counts: TypeCounts = { adjustment: 0, expense: 0, income: 0, transfer: 0 }
  for (const id of trnsIds) {
    const trn = items?.[id]
    if (trn)
      counts[trn.type]++
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
