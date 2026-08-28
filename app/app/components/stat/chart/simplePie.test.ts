import { describe, expect, it } from 'vitest'

import type { ChartSeries } from '~/components/stat/types'

import { buildSimplePieData } from '~/components/stat/chart/simplePie'

const series: ChartSeries[] = [{
  color: 'red',
  data: [10, 20, 30, 40],
  name: 'Expense',
  type: 'bar',
}, {
  color: 'green',
  data: [5, 0, 15, 0],
  name: 'Income',
  type: 'bar',
}]

describe('buildSimplePieData', () => {
  it('aggregates every series over the visible chart window', () => {
    expect(buildSimplePieData(series, 1, 2)).toEqual([
      { color: 'red', name: 'Expense', value: 50 },
      { color: 'green', name: 'Income', value: 15 },
    ])
  })

  it('omits empty and marker-only series', () => {
    expect(buildSimplePieData([
      { data: [0, 0], name: 'Empty', type: 'line' },
      { data: [], markedArea: 'markedArea', name: 'Marker', type: 'bar' },
    ])).toEqual([])
  })

  it('preserves the signed net value for tooltip labels', () => {
    expect(buildSimplePieData([{
      data: [100, 30],
      name: 'Food',
      showValueType: true,
      type: 'bar',
      valueTypes: ['expense', 'income'],
    }])).toEqual([{
      name: 'Food',
      signedValue: -70,
      value: 70,
      valueType: 'expense',
    }])
  })

  it('keeps five largest slices and combines the rest', () => {
    const categorySeries = [10, 60, 20, 50, 30, 40, 5].map((value, index): ChartSeries => ({
      color: `color-${index}`,
      data: [value],
      name: `Category ${index}`,
      type: 'bar',
    }))

    expect(buildSimplePieData(categorySeries, 0, 0, 'Other')).toEqual([
      { color: 'color-1', name: 'Category 1', value: 60 },
      { color: 'color-3', name: 'Category 3', value: 50 },
      { color: 'color-5', name: 'Category 5', value: 40 },
      { color: 'color-4', name: 'Category 4', value: 30 },
      { color: 'color-2', name: 'Category 2', value: 20 },
      { color: 'var(--ui-text-dimmed)', icon: 'lucide:ellipsis', name: 'Other', value: 15 },
    ])
  })
})
