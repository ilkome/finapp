import { describe, expect, it } from 'vitest'

import type { ChartSeries } from '~/components/stat/types'

import { baseOption, buildChartGuideMarkLine, buildChartSeries, filterChartTooltipParams, resolveChartAverage, resolveChartGuideValues, resolveChartScale, resolveChartScaleWidth, resolveChartSeriesAverages, resolveChartTooltipPosition, sortChartTooltipParams } from '~/components/stat/chart/options'

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
    expect(result!.areaStyle).toEqual({ opacity: 0 })
    expect(result!.showSymbol).toBe(true)
    expect(result!.smooth).toBe(true)
    expect(result!.stack).toBe(false)
  })

  it('turns zero values into line gaps when configured', () => {
    const [result] = buildChartSeries([{ ...baseSeries, type: 'line' }], 'line', {
      isGradient: false,
      isShowPoints: true,
      isSkipZero: true,
      isSmooth: true,
    })

    expect(result!.data).toEqual([null, 10, null, 5])
  })

  it('the chartType prop overrides the series own type', () => {
    const [asBar] = buildChartSeries([{ ...baseSeries, type: 'line' }], 'bar')
    expect(asBar!.data).toEqual([null, 10, null, 5])

    const [asLine] = buildChartSeries([{ ...baseSeries, type: 'bar' }], 'line')
    expect(asLine!.data).toEqual([0, 10, 0, 5])
  })

  it('restores the original subtle line fill from line options', () => {
    const [result] = buildChartSeries([{ ...baseSeries, color: '#37A2FF' }], 'line', {
      isGradient: true,
      isShowPoints: true,
      isSkipZero: false,
      isSmooth: false,
    })

    expect(result).toMatchObject({
      areaStyle: { opacity: 0.1 },
      emphasis: { focus: 'series' },
      lineStyle: { width: 2 },
      showSymbol: true,
      smooth: false,
      stack: 'b',
      type: 'line',
    })
  })

  it('builds sharp lines without points or fill from line options', () => {
    const [result] = buildChartSeries([baseSeries], 'line', {
      isGradient: false,
      isShowPoints: false,
      isSkipZero: false,
      isSmooth: false,
    })

    expect(result).toMatchObject({
      areaStyle: { opacity: 0 },
      lineStyle: { width: 2 },
      showSymbol: false,
      smooth: false,
      stack: 'b',
      type: 'line',
    })
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

describe('sortChartTooltipParams', () => {
  it('sorts positive values first and then expenses by magnitude', () => {
    const params = [
      { name: 'small expense', value: -5 },
      { name: 'medium income', value: 50 },
      { name: 'large expense', value: -40 },
      { name: 'large income', value: 100 },
      { name: 'small income', value: 10 },
      { name: 'medium expense', value: -20 },
    ]

    expect(sortChartTooltipParams(params, param => param.value).map(param => param.name)).toEqual([
      'large income',
      'medium income',
      'small income',
      'large expense',
      'medium expense',
      'small expense',
    ])
  })

  it('keeps a pinned aggregate last regardless of its value', () => {
    const params = [
      { isOther: true, name: 'Other', value: 1000 },
      { isOther: false, name: 'Income', value: 100 },
      { isOther: false, name: 'Expense', value: -50 },
    ]

    expect(sortChartTooltipParams(
      params,
      param => param.value,
      param => param.isOther,
    ).map(param => param.name)).toEqual(['Income', 'Expense', 'Other'])
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

describe('resolveChartScale', () => {
  it('creates three lines from zero to the maximum for upward values', () => {
    expect(resolveChartScale([{ ...baseSeries, data: [20, 100] }])).toEqual({
      interval: 50,
      max: 100,
      min: 0,
    })
  })

  it('creates symmetric bottom, center, and top lines for signed values', () => {
    expect(resolveChartScale([{ ...baseSeries, data: [-120, 80] }])).toEqual({
      interval: 120,
      max: 120,
      min: -120,
    })
  })

  it('uses the full stacked bar height', () => {
    expect(resolveChartScale([
      { ...baseSeries, data: [60, 20] },
      { ...baseSeries, data: [40, 30] },
    ], 'bar')).toEqual({ interval: 50, max: 100, min: 0 })
  })

  it('uses the full stacked height for sharp or gradient lines', () => {
    expect(resolveChartScale([
      { ...baseSeries, data: [60, 20] },
      { ...baseSeries, data: [40, 30] },
    ], 'line', { isGradient: true, isShowPoints: true, isSkipZero: false, isSmooth: true })).toEqual({ interval: 50, max: 100, min: 0 })

    expect(resolveChartScale([
      { ...baseSeries, data: [60, 20] },
      { ...baseSeries, data: [40, 30] },
    ], 'line', { isGradient: false, isShowPoints: false, isSkipZero: false, isSmooth: false })).toEqual({ interval: 50, max: 100, min: 0 })
  })

  it('reserves less space for short labels', () => {
    expect(resolveChartScaleWidth({ max: 5, min: 0 }))
      .toBeLessThan(resolveChartScaleWidth({ max: 128000, min: -128000 }))
  })

  it('replaces the center guide when the average is close', () => {
    expect(buildChartGuideMarkLine({ max: 120, min: 0 }, 65).data).toEqual([
      { yAxis: 0 },
      {
        label: { color: 'var(--ui-text-dimmed)', opacity: 1 },
        lineStyle: { color: 'var(--ui-text-dimmed)', opacity: 1 },
        yAxis: 65,
      },
      { yAxis: 120 },
    ])
  })

  it('keeps the center guide when the average is far from it', () => {
    expect(resolveChartGuideValues({ max: 120, min: 0 }, 90)).toEqual([0, 60, 90, 120])
  })
})

describe('resolveChartAverage', () => {
  it('calculates a visible series average', () => {
    expect(resolveChartAverage([{ ...baseSeries, averageMode: 'series', data: [20, 40] }])).toBe(30)
  })

  it('calculates separate visible averages for spending and income series', () => {
    expect(resolveChartSeriesAverages([
      { ...baseSeries, averageMode: 'series', data: [20, 40], name: 'spending' },
      { ...baseSeries, averageMode: 'series', data: [100, 200], name: 'income' },
    ])).toEqual([30, 150])
  })

  it('calculates a visible stacked category average', () => {
    expect(resolveChartAverage([
      { ...baseSeries, averageMode: 'stack', data: [20, 40], icon: 'lucide:a' },
      { ...baseSeries, data: [10, 30], icon: 'lucide:b' },
    ])).toBe(50)
  })
})
