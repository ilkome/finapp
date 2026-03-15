export function createMarkAreaData(value: number): {
  data: [{ xAxis: string }, { xAxis: string }][]
  itemStyle: { color: string, opacity: number }
} {
  return {
    data: [[{ xAxis: `${value}` }, { xAxis: `${value}` }]],
    itemStyle: { color: 'var(--chart-line)', opacity: 1 },
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
