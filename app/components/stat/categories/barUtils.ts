type MaxCategoryValues = {
  expense: number
  income: number
}

/**
 * Compute bar style for category proportional display.
 * Used in Vertical (height) and Line (width) category views.
 */
export function computeBarStyle(
  value: number,
  color: string | undefined,
  maxCategoryValues: MaxCategoryValues,
  dimension: 'height' | 'width',
) {
  if (!value || value === 0)
    return

  const isIncome = value > 0
  const reference = isIncome ? maxCategoryValues.income : maxCategoryValues.expense

  return {
    backgroundColor: color,
    [dimension]: `${(Math.abs(value) / Math.abs(reference)) * 100}%`,
  }
}

/**
 * Format amount with K/M abbreviations for compact display.
 */
export function formatCompactAmount(value: number): string {
  const abs = Math.abs(value)
  const sign = value > 0 ? '' : '-'

  if (abs >= 1000000)
    return `${(value / 1000000).toFixed(2)}M`
  if (abs >= 10000)
    return `${sign}${(abs / 1000).toFixed()}K`
  if (abs > 999)
    return `${sign}${(abs / 1000).toFixed(1)}K`

  return `${value.toFixed()}`
}
