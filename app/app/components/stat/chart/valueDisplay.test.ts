import { describe, expect, it } from 'vitest'

import type { ChartSeries } from '~/components/stat/types'

import { applyChartValueDisplay } from './valueDisplay'

const series: ChartSeries[] = [{
  data: [100, -50],
  markLine: { data: [{ yAxis: 75 }] },
  name: 'Cash flow',
  type: 'bar',
  valueTypes: ['expense', 'income'],
}]

describe('applyChartValueDisplay', () => {
  it('keeps every value above the axis in magnitude mode', () => {
    expect(applyChartValueDisplay(series, 'magnitude')[0]?.data).toEqual([100, 50])
  })

  it('places expenses below and income above the axis in signed mode', () => {
    const [displayed] = applyChartValueDisplay(series, 'signed')

    expect(displayed?.data).toEqual([-100, 50])
    expect(displayed?.markLine?.data).toEqual([{ yAxis: -75 }])
  })

  it('does not mutate the source series', () => {
    applyChartValueDisplay(series, 'signed')

    expect(series[0]?.data).toEqual([100, -50])
  })
})
