import type { ChartSeries } from '~/components/stat/types'

export type SimplePieDatum = {
  color?: string
  icon?: string
  name: string
  value: number
}

export function buildSimplePieData(
  series: ChartSeries[],
  startIndex = 0,
  endIndex = Number.POSITIVE_INFINITY,
  otherName = 'Other',
): SimplePieDatum[] {
  const data = series
    .filter(item => !item.markedArea)
    .map((item) => {
      const value = item.data
        .slice(Math.max(0, startIndex), Number.isFinite(endIndex) ? endIndex + 1 : undefined)
        .reduce((total, current) => total + (Number.isFinite(current) ? Math.abs(current) : 0), 0)

      return { color: item.color, icon: item.icon, name: item.name, value }
    })
    .filter(item => item.value > 0)

  if (data.length <= 5)
    return data.sort((a, b) => b.value - a.value)

  const sorted = data
    .filter(item => item.name !== otherName)
    .sort((a, b) => b.value - a.value)
  const highlighted = sorted.slice(0, 5)
  const otherValue = [
    ...sorted.slice(5),
    ...data.filter(item => item.name === otherName),
  ].reduce((total, item) => total + item.value, 0)

  return otherValue > 0
    ? [...highlighted, { color: 'var(--ui-text-dimmed)', icon: 'lucide:ellipsis', name: otherName, value: otherValue }]
    : highlighted
}
