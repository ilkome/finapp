import { describe, expect, it } from 'vitest'

import { toChartSeries } from '~/components/wallets/analytics/chartSeries'

const one = (value: number) => [{ data: [value], name: 'x', type: 'line' as const }]

describe('toChartSeries', () => {
  it('converts minor units by the currency scale', () => {
    expect(toChartSeries(one(123450), 'RUB')[0]!.data).toEqual([1234.5])
    expect(toChartSeries(one(1500), 'JPY')[0]!.data).toEqual([1500])
    expect(toChartSeries(one(123_456_789), 'BTC')[0]!.data).toEqual([1.23456789])
  })
})
