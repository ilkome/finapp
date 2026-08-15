import { describe, expect, it } from 'vitest'

import type { ChartSeries } from '~/components/stat/types'

import { baseOption, buildChartSeries, filterChartTooltipParams, resolveChartTooltipPosition } from '~/components/stat/chart/options'

const baseSeries: ChartSeries = {
  data: [0, 10, 0, 5],
  name: 'expense',
  type: 'bar',
}

describe('buildChartSeries', () => {
  it('disables series animation while data zoom moves the viewport', () => {
    expect(baseOption?.animation).toBe(false)
  })

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

describe('filterChartTooltipParams', () => {
  it('keeps only finite non-zero values from the hovered bucket', () => {
    const params = [
      { name: 'food', value: 120 },
      { name: 'fun', value: 0 },
      { name: 'health', value: null },
      { name: 'invalid', value: Number.NaN },
      { name: 'income', value: -50 },
    ]

    expect(filterChartTooltipParams(params)).toEqual([
      { name: 'food', value: 120 },
      { name: 'income', value: -50 },
    ])
  })

  it('returns an empty list when the hovered bucket has no transactions', () => {
    expect(filterChartTooltipParams([
      { name: 'food', value: 0 },
      { name: 'income', value: null },
    ])).toEqual([])
  })
})

describe('resolveChartTooltipPosition', () => {
  it('anchors the tooltip to the chart right edge for right-side buckets', () => {
    expect(resolveChartTooltipPosition([295, 10], [300, 160])).toEqual([0, 0])
  })

  it('places the tooltip on the opposite half for left-side buckets', () => {
    expect(resolveChartTooltipPosition([80, 100], [300, 160])).toEqual([150, 0])
  })
})
