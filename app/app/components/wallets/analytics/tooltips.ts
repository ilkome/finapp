import type { CurrencyCode } from '~/components/currencies/types'
import type { ChartTooltipRow } from '~/components/stat/chart/types'
import type { CashflowPoints } from '~/components/wallets/analytics/cashflow'

import { formatAmount, minorToAmount } from '~/components/amount/utils'

/** Savings rate `net / income`; undefined without income, where it means nothing. */
export function savingsRate(net: number, income: number): number | undefined {
  return income > 0 ? net / income : undefined
}

export function formatPercent(value: number | undefined): string {
  return value === undefined ? '-' : `${Math.round(value * 100)}%`
}

function formatDelta(minor: number, currencyCode: CurrencyCode) {
  return `${minor > 0 ? '+' : ''}${formatAmount(minor, currencyCode)}`
}

export function cashflowTooltipRows(params: {
  colors: Record<'expense' | 'income' | 'interest' | 'net' | 'toDebts', string>
  currencyCode: CurrencyCode
  labels: Record<'expense' | 'income' | 'interest' | 'net' | 'savingsRate' | 'toDebts', string>
  points: CashflowPoints
  toDebts: number[]
}): ChartTooltipRow[][] {
  const { colors, currencyCode, labels, points, toDebts } = params
  const row = (key: keyof typeof colors, amount: number, description?: string): ChartTooltipRow => ({
    amount: minorToAmount(amount, currencyCode),
    color: colors[key],
    description,
    key,
    name: labels[key],
  })
  return points.income.map((income, index) => {
    const net = points.net[index]!
    return [
      row('income', income),
      row('expense', -points.expense[index]!),
      ...(points.interest[index] ? [row('interest', -points.interest[index]!)] : []),
      row('net', net, `${labels.savingsRate} ${formatPercent(savingsRate(net, income))}`),
      ...(toDebts[index] ? [row('toDebts', toDebts[index]!)] : []),
    ]
  })
}

/** Each series at the point with its change since the previous one (the opening point before the first). */
export function balanceTooltipRows(params: {
  changeLabel: string
  currencyCode: CurrencyCode
  series: { color?: string, data: number[], id: string, name: string, opening?: number }[]
  total?: { color: string, name: string }
}): ChartTooltipRow[][] {
  const { changeLabel, currencyCode, series, total } = params
  const length = Math.max(0, ...series.map(item => item.data.length))
  const row = (key: string, name: string, color: string | undefined, value: number, previous: number | undefined): ChartTooltipRow => ({
    amount: minorToAmount(value, currencyCode),
    color,
    description: previous === undefined ? undefined : `${changeLabel} ${formatDelta(value - previous, currencyCode)}`,
    key,
    name,
  })
  return Array.from({ length }, (_, index) => {
    const previousOf = (item: typeof series[number]) => index ? item.data[index - 1] : item.opening
    const rows = series.map(item => row(item.id, item.name, item.color, item.data[index] ?? 0, previousOf(item)))
    if (!total || series.length < 2)
      return rows
    const sum = series.reduce((acc, item) => acc + (item.data[index] ?? 0), 0)
    const hasPrevious = series.every(item => previousOf(item) !== undefined)
    const previousSum = hasPrevious ? series.reduce((acc, item) => acc + previousOf(item)!, 0) : undefined
    return [row('total', total.name, total.color, sum, previousSum), ...rows]
  })
}

export function forecastTooltipRows(params: {
  colors: Record<'income' | 'obligations' | 'regular' | 'withIncome' | 'withoutIncome', string>
  currencyCode: CurrencyCode
  labels: Record<'income' | 'obligations' | 'regular' | 'runOut' | 'withIncome' | 'withoutIncome', string>
  months: { endWithIncome: number, endWithoutIncome: number, income: number, obligations: number, regular: number }[]
  /** Index of the month each scenario runs out in, or -1. */
  runOut: { withIncome: number, withoutIncome: number }
}): ChartTooltipRow[][] {
  const { colors, currencyCode, labels, months, runOut } = params
  const row = (key: keyof typeof colors, amount: number, description?: string): ChartTooltipRow => ({
    amount: minorToAmount(amount, currencyCode),
    color: colors[key],
    description,
    key,
    name: labels[key],
  })
  return months.map((month, index) => [
    row('withoutIncome', month.endWithoutIncome, runOut.withoutIncome === index ? labels.runOut : undefined),
    row('withIncome', month.endWithIncome, runOut.withIncome === index ? labels.runOut : undefined),
    row('regular', -month.regular),
    ...(month.obligations ? [row('obligations', -month.obligations)] : []),
    row('income', month.income),
  ])
}
