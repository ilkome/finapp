export function markArea(value: number) {
  return {
    silent: true,
    itemStyle: { opacity: 1, color: 'var(--chart-selected)' },
    data: [[{ xAxis: `${value}` }, { xAxis: `${value}` }]],
  }
}

export function setChartXAxis(categories: number[]) {
  return {
    type: 'category',
    data: categories,
  }
}

export function getCompactAmount(amount: number) {
  return Intl.NumberFormat('en', { notation: 'compact' }).format(amount)
}

export function getLocalAmount(amount: number) {
  return amount.toLocaleString('ru', {
    style: 'decimal',
    currency: 'RUB',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })
}
