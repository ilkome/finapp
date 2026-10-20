import type { Range } from '~~/utils/date/types'

import type { TotalReturns } from '~/components/amount/getTotal'
import type { TrnId, Trns } from '~/components/trns/types'
import type { ToBase } from '~/components/wallets/analytics/balanceHistory'
import type { WalletId, Wallets } from '~/components/wallets/types'

import { bucketTrnsByIntervals } from '~/components/stat/intervals'
import { isCreditProduct } from '~/components/wallets/types'

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

/**
 * Money sent from in-scope wallets that are not credit products into credit products, per interval: loan and card
 * payments. Net already counts them as saved, so this says how much of it went to the bank.
 */
export function debtPaymentsPoints(params: {
  intervals: Range[]
  toBaseAt: (index: number) => ToBase
  trnsIds: TrnId[]
  trnsItems: Trns
  walletIds: ReadonlySet<WalletId>
  wallets: Wallets
}): number[] {
  const { intervals, toBaseAt, trnsIds, trnsItems, walletIds, wallets } = params
  const result = intervals.map(() => 0)
  for (const id of trnsIds) {
    const trn = trnsItems[id]
    if (trn?.type !== 'transfer' || !trn.fromWalletId || !trn.toWalletId || trn.fromAmount === undefined)
      continue
    const from = wallets[trn.fromWalletId]
    if (!from || !walletIds.has(trn.fromWalletId) || isCreditProduct(from.type) || !isCreditProduct(wallets[trn.toWalletId]?.type))
      continue
    const index = intervals.findIndex(interval => trn.date >= interval.start && trn.date <= interval.end)
    if (index >= 0)
      result[index]! += toBaseAt(index)(trn.fromAmount, from.currencyCode)
  }
  return result.map(Math.round)
}

/**
 * Expense per interval split into fixed (regular categories and loan interest and fines, which the regular
 * detection never sees) and flexible: the rest, the part a user can act on.
 */
export function splitExpense(params: {
  computeTotal: (ids: TrnId[], index: number) => TotalReturns
  expense: number[]
  intervals: Range[]
  isFixedCategory: (categoryId: string) => boolean
  trnsIds: TrnId[]
  trnsItems: Trns
}): { fixed: number[], flexible: number[] } {
  const { computeTotal, expense, intervals, isFixedCategory, trnsIds, trnsItems } = params
  const fixedIds = trnsIds.filter((id) => {
    const trn = trnsItems[id]
    return trn?.type === 'expense' && !!trn.categoryId && (INTEREST_CATEGORY_IDS.has(trn.categoryId) || isFixedCategory(trn.categoryId))
  })
  const fixed = cashflowPoints({ computeTotal, intervals, trnsIds: fixedIds, trnsItems }).expense
  return { fixed, flexible: expense.map((value, index) => value - fixed[index]!) }
}
