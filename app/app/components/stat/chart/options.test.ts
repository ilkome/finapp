import { describe, expect, it } from 'vitest'

import type { ChartSeries } from '~/components/stat/types'

import { buildChartSeries } from '~/components/stat/chart/options'

const baseSeries: ChartSeries = {
  data: [0, 10, 0, 5],
  name: 'expense',
  type: 'bar',
}

describe('buildChartSeries', () => {
  it('nulls zero values for bar series instead of a floored stub', () => {
    const [result] = buildChartSeries([baseSeries])
    expect(result!.data).toEqual([null, 10, null, 5])
  })

  it('keeps zero values as connected points for line series', () => {
    const [result] = buildChartSeries([{ ...baseSeries, type: 'line' }])
    expect(result!.data).toEqual([0, 10, 0, 5])
  })

  it('the chartType prop overrides the series own type', () => {
    const [asBar] = buildChartSeries([{ ...baseSeries, type: 'line' }], 'bar')
    expect(asBar!.data).toEqual([null, 10, null, 5])

    const [asLine] = buildChartSeries([{ ...baseSeries, type: 'bar' }], 'line')
    expect(asLine!.data).toEqual([0, 10, 0, 5])
  })
})
