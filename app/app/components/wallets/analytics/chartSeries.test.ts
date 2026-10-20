import { describe, expect, it } from 'vitest'

import { colors } from '~/components/color/colors'
import { seriesPalette } from '~/components/wallets/analytics/balanceHistory'
import { sparklinePoints, toChartSeries } from '~/components/wallets/analytics/chartSeries'

const one = (value: number) => [{ data: [value], name: 'x', type: 'line' as const }]

describe('toChartSeries', () => {
  it('converts minor units by the currency scale', () => {
    expect(toChartSeries(one(123450), 'RUB')[0]!.data).toEqual([1234.5])
    expect(toChartSeries(one(1500), 'JPY')[0]!.data).toEqual([1500])
    expect(toChartSeries(one(123_456_789), 'BTC')[0]!.data).toEqual([1.23456789])
  })
})

describe('seriesPalette', () => {
  it('has no grays and no repeated colors', () => {
    const grays = ['slate', 'gray', 'zinc', 'neutral', 'stone'].map(hue => colors[hue as keyof typeof colors][500])
    expect(seriesPalette.some(color => grays.includes(color))).toBe(false)
    expect(new Set(seriesPalette).size).toBe(seriesPalette.length)
  })
})

describe('sparklinePoints', () => {
  it('maps min to the bottom and max to the top inside the padding', () => {
    expect(sparklinePoints([0, 5, 10], 100, 30, 2)).toEqual([[0, 28], [50, 15], [100, 2]])
  })

  it('puts equal values on the bottom line and draws nothing under two values', () => {
    expect(sparklinePoints([3, 3], 10, 10)).toEqual([[0, 10], [10, 10]])
    expect(sparklinePoints([3], 10, 10)).toEqual([])
  })
})
