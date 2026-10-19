import type { Range } from '~~/utils/date/types'

import { addCivilMonths, lastDayOfMonthCivil, startOfMonthCivil } from '~~/utils/date/civil'

import type { CategoryId } from '~/components/categories/types'
import type { TrnItem, Trns } from '~/components/trns/types'
import type { ToBase } from '~/components/wallets/analytics/balanceHistory'
import type { AmountMode, RegularOverride } from '~/components/wallets/analytics/forecastSettings'
import type { WalletId, Wallets } from '~/components/wallets/types'

/** Interest and fines are paid through the loan payment, so counting them here would count them twice. */
const SKIPPED_CATEGORY_IDS = new Set<CategoryId>(['loan_fine', 'loan_interest'])

export type RegularCategory = {
  /** Monthly amount the forecast uses. */
  amount: number
  categoryId: CategoryId
  detectedAmount: number
  isAuto: boolean
  isRegular: boolean
  monthly: number[]
  monthsWithSpending: number
  override?: RegularOverride
}

/** The `count` full months before the month of `today`, oldest first. */
export function previousMonths(today: number, count: number): Range[] {
  const current = startOfMonthCivil(today)
  return Array.from({ length: count }, (_, index) => {
    const start = addCivilMonths(current, index - count)
    return { end: lastDayOfMonthCivil(start), start }
  })
}

export function currentMonth(today: number): Range {
  const start = startOfMonthCivil(today)
  return { end: lastDayOfMonthCivil(start), start }
}

type SumParams = {
  excludedCategoryIds: ReadonlySet<CategoryId>
  months: Range[]
  /** Folds a category into the one it is counted under (its parent when grouping by parent). */
  rollUp?: (categoryId: CategoryId) => CategoryId
  toBase: ToBase
  trnsItems: Trns
  /** Wallets whose trns count; every wallet when absent. */
  walletIds?: ReadonlySet<WalletId>
  walletsItems: Wallets
}

/** The wallet of a counted expense or income; undefined for a trn the forecast leaves out. */
function countedWalletId(trn: TrnItem, params: SumParams): WalletId | undefined {
  if (trn.type !== 'expense' && trn.type !== 'income')
    return undefined
  const walletId = trn.type === 'expense' ? trn.fromWalletId : trn.toWalletId
  if (!walletId || !params.walletsItems[walletId] || (params.walletIds && !params.walletIds.has(walletId)))
    return undefined
  if (!trn.categoryId || params.excludedCategoryIds.has(trn.categoryId))
    return undefined
  return walletId
}

function monthIndex(months: Range[], date: number): number {
  return months.findIndex(month => date >= month.start && date <= month.end)
}

/** Base-currency expense per category and month, aligned with `months`. */
export function monthlyCategorySpending(params: SumParams): Map<CategoryId, number[]> {
  const result = new Map<CategoryId, number[]>()
  for (const trn of Object.values(params.trnsItems)) {
    const walletId = trn.type === 'expense' ? countedWalletId(trn, params) : undefined
    if (!walletId || SKIPPED_CATEGORY_IDS.has(trn.categoryId!))
      continue
    const index = monthIndex(params.months, trn.date)
    if (index < 0)
      continue
    const categoryId = params.rollUp?.(trn.categoryId!) ?? trn.categoryId!
    const data = result.get(categoryId) ?? Array.from<number>({ length: params.months.length }).fill(0)
    data[index]! += params.toBase(trn.fromAmount!, params.walletsItems[walletId]!.currencyCode)
    result.set(categoryId, data)
  }
  for (const [categoryId, data] of result)
    result.set(categoryId, data.map(value => Math.round(value)))
  return result
}

/** Base-currency income per month, aligned with `months`. */
export function monthlyIncome(params: SumParams): number[] {
  const result = Array.from<number>({ length: params.months.length }).fill(0)
  for (const trn of Object.values(params.trnsItems)) {
    const walletId = trn.type === 'income' ? countedWalletId(trn, params) : undefined
    if (!walletId)
      continue
    const index = monthIndex(params.months, trn.date)
    if (index >= 0)
      result[index]! += params.toBase(trn.toAmount!, params.walletsItems[walletId]!.currencyCode)
  }
  return result.map(value => Math.round(value))
}

/** A typical month of `values` in whole minor units; zero months count, so a one-off purchase does not look monthly. */
export function typicalAmount(values: number[], mode: AmountMode): number {
  if (!values.length)
    return 0
  if (mode === 'last')
    return values.at(-1)!
  if (mode === 'max')
    return Math.max(...values)
  if (mode === 'average')
    return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length)
  const sorted = values.toSorted((a, b) => a - b)
  const middle = sorted.length >> 1
  return sorted.length % 2 ? sorted[middle]! : Math.round((sorted[middle - 1]! + sorted[middle]!) / 2)
}

/** Every category with spending in the window, regular or not, plus the manually included ones; largest first. */
export function detectRegular(params: {
  amountMode: AmountMode
  minMonths: number
  monthly: Map<CategoryId, number[]>
  overrides: Record<CategoryId, RegularOverride>
  windowMonths: number
}): RegularCategory[] {
  const { amountMode, monthly, overrides, windowMonths } = params
  const minMonths = Math.min(params.minMonths, windowMonths)
  const ids = new Set([...monthly.keys(), ...Object.keys(overrides).filter(id => overrides[id]!.state === 'include')])

  return [...ids].map((categoryId) => {
    const values = monthly.get(categoryId) ?? Array.from<number>({ length: windowMonths }).fill(0)
    const monthsWithSpending = values.filter(value => value > 0).length
    const isAuto = monthsWithSpending >= minMonths
    const override = overrides[categoryId]
    const detectedAmount = typicalAmount(values, amountMode)
    return {
      amount: override?.amount ?? detectedAmount,
      categoryId,
      detectedAmount,
      isAuto,
      isRegular: override?.state ? override.state === 'include' : isAuto,
      monthly: values,
      monthsWithSpending,
      override,
    }
  }).sort((a, b) => Number(b.isRegular) - Number(a.isRegular) || b.amount - a.amount)
}
