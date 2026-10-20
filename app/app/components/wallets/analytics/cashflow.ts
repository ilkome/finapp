import type { Range } from '~~/utils/date/types'

import type { TotalReturns } from '~/components/amount/getTotal'
import type { TrnId, Trns } from '~/components/trns/types'

import { bucketTrnsByIntervals } from '~/components/stat/intervals'

export type CashflowPoints = {
  expense: number[]
  income: number[]
  /** Loan interest and fines: ordinary expenses, so already part of `expense`. */
  interest: number[]
  net: number[]
}

const INTEREST_CATEGORY_IDS = new Set(['loan_fine', 'loan_interest'])

/** Income, expense, the interest share of the expense and net per interval; transfers and adjustments stay out. */
export function cashflowPoints(params: {
  /** `index` is the interval, so a total can use that interval's rates. */
  computeTotal: (ids: TrnId[], index: number) => TotalReturns
  intervals: Range[]
  trnsIds: TrnId[]
  trnsItems: Trns
}): CashflowPoints {
  const { computeTotal, intervals, trnsIds, trnsItems } = params
  const buckets = bucketTrnsByIntervals(trnsItems, trnsIds, intervals, computeTotal)
  const interest = buckets.map((bucket, index) => computeTotal(bucket.trnsIds.filter((id) => {
    const trn = trnsItems[id]
    return trn?.type === 'expense' && INTEREST_CATEGORY_IDS.has(trn.categoryId!)
  }), index).expense)

  return {
    expense: buckets.map(bucket => bucket.total.expense),
    income: buckets.map(bucket => bucket.total.income),
    interest,
    net: buckets.map(bucket => bucket.total.net),
  }
}
