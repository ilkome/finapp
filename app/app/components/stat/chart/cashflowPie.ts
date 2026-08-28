import type { TotalReturns } from '~/components/amount/getTotal'
import type { CategoryPieDatum } from '~/components/stat/chart/categoryBreakdown'

import { seriesOptions } from '~/components/stat/chart/options'

export function hideSingleColorPie(data: CategoryPieDatum[]): CategoryPieDatum[] {
  return new Set(data.map(item => item.color)).size > 1 ? data : []
}

export function buildCashflowPieData(total: Pick<TotalReturns, 'expense' | 'income'>): CategoryPieDatum[] {
  return [
    { color: seriesOptions.expense.color as string, value: Math.abs(total.expense) },
    { color: seriesOptions.income.color as string, value: Math.abs(total.income) },
  ].filter(item => item.value > 0)
}
