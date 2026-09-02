import { beforeAll, describe, expect, it, vi } from 'vitest'
import { computed } from 'vue'

import type { ChartSeries } from '~/components/stat/types'

vi.stubGlobal('useI18n', () => ({ t: (key: string) => key }))
vi.stubGlobal('computed', computed)

let useStatChart: typeof import('~/components/stat/chart/useStatChart').useStatChart

beforeAll(async () => {
  ;({ useStatChart } = await import('~/components/stat/chart/useStatChart'))
})

describe('withMarkArea', () => {
  it('creates an independent selected-period layer without data series', () => {
    const { withMarkArea } = useStatChart()

    expect(withMarkArea([], 123, 'bar')).toEqual([expect.objectContaining({
      data: [],
      markArea: expect.objectContaining({
        data: [[{ xAxis: '123' }, { xAxis: '123' }]],
        itemStyle: {
          borderWidth: 0,
          color: 'color-mix(in oklab, var(--ui-bg-elevated) 100%, transparent)',
          opacity: 1,
        },
      }),
      markedArea: 'markedArea',
      type: 'line',
    })])
  })

  it('does not attach the selected period to a category series', () => {
    const { withMarkArea } = useStatChart()
    const categorySeries: ChartSeries = {
      color: 'red',
      data: [10],
      name: 'Food',
      type: 'bar',
    }

    const result = withMarkArea([categorySeries], 123, 'bar')

    expect(result[0]).toBe(categorySeries)
    expect(result[0]?.markArea).toBeUndefined()
    expect(result[1]?.markedArea).toBe('markedArea')
    expect(result[1]?.data).toEqual([])
  })
})

describe('createSeriesItem', () => {
  it('uses the standard income and expense colors', () => {
    const { createSeriesItem } = useStatChart()

    expect(createSeriesItem('income', [], false).color).toBe('var(--color-income-1)')
    expect(createSeriesItem('expense', [], false).color).toBe('var(--color-expense-1)')
  })
})
