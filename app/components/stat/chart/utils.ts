export function markArea(value: number) {
  return {
    data: [[{ xAxis: `${value}` }, { xAxis: `${value}` }]],
    itemStyle: { color: 'var(--chart-selected)', opacity: 1 },
  }
}

export function setChartXAxis(categories: number[]) {
  return {
    data: categories,
    type: 'category',
  }
}

export function getCompactAmount(amount: number) {
  return Intl.NumberFormat('en', { notation: 'compact' }).format(amount)
}

export function getLocalAmount(amount: number) {
  return amount.toLocaleString('ru', {
    currency: 'RUB',
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
    style: 'decimal',
  })
}
