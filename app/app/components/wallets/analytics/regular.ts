import type { Range } from '~~/utils/date/types'

import { mean } from 'es-toolkit'
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
  /** Wallets whose income counts; `walletIds` when absent. */
  incomeWalletIds?: ReadonlySet<WalletId>
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
  const scope = trn.type === 'income' ? params.incomeWalletIds ?? params.walletIds : params.walletIds
  if (!walletId || !params.walletsItems[walletId] || (scope && !scope.has(walletId)))
    return undefined
  if (!trn.categoryId || params.excludedCategoryIds.has(trn.categoryId))
    return undefined
  return walletId
}

/** Index of the month holding `date`; `months` are ascending and do not overlap. */
function monthIndex(months: Range[], date: number): number {
  let low = 0
  let high = months.length - 1
  while (low <= high) {
    const middle = (low + high) >> 1
    const month = months[middle]!
    if (date < month.start)
      high = middle - 1
    else if (date > month.end)
      low = middle + 1
    else
      return middle
  }
  return -1
}

export type MonthlySums = {
  /** Base-currency income per month. */
  income: number[]
  /** Every income of a month with its civil day, for the pay-day detection. */
  incomeEntries: { amount: number, date: number }[][]
  /** Base-currency expense per category and month. */
  spending: Map<CategoryId, number[]>
}

/** Expense per category and income per month in one pass over the trns, aligned with `months`. */
/** Wallets that received counted income in `months` but are outside `startWalletIds`, the largest first. */
export function incomeOutsideStart(params: SumParams, startWalletIds: ReadonlySet<WalletId>): WalletId[] {
  const totals = new Map<WalletId, number>()
  const scope = { ...params, incomeWalletIds: params.walletIds }
  for (const trn of Object.values(params.trnsItems)) {
    const walletId = trn.type === 'income' ? countedWalletId(trn, scope) : undefined
    if (!walletId || startWalletIds.has(walletId) || monthIndex(params.months, trn.date) < 0)
      continue
    totals.set(walletId, (totals.get(walletId) ?? 0) + params.toBase(trn.toAmount!, params.walletsItems[walletId]!.currencyCode))
  }
  return [...totals].sort((a, b) => b[1] - a[1]).map(([id]) => id)
}

export function monthlySums(params: SumParams): MonthlySums {
  const length = params.months.length
  const spending = new Map<CategoryId, number[]>()
  const income = Array.from<number>({ length }).fill(0)
  const incomeEntries = Array.from({ length }, () => [] as { amount: number, date: number }[])
  for (const trn of Object.values(params.trnsItems)) {
    const walletId = countedWalletId(trn, params)
    if (!walletId || (trn.type === 'expense' && SKIPPED_CATEGORY_IDS.has(trn.categoryId!)))
      continue
    const index = monthIndex(params.months, trn.date)
    if (index < 0)
      continue
    const currency = params.walletsItems[walletId]!.currencyCode
    if (trn.type === 'income') {
      const amount = params.toBase(trn.toAmount!, currency)
      income[index]! += amount
      incomeEntries[index]!.push({ amount: Math.round(amount), date: trn.date })
      continue
    }
    const categoryId = params.rollUp?.(trn.categoryId!) ?? trn.categoryId!
    let data = spending.get(categoryId)
    if (!data) {
      data = Array.from<number>({ length }).fill(0)
      spending.set(categoryId, data)
    }
    data[index]! += params.toBase(trn.fromAmount!, currency)
  }
  for (const [categoryId, data] of spending)
    spending.set(categoryId, data.map(value => Math.round(value)))
  return { income: income.map(value => Math.round(value)), incomeEntries, spending }
}

/** The sums of `months.slice(start, end)`. */
export function sliceMonthlySums(sums: MonthlySums, start: number, end?: number): MonthlySums {
  return {
    income: sums.income.slice(start, end),
    incomeEntries: sums.incomeEntries.slice(start, end),
    spending: new Map([...sums.spending]
      .map(([categoryId, data]) => [categoryId, data.slice(start, end)] as const)
      .filter(([, data]) => data.some(value => value !== 0))),
  }
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
    return Math.round(mean(values))
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
