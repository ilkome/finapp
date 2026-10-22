import type { ChartSeries } from '~/components/stat/types'

import { partitionHighlightedItems } from '~/components/stat/chart/highlightedItems'

export type SimplePieDatum = {
  color?: string
  icon?: string
  name: string
  signedValue?: number
  value: number
  valueType?: 'expense' | 'income'
}

/** Index window of the visible interval keys; a missing key means the whole series on that side. */
export function resolvePieWindow(xAxisLabels: number[], startValue?: number, endValue?: number) {
  const startIndex = Math.max(0, xAxisLabels.indexOf(startValue ?? -1))
  const endIndex = xAxisLabels.indexOf(endValue ?? -1)
  return { endIndex: endIndex >= startIndex ? endIndex : Number.POSITIVE_INFINITY, startIndex }
}

export function buildSimplePieData(
  series: ChartSeries[],
  startIndex = 0,
  endIndex = Number.POSITIVE_INFINITY,
  otherName = 'Other',
  limit?: number,
): SimplePieDatum[] {
  const data = series
    .filter(item => !item.markedArea)
    .map((item) => {
      const firstIndex = Math.max(0, startIndex)
      const signedValue = item.data
        .slice(firstIndex, Number.isFinite(endIndex) ? endIndex + 1 : undefined)
        .reduce((total, current, offset) => {
          if (!Number.isFinite(current))
            return total
          const valueType = item.valueTypes?.[firstIndex + offset]
          const signedCurrent = valueType === 'expense'
            ? -Math.abs(current)
            : valueType === 'income'
              ? Math.abs(current)
              : current
          return total + signedCurrent
        }, 0)
      const value = Math.abs(signedValue)

      const base = {
        color: item.color,
        icon: item.icon,
        name: item.name,
        value,
      }
      return item.showValueType
        ? {
            ...base,
            signedValue,
            valueType: signedValue < 0 ? 'expense' as const : 'income' as const,
          }
        : base
    })
    .filter(item => item.value > 0)

  const { highlighted, remainder } = partitionHighlightedItems({
    getMagnitude: item => item.value,
    isRemainder: item => item.icon === 'lucide:ellipsis' || item.name === otherName,
    items: data,
    limit,
  })
  const otherValue = remainder.reduce((total, item) => total + item.value, 0)

  return otherValue > 0
    ? [...highlighted, { color: 'var(--ui-text-dimmed)', icon: 'lucide:ellipsis', name: otherName, value: otherValue }]
    : highlighted
}
