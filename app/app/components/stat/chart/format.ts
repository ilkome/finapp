import type { Period } from '~~/utils/date/types'

import { formatByLocale, formatDateWithOptionalYear } from '~~/utils/date/civil'

import type { LocaleSlug } from '~/components/locale/types'
import type { SeriesSlug } from '~/components/stat/types'

export function resolveChartValueType(showValueType: boolean | undefined, value: number | null): SeriesSlug | undefined {
  if (!showValueType || !value)
    return undefined
  return value < 0 ? 'expense' : 'income'
}

export function resolveChartTooltipAmount(value: number, valueType: SeriesSlug | undefined): number {
  return valueType === 'expense' ? -Math.abs(value) : value
}

export function getFormatForChart(periodName: Period) {
  switch (periodName) {
    case 'day':
    case 'week':
      return 'd MMM'
    case 'month':
      return 'MMM'
    case 'year':
      return 'yyyy'
  }
}

export function getTooltipFormatForChart(periodName: Period) {
  return periodName === 'month' ? 'LLLL' : getFormatForChart(periodName)
}

export function formatChartTooltipLabel(date: number, period: Period, locale: LocaleSlug) {
  const formatter = getTooltipFormatForChart(period)
  return period === 'year'
    ? formatByLocale(date, formatter, locale)
    : formatDateWithOptionalYear(date, formatter, locale)
}

export function formatChartAxisLabel(
  date: number,
  previousDate: number | undefined,
  period: Period,
  locale: LocaleSlug,
) {
  const label = formatByLocale(date, getFormatForChart(period), locale)
  if (period === 'year' || previousDate === undefined)
    return label

  const year = formatByLocale(date, 'yyyy', locale)
  const previousYear = formatByLocale(previousDate, 'yyyy', locale)
  return year === previousYear ? label : `${year}\n${label}`
}

const compactFormatter = new Intl.NumberFormat('en', { notation: 'compact' })

export function formatCompactChartAmount(amount: number | string | undefined) {
  // echarts reports empty datapoints as undefined / '-'; Intl renders those as "не число".
  const n = Number(amount)
  return compactFormatter.format(Number.isFinite(n) ? n : 0)
}

const amountFormatters = new Map<string, Intl.NumberFormat>()

export function formatChartAmount(amount: number | string | undefined, locale = 'en') {
  let formatter = amountFormatters.get(locale)
  if (!formatter) {
    formatter = new Intl.NumberFormat(locale, {
      maximumFractionDigits: 0,
      minimumFractionDigits: 0,
    })
    amountFormatters.set(locale, formatter)
  }
  // echarts reports empty datapoints as undefined / '-'; Intl renders those as "не число".
  const n = Number(amount)
  return formatter.format(Number.isFinite(n) ? n : 0)
}
