import type { Period } from '~~/utils/date/types'

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

const compactFormatter = new Intl.NumberFormat('en', { notation: 'compact' })

export function formatCompactChartAmount(amount: number) {
  return compactFormatter.format(amount)
}

const amountFormatters = new Map<string, Intl.NumberFormat>()

export function formatChartAmount(amount: number, locale = 'en') {
  let formatter = amountFormatters.get(locale)
  if (!formatter) {
    formatter = new Intl.NumberFormat(locale, {
      maximumFractionDigits: 0,
      minimumFractionDigits: 0,
    })
    amountFormatters.set(locale, formatter)
  }
  return formatter.format(amount)
}
