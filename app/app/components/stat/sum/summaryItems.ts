import type { TotalReturns } from '~/components/amount/getTotal'
import type { SeriesSlugSelected } from '~/components/stat/types'

export type StatSummaryItem = {
  amount: number
  isActive: boolean
  type: SeriesSlugSelected
}

export function buildStatSummaryItems(
  total: Pick<TotalReturns, 'expense' | 'income' | 'net'>,
  filteredType: SeriesSlugSelected,
): StatSummaryItem[] {
  const hasBothTypes = total.expense !== 0 && total.income !== 0
  return [
    { amount: -total.expense, isActive: filteredType === 'expense', type: 'expense' as const },
    { amount: total.income, isActive: filteredType === 'income', type: 'income' as const },
    { amount: hasBothTypes ? total.net : 0, isActive: false, type: 'net' as const },
  ].filter(item => item.amount !== 0)
}
